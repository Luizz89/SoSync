// supabase/functions/notificar-pedido/index.ts
//
// Envia um e-mail para a equipe quando um pedido muda para 'em_cotacao'.
// Disparada por um Database Webhook (tabela pedidos, evento UPDATE).
//
// Envio via Brevo (API HTTP). Diferente do Resend de teste, o Brevo permite
// enviar de um e-mail pessoal verificado (ex.: Gmail), sem precisar de domínio.
//
// Usa as colunas de clinicas: nome, telefone, logradouro, numero,
// bairro, cidade, estado, cep. Requer as colunas marca_id, observacao
// e ordem em pedido_itens (criadas pela migration pedidos_setup.sql).

import { createClient } from 'npm:@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

// Evita que texto digitado pela clínica quebre o HTML do e-mail
const escapar = (valor: unknown) =>
  String(valor ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

// Comparação em tempo constante para o segredo do webhook
const segredoValido = (recebido: string | null) => {
  const esperado = Deno.env.get('WEBHOOK_SECRET') ?? ''
  if (!recebido || !esperado || recebido.length !== esperado.length) return false
  let diferenca = 0
  for (let i = 0; i < esperado.length; i++) {
    diferenca |= recebido.charCodeAt(i) ^ esperado.charCodeAt(i)
  }
  return diferenca === 0
}

Deno.serve(async (req) => {
  if (!segredoValido(req.headers.get('x-webhook-secret'))) {
    return new Response('Não autorizado', { status: 401 })
  }

  const payload = await req.json()
  const pedido = payload.record
  const anterior = payload.old_record

  // Só interessa a mudança para 'em_cotacao'
  if (
    payload.type !== 'UPDATE' ||
    pedido?.status !== 'em_cotacao' ||
    anterior?.status === 'em_cotacao'
  ) {
    return new Response('Ignorado', { status: 200 })
  }

  const [clinicaRes, fornecedorRes, marcaRes, itensRes] = await Promise.all([
    supabase.from('clinicas').select('*').eq('id', pedido.clinica_id).single(),
    pedido.fornecedor_id
      ? supabase.from('fornecedores').select('nome').eq('id', pedido.fornecedor_id).single()
      : Promise.resolve({ data: null, error: null }),
    pedido.marca_id
      ? supabase.from('marcas').select('nome').eq('id', pedido.marca_id).single()
      : Promise.resolve({ data: null, error: null }),
    supabase
      .from('pedido_itens')
      .select('*, marcas(nome)')
      .eq('pedido_id', pedido.id)
      .order('ordem')
  ])

  // Se alguma consulta falhar, não manda e-mail incompleto: devolve erro
  const erroConsulta =
    clinicaRes.error ?? fornecedorRes.error ?? marcaRes.error ?? itensRes.error
  if (erroConsulta) {
    console.error('Erro ao buscar dados do pedido:', erroConsulta)
    return new Response('Falha ao buscar dados do pedido', { status: 500 })
  }

  const clinica = clinicaRes.data
  const dental = fornecedorRes.data?.nome || pedido.dental_escolhida || 'Sem preferência'
  // Marca pode estar no pedido (pedidos.marca_id) ou em cada item (pedido_itens.marca_id)
  const marcaPedido = marcaRes.data?.nome ?? null
  const itens = itensRes.data ?? []

  if (itens.length === 0) {
    console.error('Pedido sem itens:', pedido.id)
    return new Response('Pedido sem itens', { status: 500 })
  }

  const nomeClinica = clinica?.nome ?? 'Clínica'
  const telefone = clinica?.telefone ?? 'não informado'
  const endereco = [
    [clinica?.logradouro, clinica?.numero].filter(Boolean).join(', '),
    clinica?.bairro,
    [clinica?.cidade, clinica?.estado].filter(Boolean).join(' - '),
    clinica?.cep ? `CEP ${clinica.cep}` : ''
  ]
    .filter(Boolean)
    .join(' • ')
  const codigo = pedido.id.slice(0, 8).toUpperCase()

  const linhasItens = itens
    .map(
      (i: any) => `
      <tr>
        <td style="padding:8px;border-bottom:1px solid #eee">${escapar(i.nome_produto)}</td>
        <td style="padding:8px;border-bottom:1px solid #eee">${escapar(i.marcas?.nome ?? marcaPedido ?? '—')}</td>
        <td style="padding:8px;border-bottom:1px solid #eee">${escapar(i.quantidade)} ${escapar(i.unidade)}</td>
        <td style="padding:8px;border-bottom:1px solid #eee">${escapar(i.observacao ?? '')}</td>
      </tr>`
    )
    .join('')

  const html = `
    <div style="font-family:Arial,sans-serif;color:#222;max-width:640px">
      <h2 style="margin:0 0 4px">Novo pedido #${codigo}</h2>
      <p style="margin:0 0 20px;color:#666">Solicitação de orçamento</p>

      <p style="margin:0 0 4px"><strong>Clínica:</strong> ${escapar(nomeClinica)}</p>
      <p style="margin:0 0 4px"><strong>Telefone:</strong> ${escapar(telefone)}</p>
      ${endereco ? `<p style="margin:0 0 4px"><strong>Endereço:</strong> ${escapar(endereco)}</p>` : ''}
      <p style="margin:0 0 20px"><strong>Dental de preferência:</strong> ${escapar(dental)}</p>

      <table style="width:100%;border-collapse:collapse;font-size:14px">
        <thead>
          <tr style="text-align:left;color:#666">
            <th style="padding:8px">Produto</th>
            <th style="padding:8px">Marca</th>
            <th style="padding:8px">Quantidade</th>
            <th style="padding:8px">Observação</th>
          </tr>
        </thead>
        <tbody>${linhasItens}</tbody>
      </table>

      ${
        pedido.observacoes
          ? `<p style="margin-top:20px"><strong>Observações da clínica:</strong><br>${escapar(pedido.observacoes)}</p>`
          : ''
      }
    </div>`

  const destinatarios = (Deno.env.get('EMAIL_DESTINO') ?? '')
    .split(',')
    .map((e) => e.trim())
    .filter(Boolean)
    .map((email) => ({ email }))

  const resposta = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': Deno.env.get('BREVO_API_KEY')!
    },
    body: JSON.stringify({
      sender: {
        name: Deno.env.get('EMAIL_REMETENTE_NOME') ?? 'SoSync',
        email: Deno.env.get('EMAIL_REMETENTE')
      },
      to: destinatarios,
      subject: `Novo pedido #${codigo} — ${nomeClinica}`,
      htmlContent: html
    })
  })

  if (!resposta.ok) {
    console.error('Erro ao enviar e-mail:', resposta.status, await resposta.text())
    return new Response('Falha ao enviar e-mail', { status: 500 })
  }

  // Marca como notificado. Pedidos em 'em_cotacao' com notificado_em nulo
  // são os que a equipe não recebeu e precisam ser conferidos.
  const { error: erroMarca } = await supabase
    .from('pedidos')
    .update({ notificado_em: new Date().toISOString() })
    .eq('id', pedido.id)

  if (erroMarca) console.error('E-mail enviado, mas falhou ao marcar notificado_em:', erroMarca)

  return new Response('E-mail enviado', { status: 200 })
})

/* ---------------------------------------------------------------------
   CONFIGURAÇÃO (uma vez só)

   1. Brevo (brevo.com): crie a conta gratuita (300 e-mails/dia).
      - Senders & IP > Senders > Add a sender: cadastre o e-mail que vai
        aparecer como remetente (pode ser Gmail) e confirme o link que
        chega nele.
      - SMTP & API > API Keys > Generate a new API key.

   2. Secrets e deploy (Supabase CLI):
        supabase secrets set BREVO_API_KEY=... \
          EMAIL_REMETENTE="email-verificado-no-brevo@exemplo.com" \
          EMAIL_REMETENTE_NOME="SoSync" \
          EMAIL_DESTINO="pessoa1@exemplo.com,pessoa2@exemplo.com" \
          WEBHOOK_SECRET="uma-string-longa-e-aleatoria"
        supabase functions deploy notificar-pedido --no-verify-jwt

   3. Webhook (Dashboard > Database > Webhooks > Create):
        Tabela: pedidos | Evento: Update
        Tipo: Supabase Edge Functions > notificar-pedido | Método: POST
        Header extra: x-webhook-secret = o mesmo valor de WEBHOOK_SECRET
--------------------------------------------------------------------- */
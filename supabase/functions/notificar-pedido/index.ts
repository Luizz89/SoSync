// supabase/functions/notificar-pedido/index.ts
//
// Envia um e-mail para a equipe quando um pedido muda para 'em_cotacao'.
// Disparada por um Database Webhook (tabela pedidos, evento UPDATE).
//
// ASSUMPTIONS A CONFERIR: a tabela clinicas tem as colunas
// nome, telefone e endereco. Se os nomes forem outros, ajuste
// as 3 linhas marcadas com "AJUSTAR".

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

Deno.serve(async (req) => {
  // Só aceita chamadas do webhook configurado por vocês
  if (req.headers.get('x-webhook-secret') !== Deno.env.get('WEBHOOK_SECRET')) {
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

  const [clinicaRes, fornecedorRes, itensRes] = await Promise.all([
    supabase.from('clinicas').select('*').eq('id', pedido.clinica_id).single(),
    pedido.fornecedor_id
      ? supabase.from('fornecedores').select('nome').eq('id', pedido.fornecedor_id).single()
      : Promise.resolve({ data: null }),
    supabase
      .from('pedido_itens')
      .select('*, marcas(nome)')
      .eq('pedido_id', pedido.id)
      .order('ordem')
  ])

  const clinica = clinicaRes.data
  const dental = fornecedorRes.data?.nome ?? 'Sem preferência'
  const itens = itensRes.data ?? []

  const nomeClinica = clinica?.nome ?? 'Clínica' // AJUSTAR
  const telefone = clinica?.telefone ?? 'não informado' // AJUSTAR
  const endereco = clinica?.endereco ?? '' // AJUSTAR
  const codigo = pedido.id.slice(0, 8).toUpperCase()

  const linhasItens = itens
    .map(
      (i: any) => `
      <tr>
        <td style="padding:8px;border-bottom:1px solid #eee">${escapar(i.nome_produto)}</td>
        <td style="padding:8px;border-bottom:1px solid #eee">${escapar(i.marcas?.nome ?? '—')}</td>
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

  const resposta = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${Deno.env.get('RESEND_API_KEY')}`
    },
    body: JSON.stringify({
      from: Deno.env.get('EMAIL_REMETENTE'),
      to: (Deno.env.get('EMAIL_DESTINO') ?? '').split(',').map((e) => e.trim()),
      subject: `Novo pedido #${codigo} — ${nomeClinica}`,
      html
    })
  })

  if (!resposta.ok) {
    console.error('Erro ao enviar e-mail:', await resposta.text())
    return new Response('Falha ao enviar e-mail', { status: 500 })
  }

  return new Response('E-mail enviado', { status: 200 })
})

/* ---------------------------------------------------------------------
   CONFIGURAÇÃO (uma vez só)

   1. Resend (resend.com): crie a conta e gere uma API key.
      Sem domínio verificado, só dá para enviar do endereço de teste
      onboarding@resend.dev e apenas para o e-mail dono da conta.

   2. Secrets e deploy (Supabase CLI):
        supabase secrets set RESEND_API_KEY=... \
          EMAIL_REMETENTE="BaixaSync <onboarding@resend.dev>" \
          EMAIL_DESTINO="email-da-equipe@exemplo.com" \
          WEBHOOK_SECRET="uma-string-longa-e-aleatoria"
        supabase functions deploy notificar-pedido --no-verify-jwt

   3. Webhook (Dashboard > Database > Webhooks > Create):
        Tabela: pedidos | Evento: Update
        Tipo: Supabase Edge Functions > notificar-pedido | Método: POST
        Header extra: x-webhook-secret = o mesmo valor de WEBHOOK_SECRET
--------------------------------------------------------------------- */
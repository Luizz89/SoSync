import { useState, useEffect } from 'react'
import { supabase } from '../config/supabase'
import { useAuth } from '../context/AuthContext'
import Layout from '../components/Layout/Layout'
import { MdOutlineAddCircleOutline, MdOutlineContentCopy } from 'react-icons/md'
import { AiOutlineDelete } from 'react-icons/ai'
import { BsCalendar3, BsBoxSeam, BsCheck2 } from 'react-icons/bs'
import { HiOutlineClipboardCheck } from 'react-icons/hi'

const STATUS = {
  rascunho:          { label: 'Rascunho',          bg: '#F3F3F3', cor: '#8A8A8A' },
  em_cotacao:        { label: 'Em Cotação',        bg: '#FFF9E6', cor: '#FFB800' },
  orcamento_enviado: { label: 'Orçamento Enviado', bg: '#E8F1FF', cor: '#3B82F6' },
  aprovado:          { label: 'Aprovado',          bg: '#E5FBF8', cor: '#00D9C0' },
  concluido:         { label: 'Concluído',         bg: '#E5FBF8', cor: '#00B8A3' },
  cancelado:         { label: 'Cancelado',         bg: '#FFF0F0', cor: '#FF6B6B' }
}

const ETAPAS = ['em_cotacao', 'orcamento_enviado', 'aprovado', 'concluido']

const MENSAGEM_STATUS = {
  em_cotacao: 'Estamos cotando seu pedido na dental. Entraremos em contato pelo telefone cadastrado.',
  orcamento_enviado: 'Entramos em contato para apresentar o orçamento. Aguardamos a sua decisão.',
  aprovado: 'Orçamento aprovado! Estamos finalizando a compra e o boleto de pagamento.',
  concluido: 'Pedido concluído.'
}

const UNIDADES = [
  { value: 'unidades', label: 'Unidades' },
  { value: 'caixas', label: 'Caixas' },
  { value: 'ampolas', label: 'Ampolas' },
  { value: 'frascos', label: 'Frascos' },
  { value: 'pares', label: 'Pares' },
  { value: 'kg', label: 'Kg' },
  { value: 'litros', label: 'Litros' }
]

const novaChave = () => `${Date.now()}-${Math.random()}`

const novoItem = (foco = false) => ({
  chave: novaChave(),
  nome_produto: '',
  marca_id: '',
  quantidade: 1,
  unidade: 'unidades',
  observacao: '',
  foco
})

const itemParaFormulario = (item) => ({
  chave: item.id,
  nome_produto: item.nome_produto || '',
  marca_id: item.marca_id || '',
  quantidade: item.quantidade || 1,
  unidade: item.unidade || 'unidades',
  observacao: item.observacao || '',
  foco: false
})

const cardStyle = {
  backgroundColor: 'white',
  borderRadius: '20px',
  padding: '24px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
}

const thStyle = {
  padding: '10px 8px',
  color: 'var(--cor-texto-secundario)',
  fontWeight: '500',
  fontSize: '12px',
  textAlign: 'left',
  whiteSpace: 'nowrap'
}

const labelStyle = {
  fontSize: '12px',
  color: 'var(--cor-texto-secundario)',
  display: 'block',
  marginBottom: '6px'
}

const botaoPrimario = {
  background: 'var(--cor-primaria)',
  color: 'white',
  border: 'none',
  borderRadius: '10px',
  padding: '8px 16px',
  fontSize: '13px',
  display: 'flex',
  alignItems: 'center',
  gap: '6px'
}

const botaoSecundario = {
  background: 'white',
  color: 'var(--cor-texto)',
  border: '1px solid #E8E8E8',
  borderRadius: '12px',
  padding: '12px 24px',
  fontSize: '14px',
  fontWeight: '500',
  display: 'flex',
  alignItems: 'center',
  gap: '8px'
}

const botaoCta = (desabilitado) => ({
  background: desabilitado
    ? '#cccccc'
    : 'linear-gradient(135deg, var(--cor-primaria), #00B8A3)',
  color: 'white',
  border: 'none',
  borderRadius: '12px',
  padding: '12px 24px',
  fontSize: '14px',
  fontWeight: '500',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  cursor: desabilitado ? 'not-allowed' : 'pointer'
})

function Pedidos() {
  const { clinica, session, refreshPerfil } = useAuth()
  const [pedidos, setPedidos] = useState([])
  const [fornecedores, setFornecedores] = useState([])
  const [marcas, setMarcas] = useState([])
  const [loading, setLoading] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [avisoSalvo, setAvisoSalvo] = useState(false)
  const [confirmando, setConfirmando] = useState(false)
  const [telefoneContato, setTelefoneContato] = useState('')
  const [pedidoAberto, setPedidoAberto] = useState(null) // pedido já enviado (somente leitura)
  const [itensAbertos, setItensAbertos] = useState([])
  const [formulario, setFormulario] = useState(null) // novo pedido ou rascunho em edição

  const CLINICA_ID = clinica?.id
  const USUARIO_ID = session?.user?.id

  async function carregarPedidos() {
    if (!CLINICA_ID) return

    const { data, error } = await supabase
      .from('pedidos')
      .select('*, fornecedores(nome)')
      .eq('clinica_id', CLINICA_ID)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erro ao carregar pedidos:', error)
    } else {
      setPedidos(data)
    }
    setLoading(false)
  }

  async function carregarFornecedores() {
    const { data, error } = await supabase
      .from('fornecedores')
      .select('*')
      .order('nome')

    if (!error) setFornecedores(data)
  }

  async function carregarMarcas() {
    const { data, error } = await supabase
      .from('marcas')
      .select('*, fornecedores(nome)')
      .order('nome')

    if (!error) setMarcas(data)
  }

    const marcasDisponiveis = formulario?.fornecedor_id
    ? marcas.filter(m => m.fornecedor_id === formulario.fornecedor_id)
    : marcas

  const itensPreenchidos = formulario
    ? formulario.itens.filter(i => i.nome_produto.trim())
    : []

  function nomeMarca(id) {
    return marcas.find(m => m.id === id)?.nome || '—'
  }

  function novoPedido() {
    setPedidoAberto(null)
    setItensAbertos([])
    setConfirmando(false)
    setFormulario({
      id: null,
      fornecedor_id: '',
      observacoes: '',
      itens: [novoItem()]
    })
  }

  async function abrirPedido(pedido) {
    const { data, error } = await supabase
      .from('pedido_itens')
      .select('*')
      .eq('pedido_id', pedido.id)
      .order('ordem')

    if (error) {
      console.error('Erro ao abrir pedido:', error)
      alert('Não foi possível abrir o pedido. Verifique sua conexão e tente novamente.')
      return
    }

    setConfirmando(false)

    if (pedido.status === 'rascunho') {
      setPedidoAberto(null)
      setItensAbertos([])
      setFormulario({
        id: pedido.id,
        fornecedor_id: pedido.fornecedor_id || '',
        observacoes: pedido.observacoes || '',
        itens: data.length > 0 ? data.map(itemParaFormulario) : [novoItem()]
      })
    } else {
      setFormulario(null)
      setPedidoAberto(pedido)
      setItensAbertos(data)
    }
  }

  function atualizarCampoFormulario(campo, valor) {
    setFormulario(prev => ({ ...prev, [campo]: valor }))
  }

  function alterarFornecedor(fornecedorId) {
    setFormulario(prev => ({
      ...prev,
      fornecedor_id: fornecedorId,
      // Limpa a marca dos itens que não pertencem à dental escolhida
      itens: prev.itens.map(item => {
        if (!fornecedorId || !item.marca_id) return item
        const marca = marcas.find(m => m.id === item.marca_id)
        return marca?.fornecedor_id === fornecedorId ? item : { ...item, marca_id: '' }
      })
    }))
  }

  function adicionarItem() {
    setFormulario(prev => ({ ...prev, itens: [...prev.itens, novoItem(true)] }))
  }

  function atualizarItem(chave, campo, valor) {
    setFormulario(prev => ({
      ...prev,
      itens: prev.itens.map(item => item.chave === chave ? { ...item, [campo]: valor } : item)
    }))
  }

  function removerItem(chave) {
    setFormulario(prev => ({
      ...prev,
      itens: prev.itens.filter(item => item.chave !== chave)
    }))
  }

  // Grava o pedido como rascunho (cria ou atualiza) e regrava os itens
  async function persistirRascunho() {
    const dadosPedido = {
      fornecedor_id: formulario.fornecedor_id || null,
      observacoes: formulario.observacoes.trim() || null,
      quantidade_itens: itensPreenchidos.length
    }

    let pedidoId = formulario.id

    if (pedidoId) {
      const { error } = await supabase.from('pedidos').update(dadosPedido).eq('id', pedidoId)
      if (error) throw error

      const { error: erroItens } = await supabase
        .from('pedido_itens')
        .delete()
        .eq('pedido_id', pedidoId)
      if (erroItens) throw erroItens
    } else {
      const { data, error } = await supabase
        .from('pedidos')
        .insert({
          ...dadosPedido,
          clinica_id: CLINICA_ID,
          usuario_id: USUARIO_ID,
          status: 'rascunho'
        })
        .select('id')
        .single()
      if (error) throw error
      pedidoId = data.id
    }

    const { error: erroInsert } = await supabase
      .from('pedido_itens')
      .insert(itensPreenchidos.map((item, indice) => ({
        pedido_id: pedidoId,
        clinica_id: CLINICA_ID,
        nome_produto: item.nome_produto.trim(),
        marca_id: item.marca_id || null,
        quantidade: Number(item.quantidade) || 1,
        unidade: item.unidade,
        observacao: item.observacao.trim() || null,
        ordem: indice,
        // Colunas de valor continuam existindo; quem preenche é a equipe
        categoria: '',
        valor_unitario: 0,
        desconto: 0,
        valor_total: 0
      })))
    if (erroInsert) throw erroInsert

    setFormulario(prev => ({ ...prev, id: pedidoId }))
    return pedidoId
  }

  async function salvarRascunho() {
    if (!CLINICA_ID) return
    if (itensPreenchidos.length === 0) {
      alert('Adicione pelo menos um item com o nome do produto para salvar o rascunho.')
      return
    }

    setSalvando(true)
    try {
      await persistirRascunho()
      await carregarPedidos()
      setAvisoSalvo(true)
      setTimeout(() => setAvisoSalvo(false), 2500)
    } catch (error) {
      console.error('Erro ao salvar rascunho:', error)
      alert('Não foi possível salvar o rascunho. Verifique sua conexão e tente novamente.')
    }
    setSalvando(false)
  }

  // Passo 1: valida os itens e pede a confirmação do telefone
  function iniciarSolicitacao() {
    if (itensPreenchidos.length === 0) {
      alert('Adicione pelo menos um item com o nome do produto antes de solicitar o orçamento.')
      return
    }
    if (itensPreenchidos.some(i => !(Number(i.quantidade) > 0))) {
      alert('Informe uma quantidade maior que zero em todos os itens.')
      return
    }

    setTelefoneContato(clinica?.telefone || '')
    setConfirmando(true)
  }

  // Passo 2: grava tudo e muda o status para em_cotacao (o e-mail sai daqui)
  async function solicitarOrcamento() {
    const telefone = telefoneContato.trim()
    if (telefone.replace(/\D/g, '').length < 10) {
      alert('Informe um telefone válido com DDD para que possamos entrar em contato.')
      return
    }

    setSalvando(true)
    try {
      if (telefone !== (clinica?.telefone || '')) {
        const { error } = await supabase
          .from('clinicas')
          .update({ telefone })
          .eq('id', CLINICA_ID)
        if (error) throw error
        refreshPerfil?.()
      }

      // Os itens são gravados antes de mudar o status, para o e-mail sair completo
      const pedidoId = await persistirRascunho()

      const { error } = await supabase
        .from('pedidos')
        .update({ status: 'em_cotacao' })
        .eq('id', pedidoId)
      if (error) throw error

      const { data: pedidoEnviado } = await supabase
        .from('pedidos')
        .select('*, fornecedores(nome)')
        .eq('id', pedidoId)
        .single()

      await carregarPedidos()
      if (pedidoEnviado) await abrirPedido(pedidoEnviado)
    } catch (error) {
      console.error('Erro ao solicitar orçamento:', error)
      alert('Não foi possível enviar o pedido. Verifique sua conexão e tente novamente.')
    }
    setSalvando(false)
  }

  async function cancelarPedido() {
    if (!window.confirm('Deseja cancelar este pedido?')) return

    const { error } = await supabase
      .from('pedidos')
      .update({ status: 'cancelado' })
      .eq('id', pedidoAberto.id)

    if (error) {
      console.error('Erro ao cancelar pedido:', error)
      alert('Não foi possível cancelar o pedido. Tente novamente.')
      return
    }

    setPedidoAberto(prev => ({ ...prev, status: 'cancelado' }))
    await carregarPedidos()
  }

  // Copia os itens de um pedido anterior para um novo rascunho
  function repetirPedido() {
    setFormulario({
      id: null,
      fornecedor_id: pedidoAberto.fornecedor_id || '',
      observacoes: pedidoAberto.observacoes || '',
      itens: itensAbertos.length > 0
        ? itensAbertos.map(i => ({ ...itemParaFormulario(i), chave: novaChave() }))
        : [novoItem()]
    })
    setPedidoAberto(null)
    setItensAbertos([])
  }

  async function deletarPedido(id) {
    if (!window.confirm('Excluir este rascunho? Essa ação não pode ser desfeita.')) return

    await supabase.from('pedido_itens').delete().eq('pedido_id', id)
    const { error } = await supabase.from('pedidos').delete().eq('id', id)

    if (error) {
      console.error('Erro ao excluir rascunho:', error)
      alert('Não foi possível excluir o rascunho. Tente novamente.')
      return
    }

    if (formulario?.id === id) setFormulario(null)
    await carregarPedidos()
  }

  useEffect(() => {
    if (CLINICA_ID) {
      carregarPedidos()
      carregarFornecedores()
      carregarMarcas()
    }
  }, [CLINICA_ID])

  const inputStyle = {
    padding: '6px 10px',
    borderRadius: '6px',
    border: '1px solid #E8E8E8',
    fontSize: '13px',
    outline: 'none',
    MozAppearance: 'textfield',
    appearance: 'textfield'
  }

  const selectStyle = {
    padding: '8px 12px',
    borderRadius: '8px',
    border: '1px solid #E8E8E8',
    fontSize: '13px',
    outline: 'none',
    cursor: 'pointer',
    backgroundColor: 'white',
    color: 'var(--cor-texto)'
  }

  if (loading) return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh'
    }}>
      <div className="spinner-border" style={{ color: 'var(--cor-primaria)' }} />
    </div>
  )

  return (
    <Layout headerTitle="Pedidos">
      <style>{`
        input[type=number]::-webkit-outer-spin-button,
        input[type=number]::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type=number] {
          -moz-appearance: textfield;
        }
      `}</style>

            <div style={{
        display: 'grid',
        gridTemplateColumns: (formulario || pedidoAberto) ? '1fr 2fr' : '1fr',
        gap: '20px'
      }}>

        {/* Lista de Pedidos */}
        <div style={cardStyle}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px'
          }}>
            <h5 style={{
              margin: 0,
              fontWeight: '500',
              fontSize: '18px',
              color: 'var(--cor-texto)'
            }}>
              Pedidos
            </h5>
            <button onClick={novoPedido} className="btn" style={botaoPrimario}>
              <MdOutlineAddCircleOutline size={16} />
              Novo Pedido
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {pedidos.length === 0 ? (
              <p style={{
                textAlign: 'center',
                color: 'var(--cor-texto-secundario)',
                fontSize: '14px',
                padding: '24px 0'
              }}>
                Nenhum pedido ainda. Clique em "Novo Pedido" para solicitar um orçamento.
              </p>
            ) : (
              pedidos.map(pedido => {
                const status = STATUS[pedido.status] || STATUS.rascunho
                const selecionado = pedidoAberto?.id === pedido.id || formulario?.id === pedido.id

                return (
                  <div
                    key={pedido.id}
                    onClick={() => abrirPedido(pedido)}
                    style={{
                      padding: '14px',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      border: selecionado
                        ? '2px solid var(--cor-primaria)'
                        : '1px solid #F0F0F0',
                      backgroundColor: selecionado ? '#F0FDFB' : 'white',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '6px'
                    }}>
                      <span style={{
                        fontSize: '13px',
                        fontWeight: '600',
                        color: 'var(--cor-texto)'
                      }}>
                        #{pedido.id.slice(0, 8).toUpperCase()}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{
                          backgroundColor: status.bg,
                          color: status.cor,
                          padding: '3px 10px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: '500'
                        }}>
                          {status.label}
                        </span>
                        {pedido.status === 'rascunho' && (
                          <button
                            onClick={(e) => { e.stopPropagation(); deletarPedido(pedido.id) }}
                            aria-label="Excluir rascunho"
                            title="Excluir rascunho"
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              color: '#FF6B6B',
                              padding: '2px',
                              display: 'flex',
                              alignItems: 'center'
                            }}
                          >
                            <AiOutlineDelete size={15} />
                          </button>
                        )}
                      </div>
                    </div>

                    <div style={{
                      fontSize: '12px',
                      color: 'var(--cor-primaria)',
                      fontWeight: '500',
                      marginBottom: '4px'
                    }}>
                      {pedido.fornecedores?.nome || 'Sem preferência de dental'}
                    </div>

                    <div style={{
                      fontSize: '11px',
                      color: 'var(--cor-texto-secundario)',
                      display: 'flex',
                      justifyContent: 'space-between'
                    }}>
                      <span>{new Date(pedido.created_at).toLocaleDateString('pt-BR')}</span>
                      <span>{pedido.quantidade_itens || 0} itens</span>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Editor: novo pedido ou rascunho */}
        {formulario && (
          <div style={cardStyle}>

            {/* Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: '12px',
              flexWrap: 'wrap',
              marginBottom: '24px'
            }}>
              <div>
                <h5 style={{
                  margin: '0 0 4px 0',
                  fontWeight: '600',
                  fontSize: '18px',
                  color: 'var(--cor-texto)'
                }}>
                  {formulario.id
                    ? `Rascunho #${formulario.id.slice(0, 8).toUpperCase()}`
                    : 'Novo Pedido'}
                </h5>
                <div style={{ fontSize: '13px', color: 'var(--cor-texto-secundario)' }}>
                  Liste os produtos que precisa. Nossa equipe faz o orçamento e entra em contato.
                </div>
              </div>

              <button onClick={adicionarItem} className="btn" style={botaoPrimario}>
                <MdOutlineAddCircleOutline size={16} />
                Adicionar Item
              </button>
            </div>

            {/* Dental */}
            <div style={{ marginBottom: '20px', maxWidth: '360px' }}>
              <label style={labelStyle}>Dental de preferência</label>
              <select
                value={formulario.fornecedor_id}
                onChange={(e) => alterarFornecedor(e.target.value)}
                style={{ ...selectStyle, width: '100%' }}
              >
                <option value="">Sem preferência</option>
                {fornecedores.map(f => (
                  <option key={f.id} value={f.id}>{f.nome}</option>
                ))}
              </select>
            </div>

            {/* Tabela de Itens */}
            <div className="table-responsive">
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #F0F0F0' }}>
                    {['Produto', 'Marca preferida', 'Quantidade', 'Unidade', 'Observação', ''].map((col, idx) => (
                      <th key={idx} style={thStyle}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {formulario.itens.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        style={{
                          textAlign: 'center',
                          padding: '32px',
                          color: 'var(--cor-texto-secundario)',
                          fontSize: '14px'
                        }}
                      >
                        Nenhum item adicionado. Clique em "Adicionar Item".
                      </td>
                    </tr>
                  ) : (
                    formulario.itens.map(item => (
                      <tr key={item.chave} style={{ borderBottom: '1px solid #F8F8F8' }}>
                        <td style={{ padding: '8px' }}>
                          <input
                            value={item.nome_produto}
                            onChange={(e) => atualizarItem(item.chave, 'nome_produto', e.target.value)}
                            autoFocus={item.foco}
                            placeholder="Nome do produto"
                            style={{ ...inputStyle, width: '100%', minWidth: '160px' }}
                          />
                        </td>
                        <td style={{ padding: '8px' }}>
                          <select
                            value={item.marca_id}
                            onChange={(e) => atualizarItem(item.chave, 'marca_id', e.target.value)}
                            style={{ ...inputStyle, width: '100%', minWidth: '140px', backgroundColor: 'white' }}
                          >
                            <option value="">Sem preferência</option>
                            {marcasDisponiveis.map(m => (
                              <option key={m.id} value={m.id}>
                                {formulario.fornecedor_id
                                  ? m.nome
                                  : `${m.nome} • ${m.fornecedores?.nome || ''}`}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td style={{ padding: '8px' }}>
                          <input
                            type="number"
                            value={item.quantidade}
                            onChange={(e) => atualizarItem(item.chave, 'quantidade', e.target.value)}
                            min={1}
                            style={{ ...inputStyle, width: '70px' }}
                          />
                        </td>
                        <td style={{ padding: '8px' }}>
                          <select
                            value={item.unidade}
                            onChange={(e) => atualizarItem(item.chave, 'unidade', e.target.value)}
                            style={{ ...inputStyle, backgroundColor: 'white' }}
                          >
                            {UNIDADES.map(u => (
                              <option key={u.value} value={u.value}>{u.label}</option>
                            ))}
                          </select>
                        </td>
                        <td style={{ padding: '8px' }}>
                          <input
                            value={item.observacao}
                            onChange={(e) => atualizarItem(item.chave, 'observacao', e.target.value)}
                            placeholder="Ex.: tamanho, cor, modelo"
                            style={{ ...inputStyle, width: '100%', minWidth: '160px' }}
                          />
                        </td>
                        <td style={{ padding: '8px' }}>
                          <button
                            onClick={() => removerItem(item.chave)}
                            aria-label="Remover item"
                            title="Remover item"
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              color: '#FF6B6B',
                              display: 'flex',
                              alignItems: 'center'
                            }}
                          >
                            <AiOutlineDelete size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Observações */}
            <div style={{ marginTop: '20px' }}>
              <textarea
                placeholder="Observações do pedido..."
                value={formulario.observacoes}
                onChange={(e) => atualizarCampoFormulario('observacoes', e.target.value)}
                rows={2}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1px solid #E8E8E8',
                  fontSize: '13px',
                  resize: 'none',
                  outline: 'none'
                }}
              />
            </div>

            {/* Rodapé */}
            <div style={{
              marginTop: '16px',
              padding: '16px',
              backgroundColor: '#F8F8F8',
              borderRadius: '12px'
            }}>
              {!confirmando ? (
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                      onClick={iniciarSolicitacao}
                      disabled={salvando}
                      className="btn"
                      style={botaoCta(salvando)}
                    >
                      <HiOutlineClipboardCheck size={18} />
                      Solicitar Orçamento
                    </button>
                    <button
                      onClick={salvarRascunho}
                      disabled={salvando}
                      className="btn"
                      style={botaoSecundario}
                    >
                      {avisoSalvo ? 'Rascunho salvo' : salvando ? 'Salvando...' : 'Salvar Rascunho'}
                    </button>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{
                      fontSize: '12px',
                      color: 'var(--cor-texto-secundario)',
                      marginBottom: '4px'
                    }}>
                      Total de Itens
                    </div>
                    <div style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      color: 'var(--cor-texto)'
                    }}>
                      {itensPreenchidos.length}
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: '500',
                    color: 'var(--cor-texto)',
                    marginBottom: '4px'
                  }}>
                    Confirme seu telefone de contato
                  </div>
                  <div style={{
                    fontSize: '13px',
                    color: 'var(--cor-texto-secundario)',
                    marginBottom: '12px'
                  }}>
                    Nossa equipe entrará em contato neste número para passar o orçamento.
                  </div>
                  <input
                    type="tel"
                    value={telefoneContato}
                    onChange={(e) => setTelefoneContato(e.target.value)}
                    placeholder="(00) 00000-0000"
                    style={{
                      ...inputStyle,
                      display: 'block',
                      width: '100%',
                      maxWidth: '260px',
                      marginBottom: '12px'
                    }}
                  />
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                      onClick={solicitarOrcamento}
                      disabled={salvando}
                      className="btn"
                      style={botaoCta(salvando)}
                    >
                      <HiOutlineClipboardCheck size={18} />
                      {salvando ? 'Enviando...' : 'Confirmar e Solicitar'}
                    </button>
                    <button
                      onClick={() => setConfirmando(false)}
                      disabled={salvando}
                      className="btn"
                      style={botaoSecundario}
                    >
                      Voltar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Detalhe do Pedido (já enviado) */}
        {pedidoAberto && (
          <div style={cardStyle}>

            {/* Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: '12px',
              flexWrap: 'wrap',
              marginBottom: '24px'
            }}>
              <div>
                <h5 style={{
                  margin: '0 0 4px 0',
                  fontWeight: '600',
                  fontSize: '18px',
                  color: 'var(--cor-texto)'
                }}>
                  Pedido #{pedidoAberto.id.slice(0, 8).toUpperCase()}
                </h5>

                <div style={{
                  fontSize: '13px',
                  color: 'var(--cor-primaria)',
                  fontWeight: '500',
                  marginBottom: '8px'
                }}>
                  {pedidoAberto.fornecedores?.nome || 'Sem preferência de dental'}
                </div>

                <div style={{
                  display: 'flex',
                  gap: '16px',
                  fontSize: '13px',
                  color: 'var(--cor-texto-secundario)'
                }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <BsCalendar3 size={12} />
                    {new Date(pedidoAberto.created_at).toLocaleDateString('pt-BR')}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <BsBoxSeam size={12} />
                    {pedidoAberto.quantidade_itens || 0} itens
                  </span>
                </div>
              </div>

              <button onClick={repetirPedido} className="btn" style={botaoPrimario}>
                <MdOutlineContentCopy size={16} />
                Repetir Pedido
              </button>
            </div>

            {/* Andamento */}
            {pedidoAberto.status === 'cancelado' ? (
              <div style={{
                padding: '14px',
                borderRadius: '12px',
                backgroundColor: '#FFF0F0',
                color: 'var(--cor-texto)',
                fontSize: '13px',
                marginBottom: '20px'
              }}>
                <strong>Pedido cancelado.</strong>
                {pedidoAberto.motivo_cancelamento && ` Motivo: ${pedidoAberto.motivo_cancelamento}`}
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '20px' }}>
                  {ETAPAS.map((etapa, idx) => {
                    const etapaAtual = ETAPAS.indexOf(pedidoAberto.status)
                    const alcancada = idx <= etapaAtual
                    const atual = idx === etapaAtual

                    return (
                      <div
                        key={etapa}
                        style={{
                          flex: 1,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          position: 'relative'
                        }}
                      >
                        {idx > 0 && (
                          <div style={{
                            position: 'absolute',
                            top: '11px',
                            right: '50%',
                            width: '100%',
                            height: '2px',
                            backgroundColor: alcancada ? 'var(--cor-primaria)' : '#E8E8E8'
                          }} />
                        )}
                        <div style={{
                          position: 'relative',
                          zIndex: 1,
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          backgroundColor: alcancada ? 'var(--cor-primaria)' : 'white',
                          border: alcancada ? 'none' : '2px solid #E8E8E8',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          {alcancada && <BsCheck2 size={14} />}
                        </div>
                        <span style={{
                          marginTop: '6px',
                          fontSize: '12px',
                          textAlign: 'center',
                          fontWeight: atual ? '600' : '400',
                          color: atual ? 'var(--cor-texto)' : 'var(--cor-texto-secundario)'
                        }}>
                          {STATUS[etapa].label}
                        </span>
                      </div>
                    )
                  })}
                </div>

                <div style={{
                  padding: '14px',
                  borderRadius: '12px',
                  backgroundColor: '#F0FDFB',
                  color: 'var(--cor-texto)',
                  fontSize: '13px',
                  marginBottom: '20px'
                }}>
                  {MENSAGEM_STATUS[pedidoAberto.status]}
                </div>
              </>
            )}

            {/* Tabela de Itens (somente leitura) */}
            <div className="table-responsive">
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #F0F0F0' }}>
                    {['Produto', 'Marca', 'Quantidade', 'Observação'].map(col => (
                      <th key={col} style={thStyle}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {itensAbertos.map(item => (
                    <tr key={item.id} style={{ borderBottom: '1px solid #F8F8F8' }}>
                      <td style={{ padding: '10px 8px', fontSize: '13px', color: 'var(--cor-texto)' }}>
                        {item.nome_produto}
                      </td>
                      <td style={{ padding: '10px 8px', fontSize: '13px', color: 'var(--cor-texto)' }}>
                        {nomeMarca(item.marca_id)}
                      </td>
                      <td style={{ padding: '10px 8px', fontSize: '13px', color: 'var(--cor-texto)', whiteSpace: 'nowrap' }}>
                        {item.quantidade} {item.unidade}
                      </td>
                      <td style={{ padding: '10px 8px', fontSize: '13px', color: 'var(--cor-texto-secundario)' }}>
                        {item.observacao || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {pedidoAberto.observacoes && (
              <div style={{ marginTop: '20px' }}>
                <label style={labelStyle}>Observações do pedido</label>
                <div style={{ fontSize: '13px', color: 'var(--cor-texto)' }}>
                  {pedidoAberto.observacoes}
                </div>
              </div>
            )}

            {/* Rodapé */}
            {['em_cotacao', 'orcamento_enviado'].includes(pedidoAberto.status) && (
              <div style={{
                marginTop: '16px',
                padding: '16px',
                backgroundColor: '#F8F8F8',
                borderRadius: '12px'
              }}>
                <button
                  onClick={cancelarPedido}
                  className="btn"
                  style={{
                    ...botaoSecundario,
                    color: '#FF6B6B',
                    border: '1px solid #FF6B6B'
                  }}
                >
                  Cancelar Pedido
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  )
}

export default Pedidos
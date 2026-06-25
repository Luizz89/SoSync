import { useState, useEffect } from 'react'
import { supabase } from '../config/supabase'
import { useAuth } from '../context/AuthContext'
import Layout from '../components/layout/Layout'
import { MdOutlineAddCircleOutline } from 'react-icons/md'
import { AiOutlineDelete } from 'react-icons/ai'
import { BsCalendar3, BsBoxSeam, BsCurrencyDollar } from 'react-icons/bs'
import { HiOutlineClipboardCheck } from 'react-icons/hi'

function Pedidos() {
  const { clinica, session } = useAuth()
  const [pedidos, setPedidos] = useState([])
  const [fornecedores, setFornecedores] = useState([])
  const [marcas, setMarcas] = useState([])
  const [marcasFiltradas, setMarcasFiltradas] = useState([])
  const [loading, setLoading] = useState(true)
  const [criandoPedido, setCriandoPedido] = useState(false)
  const [pedidoAberto, setPedidoAberto] = useState(null)
  const [itens, setItens] = useState([])
  const [fornecedorSelecionado, setFornecedorSelecionado] = useState('')
  const [marcaSelecionada, setMarcaSelecionada] = useState('')

  const CLINICA_ID = clinica?.id
  const USUARIO_ID = session?.user?.id

  async function carregarPedidos() {
    if (!CLINICA_ID) return

    const { data, error } = await supabase
      .from('pedidos')
      .select('*, marcas(nome, fornecedores(nome))')
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

  function filtrarMarcasPorFornecedor(fornecedorId) {
    setFornecedorSelecionado(fornecedorId)
    setMarcaSelecionada('')
    if (!fornecedorId) {
      setMarcasFiltradas([])
      return
    }
    setMarcasFiltradas(marcas.filter(m => m.fornecedor_id === fornecedorId))
  }

  async function criarPedido() {
    if (!CLINICA_ID) return
    if (!marcaSelecionada) {
      alert('Selecione um fornecedor e uma marca antes de criar o pedido.')
      return
    }

    setCriandoPedido(true)

    const { data, error } = await supabase
      .from('pedidos')
      .insert({
        clinica_id: CLINICA_ID,
        usuario_id: USUARIO_ID,
        marca_id: marcaSelecionada,
        status: 'pendente',
        quantidade_itens: 0,
        valor_total: 0
      })
      .select('*, marcas(nome, fornecedores(nome))')
      .single()

    if (error) {
      console.error('Erro ao criar pedido:', error)
    } else {
      setPedidoAberto(data)
      setItens([])
      setFornecedorSelecionado('')
      setMarcaSelecionada('')
      setMarcasFiltradas([])
      await carregarPedidos()
    }
    setCriandoPedido(false)
  }

  async function abrirPedido(pedido) {
    setPedidoAberto(pedido)
    const { data, error } = await supabase
      .from('pedido_itens')
      .select('*')
      .eq('pedido_id', pedido.id)

    if (!error) setItens(data)
  }

  async function adicionarItem() {
    if (!pedidoAberto) return

    const novoItem = {
      pedido_id: pedidoAberto.id,
      clinica_id: CLINICA_ID,
      nome_produto: '',
      categoria: '',
      quantidade: 1,
      unidade: 'unidades',
      valor_unitario: 0,
      desconto: 0,
      valor_total: 0
    }

    const { data, error } = await supabase
      .from('pedido_itens')
      .insert(novoItem)
      .select()
      .single()

    if (!error) setItens(prev => [...prev, data])
  }

  async function atualizarItem(id, campo, valor) {
    const itensAtualizados = itens.map(item => {
      if (item.id !== id) return item

      const atualizado = { ...item, [campo]: valor }
      const qtd = Number(campo === 'quantidade' ? valor : atualizado.quantidade)
      const unit = Number(campo === 'valor_unitario' ? valor : atualizado.valor_unitario)
      const desc = Number(campo === 'desconto' ? valor : atualizado.desconto)
      atualizado.valor_total = (qtd * unit) - desc

      return atualizado
    })

    setItens(itensAtualizados)

    const itemAtualizado = itensAtualizados.find(i => i.id === id)

    await supabase
      .from('pedido_itens')
      .update({ [campo]: valor, valor_total: itemAtualizado.valor_total })
      .eq('id', id)

    await atualizarTotalPedido(itensAtualizados)
  }

  async function atualizarTotalPedido(itensAtuais) {
    const total = itensAtuais.reduce((acc, i) => acc + (Number(i.valor_total) || 0), 0)
    const qtd = itensAtuais.length

    await supabase
      .from('pedidos')
      .update({ valor_total: total, quantidade_itens: qtd })
      .eq('id', pedidoAberto.id)

    setPedidoAberto(prev => ({ ...prev, valor_total: total, quantidade_itens: qtd }))
  }

  async function deletarItem(id) {
    await supabase.from('pedido_itens').delete().eq('id', id)
    const novosItens = itens.filter(i => i.id !== id)
    setItens(novosItens)
    await atualizarTotalPedido(novosItens)
  }

  async function atualizarStatusPedido(status) {
    await supabase.from('pedidos').update({ status }).eq('id', pedidoAberto.id)
    setPedidoAberto(prev => ({ ...prev, status }))
    await carregarPedidos()
  }

  async function realizarPedido() {
    if (itens.length === 0) {
      alert('Adicione pelo menos um item antes de realizar o pedido.')
      return
    }

    const { error } = await supabase
      .from('pedidos')
      .update({ status: 'em_separacao' })
      .eq('id', pedidoAberto.id)

    if (error) {
      console.error('Erro ao realizar pedido:', error)
    } else {
      setPedidoAberto(prev => ({ ...prev, status: 'em_separacao' }))
      await carregarPedidos()
    }
  }

  async function deletarPedido(id) {
    await supabase.from('pedidos').delete().eq('id', id)
    if (pedidoAberto?.id === id) setPedidoAberto(null)
    await carregarPedidos()
  }

  useEffect(() => {
    if (CLINICA_ID) {
      carregarPedidos()
      carregarFornecedores()
      carregarMarcas()
    }
  }, [CLINICA_ID])

  function getStatusStyle(status) {
    if (status === 'em_separacao') return { backgroundColor: '#E5FBF8', color: '#00D9C0' }
    return { backgroundColor: '#FFF9E6', color: '#FFB800' }
  }

  function getStatusLabel(status) {
    if (status === 'em_separacao') return 'Em Separação'
    return 'Pendente'
  }

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
        gridTemplateColumns: pedidoAberto ? '1fr 2fr' : '1fr',
        gap: '20px'
      }}>

        {/* Lista de Pedidos */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '20px',
          padding: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
        }}>
          <h5 style={{
            margin: '0 0 16px 0',
            fontWeight: '500',
            fontSize: '18px',
            color: 'var(--cor-texto)'
          }}>
            Novo Pedido
          </h5>

          {/* Seleção de Fornecedor e Marca */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            marginBottom: '20px',
            padding: '16px',
            backgroundColor: '#FAFAFA',
            borderRadius: '12px'
          }}>
            <div>
              <label style={{
                fontSize: '12px',
                color: 'var(--cor-texto-secundario)',
                display: 'block',
                marginBottom: '6px'
              }}>
                Fornecedor
              </label>
              <select
                value={fornecedorSelecionado}
                onChange={(e) => filtrarMarcasPorFornecedor(e.target.value)}
                style={{ ...selectStyle, width: '100%' }}
              >
                <option value="">Selecione o fornecedor</option>
                {fornecedores.map(f => (
                  <option key={f.id} value={f.id}>{f.nome}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{
                fontSize: '12px',
                color: 'var(--cor-texto-secundario)',
                display: 'block',
                marginBottom: '6px'
              }}>
                Marca
              </label>
              <select
                value={marcaSelecionada}
                onChange={(e) => setMarcaSelecionada(e.target.value)}
                disabled={!fornecedorSelecionado}
                style={{
                  ...selectStyle,
                  width: '100%',
                  opacity: !fornecedorSelecionado ? 0.5 : 1
                }}
              >
                <option value="">Selecione a marca</option>
                {marcasFiltradas.map(m => (
                  <option key={m.id} value={m.id}>{m.nome}</option>
                ))}
              </select>
            </div>

            <button
              onClick={criarPedido}
              disabled={criandoPedido || !marcaSelecionada}
              className="btn"
              style={{
                background: !marcaSelecionada ? '#cccccc' : 'var(--cor-primaria)',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                padding: '10px 16px',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                cursor: !marcaSelecionada ? 'not-allowed' : 'pointer'
              }}
            >
              <MdOutlineAddCircleOutline size={18} />
              {criandoPedido ? 'Criando...' : 'Criar Pedido'}
            </button>
          </div>

          {/* Lista de Pedidos existentes */}
          <h6 style={{
            margin: '0 0 12px 0',
            fontWeight: '500',
            fontSize: '14px',
            color: 'var(--cor-texto-secundario)'
          }}>
            Pedidos Anteriores
          </h6>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {pedidos.length === 0 ? (
              <p style={{
                textAlign: 'center',
                color: 'var(--cor-texto-secundario)',
                fontSize: '14px',
                padding: '24px 0'
              }}>
                Nenhum pedido encontrado.
              </p>
            ) : (
              pedidos.map(pedido => (
                <div
                  key={pedido.id}
                  onClick={() => abrirPedido(pedido)}
                  style={{
                    padding: '14px',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    border: pedidoAberto?.id === pedido.id
                      ? '2px solid var(--cor-primaria)'
                      : '1px solid #F0F0F0',
                    backgroundColor: pedidoAberto?.id === pedido.id
                      ? '#F0FDFB'
                      : 'white',
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
                        ...getStatusStyle(pedido.status),
                        padding: '3px 10px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: '500'
                      }}>
                        {getStatusLabel(pedido.status)}
                      </span>
                      <button
                        onClick={(e) => { e.stopPropagation(); deletarPedido(pedido.id) }}
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
                    </div>
                  </div>

                  {pedido.marcas && (
                    <div style={{
                      fontSize: '12px',
                      color: 'var(--cor-primaria)',
                      fontWeight: '500',
                      marginBottom: '4px'
                    }}>
                      {pedido.marcas.fornecedores?.nome} • {pedido.marcas.nome}
                    </div>
                  )}

                  <div style={{
                    fontSize: '11px',
                    color: 'var(--cor-texto-secundario)',
                    display: 'flex',
                    justifyContent: 'space-between'
                  }}>
                    <span>{new Date(pedido.created_at).toLocaleDateString('pt-BR')}</span>
                    <span>{pedido.quantidade_itens || 0} itens • R$ {Number(pedido.valor_total || 0).toFixed(2)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Detalhe do Pedido */}
        {pedidoAberto && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '20px',
            padding: '24px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
          }}>

            {/* Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
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

                {pedidoAberto.marcas && (
                  <div style={{
                    fontSize: '13px',
                    color: 'var(--cor-primaria)',
                    fontWeight: '500',
                    marginBottom: '8px'
                  }}>
                    {pedidoAberto.marcas.fornecedores?.nome} • {pedidoAberto.marcas.nome}
                  </div>
                )}

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
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <BsCurrencyDollar size={12} />
                    R$ {Number(pedidoAberto.valor_total || 0).toFixed(2)}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <select
                  value={pedidoAberto.status}
                  onChange={(e) => atualizarStatusPedido(e.target.value)}
                  style={selectStyle}
                >
                  <option value="pendente">Pendente</option>
                  <option value="em_separacao">Em Separação</option>
                </select>

                <button
                  onClick={adicionarItem}
                  className="btn"
                  style={{
                    background: 'var(--cor-primaria)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '8px 16px',
                    fontSize: '13px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <MdOutlineAddCircleOutline size={16} />
                  Adicionar Item
                </button>
              </div>
            </div>

            {/* Observações */}
            <div style={{ marginBottom: '20px' }}>
              <textarea
                placeholder="Observações do pedido..."
                defaultValue={pedidoAberto.observacoes || ''}
                onBlur={(e) => supabase
                  .from('pedidos')
                  .update({ observacoes: e.target.value })
                  .eq('id', pedidoAberto.id)
                }
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

            {/* Tabela de Itens */}
            <div className="table-responsive">
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #F0F0F0' }}>
                    {['Produto', 'Categoria', 'Quantidade', 'Unidade', 'Valor Unitário', 'Desconto', 'Total', ''].map(col => (
                      <th
                        key={col}
                        style={{
                          padding: '10px 8px',
                          color: 'var(--cor-texto-secundario)',
                          fontWeight: '500',
                          fontSize: '12px',
                          textAlign: 'left',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {itens.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
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
                    itens.map(item => (
                      <tr key={item.id} style={{ borderBottom: '1px solid #F8F8F8' }}>
                        <td style={{ padding: '8px' }}>
                          <input
                            defaultValue={item.nome_produto}
                            onBlur={(e) => atualizarItem(item.id, 'nome_produto', e.target.value)}
                            placeholder="Nome do produto"
                            style={{ ...inputStyle, width: '100%', minWidth: '140px' }}
                          />
                        </td>
                        <td style={{ padding: '8px' }}>
                          <input
                            defaultValue={item.categoria}
                            onBlur={(e) => atualizarItem(item.id, 'categoria', e.target.value)}
                            placeholder="Categoria"
                            style={{ ...inputStyle, width: '100%', minWidth: '100px' }}
                          />
                        </td>
                        <td style={{ padding: '8px' }}>
                          <input
                            type="number"
                            defaultValue={item.quantidade}
                            onBlur={(e) => atualizarItem(item.id, 'quantidade', Number(e.target.value))}
                            min={1}
                            style={{ ...inputStyle, width: '70px' }}
                          />
                        </td>
                        <td style={{ padding: '8px' }}>
                          <select
                            defaultValue={item.unidade}
                            onBlur={(e) => atualizarItem(item.id, 'unidade', e.target.value)}
                            style={inputStyle}
                          >
                            <option value="unidades">Unidades</option>
                            <option value="caixas">Caixas</option>
                            <option value="ampolas">Ampolas</option>
                            <option value="frascos">Frascos</option>
                            <option value="pares">Pares</option>
                            <option value="kg">Kg</option>
                            <option value="litros">Litros</option>
                          </select>
                        </td>
                        <td style={{ padding: '8px' }}>
                          <input
                            type="number"
                            defaultValue={item.valor_unitario}
                            onBlur={(e) => atualizarItem(item.id, 'valor_unitario', Number(e.target.value))}
                            min={0}
                            step="0.01"
                            style={{ ...inputStyle, width: '90px' }}
                          />
                        </td>
                        <td style={{ padding: '8px' }}>
                          <input
                            type="number"
                            defaultValue={item.desconto}
                            onBlur={(e) => atualizarItem(item.id, 'desconto', Number(e.target.value))}
                            min={0}
                            step="0.01"
                            style={{ ...inputStyle, width: '90px' }}
                          />
                        </td>
                        <td style={{
                          padding: '8px',
                          whiteSpace: 'nowrap',
                          fontSize: '13px',
                          fontWeight: '500',
                          color: 'var(--cor-texto)'
                        }}>
                          R$ {Number(item.valor_total || 0).toFixed(2)}
                        </td>
                        <td style={{ padding: '8px' }}>
                          <button
                            onClick={() => deletarItem(item.id)}
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

            {/* Rodapé */}
            {itens.length > 0 && (
              <div style={{
                marginTop: '16px',
                padding: '16px',
                backgroundColor: '#F8F8F8',
                borderRadius: '12px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <button
                  onClick={realizarPedido}
                  disabled={pedidoAberto.status === 'em_separacao'}
                  className="btn"
                  style={{
                    background: pedidoAberto.status === 'em_separacao'
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
                    cursor: pedidoAberto.status === 'em_separacao'
                      ? 'not-allowed'
                      : 'pointer'
                  }}
                >
                  <HiOutlineClipboardCheck size={18} />
                  {pedidoAberto.status === 'em_separacao'
                    ? 'Pedido Realizado'
                    : 'Realizar Pedido'}
                </button>

                <div style={{ display: 'flex', gap: '32px' }}>
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
                      {pedidoAberto.quantidade_itens || 0}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{
                      fontSize: '12px',
                      color: 'var(--cor-texto-secundario)',
                      marginBottom: '4px'
                    }}>
                      Valor Total
                    </div>
                    <div style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      color: 'var(--cor-primaria)'
                    }}>
                      R$ {Number(pedidoAberto.valor_total || 0).toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  )
}

export default Pedidos
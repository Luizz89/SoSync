import { useState, useEffect, useRef } from 'react'
import { supabase } from '../config/supabase'
import { useAuth } from '../context/AuthContext'
import Layout from '../components/layout/Layout'
import TabelaEstoqueClinica from '../components/TabelaEstoqueClinica'
import ModalNovoProdutoClinica from '../components/ModalNovoProdutoClinica'
import * as XLSX from 'xlsx'
import { AiOutlineUpload, AiOutlineDownload } from 'react-icons/ai'
import { FaCheck } from "react-icons/fa6";


function EstoqueClinica() {
  const { clinica } = useAuth()
  const [produtos, setProdutos] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalAberto, setModalAberto] = useState(false)
  const [importando, setImportando] = useState(false)
  const [resultadoImportacao, setResultadoImportacao] = useState(null)
  const inputFileRef = useRef(null)

  const CLINICA_ID = clinica?.id

  async function carregarProdutos() {
    if (!CLINICA_ID) return

    const { data, error } = await supabase
      .from('estoque_clinica')
      .select('*')
      .eq('clinica_id', CLINICA_ID)
      .order('nome', { ascending: true })

    if (error) {
      console.error('Erro ao carregar produtos:', error)
    } else {
      setProdutos(data)
    }
    setLoading(false)
  }

  async function deletarProduto(id) {
    const { error } = await supabase
      .from('estoque_clinica')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Erro ao deletar produto:', error)
      alert('Erro ao deletar produto.')
    } else {
      setProdutos(produtos.filter(p => p.id !== id))
    }
  }

  async function importarExcel(e) {
    const file = e.target.files[0]
    if (!file) return

    setImportando(true)
    setResultadoImportacao(null)

    try {
      const reader = new FileReader()

      reader.onload = async (event) => {
        const data = new Uint8Array(event.target.result)
        const workbook = XLSX.read(data, { type: 'array' })
        const sheet = workbook.Sheets[workbook.SheetNames[0]]
        const linhas = XLSX.utils.sheet_to_json(sheet)

        let adicionados = 0
        let atualizados = 0
        let erros = 0

        for (const linha of linhas) {
          // Normaliza os nomes das colunas para minúsculo sem espaços
          const produto = {
            nome: linha['nome'] || linha['Nome'] || linha['NOME'] || null,
            quantidade: Number(linha['quantidade'] || linha['Quantidade'] || linha['QUANTIDADE'] || 0),
            quantidade_minima: Number(linha['quantidade_minima'] || linha['Quantidade Minima'] || linha['quantidade minima'] || 10),
            unidade: linha['unidade'] || linha['Unidade'] || linha['UNIDADE'] || 'unidades',
            preco: Number(linha['preco'] || linha['Preço'] || linha['preco'] || 0) || null,
            validade: linha['validade'] || linha['Validade'] || linha['VALIDADE'] || null,
            clinica_id: CLINICA_ID
          }

          if (!produto.nome) {
            erros++
            continue
          }

          // Verifica se produto já existe
          const produtoExistente = produtos.find(p =>
            p.nome.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') ===
            produto.nome.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
          )

          if (produtoExistente) {
            // Atualiza produto existente
            const { error } = await supabase
              .from('estoque_clinica')
              .update({
                quantidade: produto.quantidade,
                quantidade_minima: produto.quantidade_minima,
                unidade: produto.unidade,
                preco: produto.preco,
                validade: produto.validade
              })
              .eq('id', produtoExistente.id)

            if (error) erros++
            else atualizados++
          } else {
            // Insere novo produto
            const { error } = await supabase
              .from('estoque_clinica')
              .insert(produto)

            if (error) erros++
            else adicionados++
          }
        }

        await carregarProdutos()
        setResultadoImportacao({ adicionados, atualizados, erros })
        setImportando(false)

        // Limpa o input para permitir reimportar o mesmo arquivo
        inputFileRef.current.value = ''
      }

      reader.readAsArrayBuffer(file)
    } catch (erro) {
      console.error('Erro ao importar Excel:', erro)
      setImportando(false)
    }
  }

  function exportarExcel() {
  const dados = produtos.map(p => ({
    'Nome': p.nome,
    'Quantidade': p.quantidade,
    'Quantidade Mínima': p.quantidade_minima,
    'Unidade': p.unidade,
    'Preço': p.preco || '',
    'Validade': p.validade || ''
  }))

  const worksheet = XLSX.utils.json_to_sheet(dados)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Estoque')
  XLSX.writeFile(workbook, `estoque_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.xlsx`)
}

  useEffect(() => {
  if (CLINICA_ID) carregarProdutos()

  const subscription = supabase
    .channel('estoque-clinica')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'estoque_clinica' }, carregarProdutos)
    .subscribe()

  return () => supabase.removeChannel(subscription)
}, [CLINICA_ID])
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
    <Layout headerTitle="Estoque da Clínica">
      <div style={{
        backgroundColor: 'white',
        borderRadius: '20px',
        padding: '32px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
      }}>

        {/* Header */}
        <div
          className="d-flex justify-content-between align-items-center"
          style={{ marginBottom: '32px' }}
        >
          <h5 style={{
            margin: 0,
            color: 'var(--cor-texto)',
            fontWeight: '400',
            fontSize: '20px'
          }}>
            Meu Estoque
          </h5>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {/* Botão Importar Excel */}
            <input
              type="file"
              accept=".xlsx,.xls"
              ref={inputFileRef}
              onChange={importarExcel}
              style={{ display: 'none' }}
            />
            <button
              onClick={() => inputFileRef.current.click()}
              disabled={importando}
              className="btn"
              style={{
                background: 'white',
                color: 'var(--cor-texto)',
                border: '1px solid #E8E8E8',
                borderRadius: '12px',
                padding: '12px 24px',
                fontSize: '14px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: importando ? 'not-allowed' : 'pointer'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#F5F5F5'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
            >
              <AiOutlineDownload   size={18} />
              {importando ? 'Importando...' : 'Importar Excel'}
            </button>

            <button
              onClick={exportarExcel}
              disabled={produtos.length === 0}
              className="btn"
              style={{
                background: 'white',
                color: 'var(--cor-texto)',
                border: '1px solid #E8E8E8',
                borderRadius: '12px',
                padding: '12px 24px',
                fontSize: '14px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: produtos.length === 0 ? 'not-allowed' : 'pointer',
                opacity: produtos.length === 0 ? 0.5 : 1
              }}
              onMouseOver={(e) => { if (produtos.length > 0) e.currentTarget.style.backgroundColor = '#F5F5F5' }}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
            >
              <AiOutlineUpload size={18} />
              Exportar Excel
          </button>

            {/* Botão Novo Produto */}
            <button
              onClick={() => setModalAberto(true)}
              className='btn'
              style={{
                background: 'var(--cor-primaria)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                padding: '12px 24px',
                fontSize: '14px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'var(--default-transition)',

              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(179,179,179,0.4)'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <span style={{ fontSize: '18px', fontWeight: 'bold' }}>+</span>
              Novo Produto
            </button>
          </div>
        </div>

        {/* Resultado da Importação */}
        {resultadoImportacao && (
          <div style={{
            marginBottom: '24px',
            padding: '16px',
            backgroundColor: '#E5FBF8',
            borderRadius: '12px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ fontSize: '14px', color: 'var(--cor-texto)' }}>
              <FaCheck /> Importação concluída —
              <strong> {resultadoImportacao.adicionados} adicionados</strong>,
              <strong> {resultadoImportacao.atualizados} atualizados</strong>
              {resultadoImportacao.erros > 0 && (
                <span style={{ color: '#FF6B6B' }}>
                  , <strong>{resultadoImportacao.erros} erros</strong>
                </span>
              )}
            </div>
            <button
              onClick={() => setResultadoImportacao(null)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '16px',
                color: 'var(--cor-texto-secundario)'
              }}
            >
              ✕
            </button>
          </div>
        )}

        <TabelaEstoqueClinica
          produtos={produtos}
          onDeletar={deletarProduto}
          onAtualizar={carregarProdutos}
          clinicaId={CLINICA_ID}
        />
      </div>

      <ModalNovoProdutoClinica
        isOpen={modalAberto}
        onClose={() => { setModalAberto(false); carregarProdutos() }}
        clinicaId={CLINICA_ID}
        produtosExistentes={produtos}
      />
    </Layout>
  )
}

export default EstoqueClinica
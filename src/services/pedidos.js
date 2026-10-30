// src/services/pedidos.js
import { supabase } from '../config/supabase'

// fornecedorId: id (uuid) da dental escolhida, ou null se não houver preferência
// itens: [{ nome_produto, marca_id, quantidade, unidade, observacao,
//           estoque_id (opcional), categoria (opcional) }]
export async function criarPedido({ fornecedorId, observacoes, itens }) {
  const { data, error } = await supabase.rpc('criar_pedido', {
    p_fornecedor_id: fornecedorId || null,
    p_observacoes: observacoes || '',
    p_itens: itens
  })

  if (error) throw error
  return data // id do pedido criado
}

// Pedidos da clínica logada (o RLS já filtra pela clínica)
export async function listarMeusPedidos() {
  const { data, error } = await supabase
    .from('pedidos')
    .select(
      'id, status, created_at, quantidade_itens, valor_total, validade_orcamento, fornecedores(nome)'
    )
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}
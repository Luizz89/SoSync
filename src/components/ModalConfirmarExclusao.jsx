function ModalConfirmarExclusao({ isOpen, onConfirmar, onCancelar, nomeProduto }) {
  if (!isOpen) return null

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
      backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex',
      justifyContent: 'center', alignItems: 'center', zIndex: 9999
    }}>
      <div style={{
        backgroundColor: 'white', borderRadius: '20px', padding: '32px',
        width: '420px', boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        textAlign: 'center'
      }}>
        

        <h5 style={{ fontWeight: '600', marginBottom: '8px', color: 'var(--cor-texto)' }}>
          Excluir produto
        </h5>

        <p style={{ color: 'var(--cor-texto-secundario)', fontSize: '14px', marginBottom: '28px' }}>
          Tem certeza que deseja excluir <strong style={{ color: 'var(--cor-texto)' }}>{nomeProduto}</strong>?
          <br />Essa ação não pode ser desfeita.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <button
            onClick={onCancelar}
            className="btn"
            style={{
              padding: '12px', fontSize: '14px', fontWeight: '500',
              borderRadius: '10px', border: '1px solid #E8E8E8',
              backgroundColor: 'white', color: 'var(--cor-texto)'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#F5F5F5'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
          >
            Cancelar
          </button>
          <button
            onClick={onConfirmar}
            className="btn"
            style={{
              padding: '12px', fontSize: '14px', fontWeight: '500',
              borderRadius: '10px', border: 'none',
              backgroundColor: '#FF6B6B', color: 'white'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#ff5252'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#FF6B6B'}
          >
            Excluir
          </button>
        </div>
      </div>
    </div>
  )
}

export default ModalConfirmarExclusao
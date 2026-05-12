function TabelaProdutos({produtos}){
    function calcularNivel(atual, maximo){
        return Math.round((atual/maximo)*100)
    }
}

function getBadgeClass(nivel){
    if (nivel >= 50) return 'bg-success'
    if (nivel >= 20) return 'bg-warning'
    return 'bg-danger'
}

function getStatus(nivel){
    if (nivel >= 50) return 'OK'
    if (nivel >= 20) return 'Atenção'
    return 'Critico'
}

return (
    <div className="card">
        <div className="card-header">
            <h5 className="mb-0">Estoque de Produtos</h5>
        </div>
        <div className="card-body p-0">
            <div className="table-responsive">
                <table className="table table-hover mb-0">
                    <thead className="table-light">
                        <tr>
                            <th>Produto</th>
                            <th>Quantidade</th>
                            <th className="text-center">Nível</th>
                            <th className="text-center">Status</th>
                            <th className="text-end">Preço Unit.</th>
                        </tr>
                    </thead>
                    <tbody>
                        {produtos.map((produtos) => {
                            const nivel = calcularNivel(produtos.qtdAtual, produto.qtdMaxima)
                            return (
                                <tr key={produtos.id}>
                                    <td>
                                        <strong>{produtos.nome}</strong>
                                    </td>
                                    <td>
                                        {produto.qtdAtual} / {produto.qtdMaxima} {produto.unidade}
                                    </td>
                                    <td className="text-center">
                                        <div className="d-flex align-items-center justify-content-center">
                                            <div className="progress" style={{width:'100px', height: '8px'}}>
                                                <div className={'progress-bar ${getBadgeClass(nivel)}'}
                                                style={{ width: '${nivel}%'}}
                                                ></div>
                                            </div>
                                            <span className="ms-2 small text-muted">{nivel}%</span>
                                        </div>
                                    </td>
                                    <td className="text-center">
                                        <span className="badge ${getBadgeClass(nivel)}">
                                            {getStatus(nivel)}
                                        </span>
                                    </td>
                                    <td className="text-end">
                                        R$ {produto.preco.toFixed}
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
)

export default TabelaProdutos
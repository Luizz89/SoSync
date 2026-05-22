import { AiOutlineDelete } from "react-icons/ai";
import { MdOutlineEdit } from "react-icons/md";

function TabelaProdutos({ produtos }) {
  function calcularNivel(atual, maximo) {
    return Math.round((atual / maximo) * 100)
  }

  function getBadgeClass(nivel) {
    if (nivel >= 50) return 'bg-success'
    if (nivel >= 20) return 'bg-warning'
    return 'bg-danger'
  }

  function getStatus(nivel) {
    if (nivel >= 50) return 'OK'
    if (nivel >= 20) return 'Atenção'
    return 'Crítico'
  }

  return (
    <div className="card" style={{
      border: 'white'
      
    }}>
      <div className="card-body p-0">
        <div className="table-responsive" >
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th>Produto</th>
                <th>Quantidade</th>
                <th className="text-center">Nível</th>
                <th className="text-center">Data de Entrada</th>
                <th className="text-center">Data de Validade</th>
                <th className="text-end">Preço Unit.</th>
                <th className="text-end">Ações</th>
              </tr>
            </thead>
            <tbody>
              {produtos.map((produto) => {
                const nivel = calcularNivel(produto.qtdAtual, produto.qtdMaxima)
                return (
                  <tr key={produto.id}>
                    <td><strong>{produto.nome}</strong></td>
                    <td>{produto.qtdAtual} / {produto.qtdMaxima} {produto.unidade}</td>
                    <td className="text-center">
                      <div className="d-flex align-items-center justify-content-center">
                        <div className="progress" style={{ width: '100px', height: '8px' }}>
                          <div
                            className={`progress-bar ${getBadgeClass(nivel)}`}
                            style={{ width: `${nivel}%` }}
                          ></div>
                        </div>
                        <span className="ms-2 small text-muted">{nivel}%</span>
                      </div>
                    </td>
                    <td className="text-end">
                      30/01/2005
                    </td>
                    <td className="text-end">
                      30/01/2025
                    </td>
                    <td className="text-end">
                      R$ {produto.preco.toFixed(2)}
                    </td>
                    <td className="text-end" style={{gap: '10px'}}>
                      <button className="btn btn-outline-secondary" style={{alignItems: 'center', justifyContent: 'center', marginRight: '10px'}}><MdOutlineEdit size={22}/></button>
                      <button className="btn btn-outline-secondary" style={{alignItems: 'center', justifyContent: 'center'}}><AiOutlineDelete size={22}/></button>
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
}

export default TabelaProdutos
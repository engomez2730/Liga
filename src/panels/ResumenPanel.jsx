import { useApp } from '../context/AppContext'
import { hoy, contarSesiones, PAGO_MONTO } from '../utils/helpers'

export default function ResumenPanel() {
  const { integrantes, pagos, gastos, fechaBase, totalPagado } = useApp()

  const totalRec     = pagos.reduce((s, p) => s + p.monto, 0)
  const totalGastado = gastos.reduce((s, g) => s + g.monto, 0)
  const balance      = totalRec - totalGastado

  const sesiones = contarSesiones(fechaBase, hoy())
  const epj      = sesiones * PAGO_MONTO
  const hasData  = integrantes.length > 0 && !!fechaBase
  const totalEsp = hasData ? epj * integrantes.length : 0
  const totalPend = hasData ? Math.max(0, totalEsp - totalRec) : 0

  return (
    <>
      <div className="stats-grid">
        <div className="stat-card yellow-stat">
          <div className="label">💵 Total Esperado</div>
          <div className="value">${totalEsp}</div>
        </div>
        <div className="stat-card green-stat">
          <div className="label">✅ Total Recaudado</div>
          <div className="value">${totalRec}</div>
        </div>
        <div className="stat-card red-stat">
          <div className="label">⚠️ Deuda Pendiente</div>
          <div className="value">${totalPend}</div>
        </div>
        <div className="stat-card purple-stat">
          <div className="label">🧾 Total Gastado</div>
          <div className="value">${totalGastado}</div>
        </div>
        <div className="stat-card blue-stat">
          <div className="label">💼 Balance en Caja</div>
          <div className="value">${balance}</div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">Desglose por Jugador</div>
        {!hasData ? (
          <div className="empty">Sin datos suficientes aún.</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Jugador</th><th>Sesiones</th>
                  <th>Esperado</th><th>Pagado</th><th>Pendiente</th>
                </tr>
              </thead>
              <tbody>
                {integrantes.map((j) => {
                  const pagado    = totalPagado(j.id)
                  const pendiente = Math.max(0, epj - pagado)
                  const deuda     = pendiente > 0
                  return (
                    <tr key={j.id} className={deuda ? 'in-debt' : ''}>
                      <td style={{ fontWeight: 500 }}>{j.nombre}</td>
                      <td className="mono" style={{ color: 'var(--muted)' }}>{sesiones}</td>
                      <td className="mono text-yellow">${epj}</td>
                      <td className="mono text-green">${pagado}</td>
                      <td
                        className={`mono ${deuda ? 'text-red' : 'text-green'}`}
                        style={{ fontWeight: 600 }}
                      >
                        {deuda ? `$${pendiente}` : '✓'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}

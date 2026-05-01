import { useState } from 'react'
import { useApp } from '../context/AppContext'
import {
  hoy, parseFecha, nombreDia, formatFecha,
  DIAS_VALIDOS, PAGO_MONTO,
} from '../utils/helpers'

export default function PagosPanel() {
  const { integrantes, pagos, registrarPago, eliminarPago, nombreJugador, showToast } = useApp()
  const [jugadorId, setJugadorId] = useState('')
  const [fecha,     setFecha]     = useState(hoy())
  const [filtro,    setFiltro]    = useState('')

  const handleRegistrar = async () => {
    if (!jugadorId) { showToast('Selecciona un jugador.', 'warn'); return }
    if (!fecha)     { showToast('Selecciona una fecha.',  'warn'); return }

    const dia = parseFecha(fecha).getDay()
    if (!DIAS_VALIDOS.includes(dia)) {
      showToast(`❌ ${nombreDia(fecha)} no válido. Solo Lunes o Miércoles.`, 'err')
      return
    }
    if (pagos.some((p) => p.jugador_id === jugadorId && p.fecha === fecha)) {
      showToast('⚠️ Ya existe un pago para esa fecha.', 'warn')
      return
    }
    const ok = await registrarPago(jugadorId, fecha)
    if (ok) showToast(`✅ Pago de $${PAGO_MONTO} — ${nombreDia(fecha)} ${formatFecha(fecha)}`)
  }

  const lista = (filtro ? pagos.filter((p) => p.jugador_id === filtro) : pagos)
    .slice()
    .sort((a, b) => b.fecha.localeCompare(a.fecha))

  return (
    <>
      <div className="card">
        <div className="card-title">Registrar Pago</div>
        <p className="section-desc">Solo se aceptan pagos de lunes o miércoles · $25 por sesión</p>
        <div className="form-row">
          <select value={jugadorId} onChange={(e) => setJugadorId(e.target.value)}>
            <option value="">— Seleccionar jugador —</option>
            {integrantes.map((j) => (
              <option key={j.id} value={j.id}>{j.nombre}</option>
            ))}
          </select>
          <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
          <button className="btn btn-green" onClick={handleRegistrar}>Registrar Pago</button>
        </div>
      </div>

      <div className="card">
        <div className="card-title">Historial de Pagos</div>
        <div className="form-row" style={{ marginBottom: 0 }}>
          <select value={filtro} onChange={(e) => setFiltro(e.target.value)}>
            <option value="">Todos los jugadores</option>
            {integrantes.map((j) => (
              <option key={j.id} value={j.id}>{j.nombre}</option>
            ))}
          </select>
        </div>
        <br />
        {lista.length === 0 ? (
          <div className="empty">Sin pagos registrados.</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Jugador</th><th>Fecha</th><th>Día</th><th>Monto</th><th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {lista.map((p) => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 500 }}>{nombreJugador(p.jugador_id)}</td>
                    <td className="mono" style={{ fontSize: 12 }}>{formatFecha(p.fecha)}</td>
                    <td><span className="badge badge-green">{nombreDia(p.fecha)}</span></td>
                    <td className="mono text-green" style={{ fontWeight: 500 }}>${p.monto}</td>
                    <td>
                      <button
                        className="btn btn-ghost"
                        style={{ padding: '6px 12px', fontSize: 11 }}
                        onClick={() => eliminarPago(p.id)}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}

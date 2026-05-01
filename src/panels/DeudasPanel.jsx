import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { hoy, formatFecha, contarSesiones, PAGO_MONTO } from '../utils/helpers'

export default function DeudasPanel() {
  const { integrantes, fechaBase, guardarFechaBase, totalPagado } = useApp()
  const [fechaInput, setFechaInput] = useState(fechaBase)

  const handleGuardar = () => {
    if (!fechaInput) return
    guardarFechaBase(fechaInput)
  }

  const sesiones = contarSesiones(fechaBase, hoy())
  const esperado = sesiones * PAGO_MONTO

  return (
    <>
      <div className="card">
        <div className="card-title">Fecha Base</div>
        <p className="section-desc">
          Desde esta fecha se calculan los lunes y miércoles esperados.
        </p>
        <div className="form-row">
          <input
            type="date"
            value={fechaInput}
            onChange={(e) => setFechaInput(e.target.value)}
          />
          <button className="btn btn-green" onClick={handleGuardar}>
            Guardar fecha base
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card-title">Estado de Deudas</div>

        {fechaBase && (
          <div className="section-desc" style={{ marginBottom: 14 }}>
            Desde <strong>{formatFecha(fechaBase)}</strong> hasta hoy:{' '}
            <span className="text-green">{sesiones} sesiones</span> ·{' '}
            Esperado por jugador:{' '}
            <span className="text-yellow">${esperado}</span>
          </div>
        )}

        {!integrantes.length || !fechaBase ? (
          <div className="empty">
            {!fechaBase
              ? 'Define una fecha base.'
              : 'Agrega integrantes y define una fecha base.'}
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Jugador</th><th>Esperado</th>
                  <th>Pagado</th><th>Pendiente</th><th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {integrantes.map((j) => {
                  const pagado    = totalPagado(j.id)
                  const pendiente = Math.max(0, esperado - pagado)
                  const deuda     = pendiente > 0
                  return (
                    <tr key={j.id} className={deuda ? 'in-debt' : ''}>
                      <td style={{ fontWeight: 500 }}>{j.nombre}</td>
                      <td className="mono text-yellow">${esperado}</td>
                      <td className="mono text-green">${pagado}</td>
                      <td
                        className={`mono ${deuda ? 'text-red' : 'text-green'}`}
                        style={{ fontWeight: 600 }}
                      >
                        {deuda ? `$${pendiente}` : '—'}
                      </td>
                      <td>
                        <span className={`badge ${deuda ? 'badge-red' : 'badge-green'}`}>
                          {deuda ? 'Debe' : 'Al día'}
                        </span>
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

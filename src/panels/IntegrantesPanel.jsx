import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { formatFecha } from '../utils/helpers'

export default function IntegrantesPanel() {
  const { integrantes, agregarIntegrante, eliminarIntegrante } = useApp()
  const [nombre, setNombre] = useState('')

  const handleAgregar = async () => {
    const ok = await agregarIntegrante(nombre)
    if (ok) setNombre('')
  }

  return (
    <>
      <div className="card">
        <div className="card-title">Agregar Integrante</div>
        <div className="form-row">
          <input
            type="text"
            placeholder="Nombre del jugador…"
            maxLength={50}
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAgregar()}
          />
          <button className="btn btn-green" onClick={handleAgregar}>
            Agregar
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card-title">Lista de Integrantes</div>
        {integrantes.length === 0 ? (
          <div className="empty">Aún no hay integrantes registrados.</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Nombre</th>
                  <th>Registrado</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {integrantes.map((j, i) => (
                  <tr key={j.id}>
                    <td className="mono" style={{ color: 'var(--muted)' }}>{i + 1}</td>
                    <td style={{ fontWeight: 500 }}>{j.nombre}</td>
                    <td className="mono" style={{ color: 'var(--muted)', fontSize: 12 }}>
                      {formatFecha(j.fecha_registro)}
                    </td>
                    <td>
                      <button
                        className="btn btn-ghost"
                        style={{ padding: '6px 12px', fontSize: 11 }}
                        onClick={() => eliminarIntegrante(j.id, j.nombre)}
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

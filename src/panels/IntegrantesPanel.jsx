import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { formatFecha } from '../utils/helpers'

export default function IntegrantesPanel() {
  const { integrantes, agregarIntegrante, eliminarIntegrante } = useApp()
  const { isAdmin } = useAuth()
  const [nombre, setNombre] = useState('')
  const [busqueda, setBusqueda] = useState('')

  const handleAgregar = async () => {
    const ok = await agregarIntegrante(nombre)
    if (ok) setNombre('')
  }

  const integrantesFiltrados = busqueda.trim()
    ? integrantes.filter((j) =>
        j.nombre.toLowerCase().includes(busqueda.trim().toLowerCase())
      )
    : integrantes

  return (
    <>
      {isAdmin && (
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
      )}

      <div className="card">
        <div className="card-title">Lista de Integrantes</div>

        <div className="form-row" style={{ marginBottom: 12 }}>
          <input
            type="text"
            placeholder="🔍 Buscar jugador…"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          {busqueda && (
            <button className="btn btn-ghost" style={{ padding: '6px 12px' }} onClick={() => setBusqueda('')}>
              ✕
            </button>
          )}
        </div>

        {integrantes.length === 0 ? (
          <div className="empty">Aún no hay integrantes registrados.</div>
        ) : integrantesFiltrados.length === 0 ? (
          <div className="empty">No se encontraron jugadores con ese nombre.</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Nombre</th>
                  <th>Registrado</th>
                  {isAdmin && <th>Acción</th>}
                </tr>
              </thead>
              <tbody>
                {integrantesFiltrados.map((j, i) => (
                  <tr key={j.id}>
                    <td className="mono" style={{ color: 'var(--muted)' }}>{i + 1}</td>
                    <td style={{ fontWeight: 500 }}>{j.nombre}</td>
                    <td className="mono" style={{ color: 'var(--muted)', fontSize: 12 }}>
                      {formatFecha(j.fecha_registro)}
                    </td>
                    {isAdmin && (
                      <td>
                        <button
                          className="btn btn-ghost"
                          style={{ padding: '6px 12px', fontSize: 11 }}
                          onClick={() => eliminarIntegrante(j.id, j.nombre)}
                        >
                          Eliminar
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!isAdmin && (
          <div className="public-notice">🔒 Inicia sesión como admin para agregar o eliminar jugadores</div>
        )}
      </div>
    </>
  )
}

import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'

export default function TurnosPanel() {
  const {
    integrantes, turnos,
    anotarLlegada, eliminarTurno, resetTurnos,
    nombreJugador,
    fechaEvento, guardarFechaEvento,
  } = useApp()
  const { isAdmin } = useAuth()
  const [jugadorId,       setJugadorId]       = useState('')
  const [editandoFecha,   setEditandoFecha]   = useState(false)
  const [fechaEventoEdit, setFechaEventoEdit] = useState('')

  const handleAnotar = async () => {
    const ok = await anotarLlegada(jugadorId)
    if (ok) setJugadorId('')
  }

  const handleGuardarFecha = async () => {
    const ok = await guardarFechaEvento(fechaEventoEdit)
    if (ok) setEditandoFecha(false)
  }

  const handleEditarFecha = () => {
    setFechaEventoEdit(fechaEvento || '')
    setEditandoFecha(true)
  }

  const sorted  = [...turnos].sort((a, b) => a.posicion - b.posicion)
  const jugando = Math.min(10, sorted.length)
  const espera  = Math.max(0, sorted.length - 10)

  const formatFechaEvento = (f) => {
    if (!f) return null
    const [y, m, d] = f.split('-')
    return `${d}/${m}/${y}`
  }

  return (
    <>
      {/* ── Fecha del evento ────────────────────────────── */}
      <div className="card">
        <div className="card-title">📅 Fecha del Evento</div>
        {editandoFecha ? (
          <div className="form-row">
            <input
              type="date"
              value={fechaEventoEdit}
              onChange={(e) => setFechaEventoEdit(e.target.value)}
            />
            <button className="btn btn-green" onClick={handleGuardarFecha}>Guardar</button>
            <button className="btn btn-ghost" style={{ padding: '6px 14px' }} onClick={() => setEditandoFecha(false)}>Cancelar</button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 18, fontWeight: 600 }}>
              {fechaEvento ? formatFechaEvento(fechaEvento) : <span style={{ color: 'var(--muted)', fontSize: 14 }}>Sin fecha definida</span>}
            </span>
            {isAdmin && (
              <button className="btn btn-ghost" style={{ padding: '4px 12px', fontSize: 12 }} onClick={handleEditarFecha}>
                ✏️ {fechaEvento ? 'Cambiar' : 'Definir fecha'}
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Anotar llegada ──────────────────────────────── */}
      <div className="card">
        <div className="card-title">Anotar Llegada</div>
        <p className="section-desc">
          Los primeros 10 en llegar juegan (verde). El resto queda en espera.
        </p>
        <div className="form-row">
          <select value={jugadorId} onChange={(e) => setJugadorId(e.target.value)}>
            <option value="">— Seleccionar jugador —</option>
            {integrantes.map((j) => (
              <option key={j.id} value={j.id}>{j.nombre}</option>
            ))}
          </select>
          <button className="btn btn-green" onClick={handleAnotar}>⚡ Anotar Llegada</button>
          {isAdmin && (
            <button className="btn btn-red" onClick={resetTurnos}>🔄 Reset</button>
          )}
        </div>
        {sorted.length > 0 && (
          <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>
            <span className="text-green">{jugando} jugando</span>
            {espera > 0 && (
              <> · <span style={{ color: 'var(--muted)' }}>{espera} en espera</span></>
            )}
          </div>
        )}
      </div>

      {/* ── Cola de llegada ─────────────────────────────── */}
      <div className="card">
        <div className="card-title">Cola de Llegada</div>
        {sorted.length === 0 ? (
          <div className="empty">Ningún jugador anotado aún.</div>
        ) : (
          <ul id="turno-list">
            {sorted.map((t, i) => {
              const top10 = i < 10
              return (
                <li key={t.id} className={top10 ? 'playing' : ''} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="pos">{i + 1}</span>
                  <span className="name" style={{ flex: 1 }}>{nombreJugador(t.jugador_id)}</span>
                  {top10
                    ? <span className="tag-play">⚽ Juega</span>
                    : <span style={{ color: 'var(--muted)', fontSize: 11, fontFamily: 'monospace' }}>Espera</span>
                  }
                  {isAdmin && (
                    <button
                      className="btn btn-ghost"
                      style={{ padding: '3px 8px', fontSize: 11, marginLeft: 4 }}
                      onClick={() => eliminarTurno(t.id)}
                    >
                      ✕
                    </button>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </>
  )
}

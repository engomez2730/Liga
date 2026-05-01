import { useState } from 'react'
import { useApp } from '../context/AppContext'

export default function TurnosPanel() {
  const { integrantes, turnos, anotarLlegada, resetTurnos, nombreJugador } = useApp()
  const [jugadorId, setJugadorId] = useState('')

  const handleAnotar = async () => {
    const ok = await anotarLlegada(jugadorId)
    if (ok) setJugadorId('')
  }

  const sorted  = [...turnos].sort((a, b) => a.posicion - b.posicion)
  const jugando = Math.min(10, sorted.length)
  const espera  = Math.max(0, sorted.length - 10)

  return (
    <>
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
          <button className="btn btn-red"   onClick={resetTurnos}>🔄 Reset</button>
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

      <div className="card">
        <div className="card-title">Cola de Llegada</div>
        {sorted.length === 0 ? (
          <div className="empty">Ningún jugador anotado aún.</div>
        ) : (
          <ul id="turno-list">
            {sorted.map((t, i) => {
              const top10 = i < 10
              return (
                <li key={t.id} className={top10 ? 'playing' : ''}>
                  <span className="pos">{i + 1}</span>
                  <span className="name">{nombreJugador(t.jugador_id)}</span>
                  {top10
                    ? <span className="tag-play">⚽ Juega</span>
                    : <span style={{ color: 'var(--muted)', fontSize: 11, fontFamily: 'monospace' }}>
                        Espera
                      </span>
                  }
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </>
  )
}

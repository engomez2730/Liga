import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { hoy, formatFecha, CATEGORIAS, CATEGORIA_BADGE } from '../utils/helpers'

export default function GastosPanel() {
  const { pagos, gastos, registrarGasto, eliminarGasto, showToast } = useApp()
  const { isAdmin } = useAuth()

  const [concepto,  setConcepto]  = useState('')
  const [monto,     setMonto]     = useState('')
  const [fecha,     setFecha]     = useState(hoy())
  const [categoria, setCategoria] = useState('Cancha')
  const [nota,      setNota]      = useState('')
  const [filtro,    setFiltro]    = useState('')

  const handleRegistrar = async () => {
    if (!concepto.trim())       { showToast('Escribe el concepto del gasto.', 'warn'); return }
    if (!monto || +monto <= 0)  { showToast('Ingresa un monto válido.', 'warn');       return }
    if (!fecha)                 { showToast('Selecciona la fecha.', 'warn');            return }

    const ok = await registrarGasto({
      concepto: concepto.trim(), categoria, fecha,
      monto: +monto, nota: nota.trim(),
    })
    if (ok) {
      showToast(`✅ Gasto $${monto} — ${concepto.trim()}`)
      setConcepto(''); setMonto(''); setNota('')
    }
  }

  const totalGastado = gastos.reduce((s, g) => s + g.monto, 0)
  const totalRec     = pagos.reduce((s, p) => s + p.monto, 0)
  const balance      = totalRec - totalGastado

  const lista = (filtro ? gastos.filter((g) => g.categoria === filtro) : gastos)
    .slice()
    .sort((a, b) => b.fecha.localeCompare(a.fecha))

  return (
    <>
      {isAdmin && (
        <div className="card">
          <div className="card-title">Registrar Gasto</div>
          <p className="section-desc">
            Anota en qué y dónde se utilizó el dinero recaudado de la liga.
          </p>
          <div className="form-row">
            <input
              type="text" placeholder="Concepto (ej: Cancha, Árbitro…)" maxLength={80}
              value={concepto} onChange={(e) => setConcepto(e.target.value)}
            />
            <input
              type="number" placeholder="Monto $" min={1} step={1}
              style={{ maxWidth: 130 }} value={monto} onChange={(e) => setMonto(e.target.value)}
            />
            <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
          </div>
          <div className="form-row" style={{ alignItems: 'flex-start' }}>
            <select value={categoria} onChange={(e) => setCategoria(e.target.value)}>
              {CATEGORIAS.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
            <textarea
              placeholder="Nota adicional (opcional)…" style={{ minHeight: 42 }}
              value={nota} onChange={(e) => setNota(e.target.value)}
            />
            <button className="btn btn-yellow" onClick={handleRegistrar}>Registrar Gasto</button>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-title">Historial de Gastos</div>

        {/* Stats rápidos */}
        <div className="stats-grid" style={{ marginBottom: 16 }}>
          <div className="stat-card purple-stat">
            <div className="label">🧾 Total Gastado</div>
            <div className="value">${totalGastado}</div>
          </div>
          <div className="stat-card green-stat">
            <div className="label">💰 Total Recaudado</div>
            <div className="value">${totalRec}</div>
          </div>
          <div className={`stat-card ${balance >= 0 ? 'blue-stat' : 'red-stat'}`}>
            <div className="label">💼 Balance en Caja</div>
            <div className="value">${balance}</div>
          </div>
        </div>

        {/* Filtro categoría */}
        <div className="form-row" style={{ marginBottom: 10 }}>
          <select value={filtro} onChange={(e) => setFiltro(e.target.value)}>
            <option value="">Todas las categorías</option>
            {CATEGORIAS.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>

        {lista.length === 0 ? (
          <div className="empty">Sin gastos registrados.</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Concepto</th><th>Categoría</th><th>Fecha</th>
                  <th>Nota</th><th>Monto</th>
                  {isAdmin && <th>Acción</th>}
                </tr>
              </thead>
              <tbody>
                {lista.map((g) => (
                  <tr key={g.id}>
                    <td style={{ fontWeight: 500 }}>{g.concepto}</td>
                    <td>
                      <span className={`badge ${CATEGORIA_BADGE[g.categoria] ?? 'badge-muted'}`}>
                        {g.categoria}
                      </span>
                    </td>
                    <td className="mono" style={{ fontSize: 12 }}>{formatFecha(g.fecha)}</td>
                    <td style={{ color: 'var(--muted)', fontSize: 12, maxWidth: 180 }}>
                      {g.nota || '—'}
                    </td>
                    <td className="mono text-purple" style={{ fontWeight: 600 }}>${g.monto}</td>
                    {isAdmin && (
                      <td>
                        <button
                          className="btn btn-ghost"
                          style={{ padding: '6px 12px', fontSize: 11 }}
                          onClick={() => eliminarGasto(g.id)}
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
          <div className="public-notice">🔒 Inicia sesión como admin para registrar o eliminar gastos</div>
        )}
      </div>
    </>
  )
}

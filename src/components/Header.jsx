import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import LoginModal from './LoginModal'

export default function Header() {
  const [clock,     setClock]     = useState('—')
  const [showLogin, setShowLogin] = useState(false)
  const { isAdmin, session, signOut } = useAuth()

  useEffect(() => {
    const update = () => {
      const d   = new Date()
      const dia = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'][d.getDay()]
      setClock(`${dia}  ${d.toLocaleTimeString('es-DO', { hour12: false })}`)
    }
    update()
    const t = setInterval(update, 1000)
    return () => clearInterval(t)
  }, [])

  return (
    <>
      <header>
        <div className="logo">🏀🇩🇴 Liga <span>La Dominicana</span></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div id="live-clock">{clock}</div>
          {isAdmin ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span className="admin-badge">⚡ Admin</span>
              <span style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'DM Mono, monospace', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {session.user.email}
              </span>
              <button
                className="btn btn-ghost"
                style={{ padding: '5px 12px', fontSize: 11 }}
                onClick={signOut}
              >
                Salir
              </button>
            </div>
          ) : (
            <button
              className="btn btn-ghost"
              style={{ padding: '5px 12px', fontSize: 11 }}
              onClick={() => setShowLogin(true)}
            >
              🔐 Admin
            </button>
          )}
        </div>
      </header>
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </>
  )
}

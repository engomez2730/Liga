import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function LoginModal({ onClose }) {
  const { signIn } = useAuth()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const err = await signIn(email, password)
    setLoading(false)
    if (err) {
      setError('Credenciales incorrectas. Verifica tu correo y contraseña.')
    } else {
      onClose()
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="card-title">🔐 Acceso Administrador</div>
        <p className="section-desc" style={{ marginTop: 0, marginBottom: 18 }}>
          Ingresa con tu cuenta de administrador para gestionar integrantes, pagos y gastos.
        </p>
        <form onSubmit={handleSubmit}>
          <div className="form-row" style={{ flexDirection: 'column', gap: 12 }}>
            <input
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
              required
            />
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {error && (
              <div style={{ color: 'var(--red)', fontSize: 13 }}>{error}</div>
            )}
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-green" type="submit" disabled={loading}>
                {loading ? 'Ingresando…' : 'Ingresar'}
              </button>
              <button className="btn btn-ghost" type="button" onClick={onClose}>
                Cancelar
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

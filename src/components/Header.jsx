import { useState, useEffect } from 'react'

export default function Header() {
  const [clock, setClock] = useState('—')

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
    <header>
      <div className="logo">⚽ Liga <span>PRO</span></div>
      <div id="live-clock">{clock}</div>
    </header>
  )
}

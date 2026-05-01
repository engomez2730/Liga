export const PAGO_MONTO   = 25
export const DIAS_VALIDOS = [1, 3] // Lunes=1, Miércoles=3

export const CATEGORIAS = [
  { value: 'Cancha',       label: '🏟️ Cancha'       },
  { value: 'Árbitro',      label: '🦺 Árbitro'      },
  { value: 'Equipamiento', label: '👕 Equipamiento'  },
  { value: 'Balón',        label: '⚽ Balón'         },
  { value: 'Refrigerio',   label: '🥤 Refrigerio'   },
  { value: 'Transporte',   label: '🚌 Transporte'    },
  { value: 'Premiación',   label: '🏅 Premiación'    },
  { value: 'Varios',       label: '📦 Varios'        },
]

export const CATEGORIA_BADGE = {
  Cancha:       'badge-blue',
  Árbitro:      'badge-yellow',
  Equipamiento: 'badge-purple',
  Balón:        'badge-green',
  Refrigerio:   'badge-muted',
  Transporte:   'badge-muted',
  Premiación:   'badge-yellow',
  Varios:       'badge-muted',
}

export const hoy = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export const parseFecha = (str) => {
  const [y, m, d] = str.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export const nombreDia = (str) =>
  ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][parseFecha(str).getDay()]

export const formatFecha = (str) =>
  parseFecha(str).toLocaleDateString('es-DO', { day: '2-digit', month: 'short', year: 'numeric' })

export const contarSesiones = (desdeStr, hastaStr) => {
  if (!desdeStr) return 0
  const desde = parseFecha(desdeStr)
  const hasta  = parseFecha(hastaStr || hoy())
  let n = 0
  const cur = new Date(desde)
  while (cur <= hasta) {
    const d = cur.getDay()
    if (d === 1 || d === 3) n++
    cur.setDate(cur.getDate() + 1)
  }
  return n
}

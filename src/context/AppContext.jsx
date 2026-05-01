import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { hoy, PAGO_MONTO } from '../utils/helpers'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [integrantes, setIntegrantes] = useState([])
  const [pagos,       setPagos]       = useState([])
  const [gastos,      setGastos]      = useState([])
  const [turnos,      setTurnos]      = useState([]) // [{ id, jugador_id, posicion }]
  const [fechaBase,   setFechaBase]   = useState('')
  const [loading,     setLoading]     = useState(true)
  const [toast,       setToast]       = useState({ msg: '', tipo: 'ok', visible: false })
  const toastTimer = useRef(null)

  /* ── Toast ─────────────────────────────────────────────── */
  const showToast = useCallback((msg, tipo = 'ok') => {
    setToast({ msg, tipo, visible: true })
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(
      () => setToast((t) => ({ ...t, visible: false })),
      3200
    )
  }, [])

  /* ── Cargar todo desde Supabase ─────────────────────────── */
  const loadData = useCallback(async () => {
    setLoading(true)
    const [
      { data: intData,  error: e1 },
      { data: pagData,  error: e2 },
      { data: gasData,  error: e3 },
      { data: turData,  error: e4 },
      { data: cfgData,  error: e5 },
    ] = await Promise.all([
      supabase.from('integrantes').select('*').order('created_at'),
      supabase.from('pagos').select('*').order('fecha', { ascending: false }),
      supabase.from('gastos').select('*').order('fecha', { ascending: false }),
      supabase.from('turnos').select('*').order('posicion'),
      supabase.from('configuracion').select('*'),
    ])

    if (e1 || e2 || e3 || e4 || e5) {
      showToast('Error cargando datos. Verifica tu conexión y las variables de entorno.', 'err')
    }

    setIntegrantes(intData  || [])
    setPagos(pagData        || [])
    setGastos(gasData       || [])
    setTurnos(turData       || [])

    const fb = (cfgData || []).find((c) => c.key === 'fecha_base')
    if (fb) setFechaBase(fb.value)

    setLoading(false)
  }, [showToast])

  useEffect(() => { loadData() }, [loadData])

  /* ── Helpers derivados ──────────────────────────────────── */
  const nombreJugador = useCallback(
    (id) => (integrantes.find((i) => i.id === id)?.nombre ?? '(eliminado)'),
    [integrantes]
  )

  const totalPagado = useCallback(
    (id) => pagos.filter((p) => p.jugador_id === id).reduce((s, p) => s + p.monto, 0),
    [pagos]
  )

  /* ── INTEGRANTES ────────────────────────────────────────── */
  const agregarIntegrante = async (nombre) => {
    const trimmed = nombre.trim()
    if (!trimmed) { showToast('Escribe el nombre.', 'warn'); return false }
    if (integrantes.some((i) => i.nombre.toLowerCase() === trimmed.toLowerCase())) {
      showToast('Ya existe ese jugador.', 'err'); return false
    }
    const { data, error } = await supabase
      .from('integrantes')
      .insert({ nombre: trimmed, fecha_registro: hoy() })
      .select().single()
    if (error) { showToast('Error al agregar jugador.', 'err'); return false }
    setIntegrantes((prev) => [...prev, data])
    showToast(`✅ ${trimmed} agregado.`)
    return true
  }

  const eliminarIntegrante = async (id, nombre) => {
    if (!confirm(`¿Eliminar a "${nombre}"?\nSe borrarán sus pagos y turnos.`)) return false
    const { error } = await supabase.from('integrantes').delete().eq('id', id)
    if (error) { showToast('Error al eliminar jugador.', 'err'); return false }
    setIntegrantes((prev) => prev.filter((i) => i.id !== id))
    setPagos((prev)       => prev.filter((p) => p.jugador_id !== id))
    setTurnos((prev)      => prev.filter((t) => t.jugador_id !== id))
    showToast(`🗑️ ${nombre} eliminado.`, 'warn')
    return true
  }

  /* ── PAGOS ──────────────────────────────────────────────── */
  const registrarPago = async (jugadorId, fecha) => {
    const { data, error } = await supabase
      .from('pagos')
      .insert({ jugador_id: jugadorId, fecha, monto: PAGO_MONTO })
      .select().single()
    if (error) {
      if (error.code === '23505') showToast('⚠️ Ya existe un pago para esa fecha.', 'warn')
      else showToast('Error al registrar pago.', 'err')
      return false
    }
    setPagos((prev) => [data, ...prev])
    return true
  }

  const eliminarPago = async (id) => {
    const { error } = await supabase.from('pagos').delete().eq('id', id)
    if (error) { showToast('Error al eliminar pago.', 'err'); return false }
    setPagos((prev) => prev.filter((p) => p.id !== id))
    showToast('🗑️ Pago eliminado.', 'warn')
    return true
  }

  /* ── GASTOS ─────────────────────────────────────────────── */
  const registrarGasto = async (gasto) => {
    const { data, error } = await supabase.from('gastos').insert(gasto).select().single()
    if (error) { showToast('Error al registrar gasto.', 'err'); return false }
    setGastos((prev) => [data, ...prev])
    return true
  }

  const eliminarGasto = async (id) => {
    const { error } = await supabase.from('gastos').delete().eq('id', id)
    if (error) { showToast('Error al eliminar gasto.', 'err'); return false }
    setGastos((prev) => prev.filter((g) => g.id !== id))
    showToast('🗑️ Gasto eliminado.', 'warn')
    return true
  }

  /* ── TURNOS ─────────────────────────────────────────────── */
  const anotarLlegada = async (jugadorId) => {
    if (!jugadorId) { showToast('Selecciona un jugador.', 'warn'); return false }
    if (turnos.some((t) => t.jugador_id === jugadorId)) {
      showToast(`⚠️ ${nombreJugador(jugadorId)} ya está en lista.`, 'warn'); return false
    }
    const posicion = turnos.length + 1
    const { data, error } = await supabase
      .from('turnos')
      .insert({ jugador_id: jugadorId, posicion })
      .select().single()
    if (error) { showToast('Error al anotar llegada.', 'err'); return false }
    setTurnos((prev) => [...prev, data])
    showToast(`✅ ${nombreJugador(jugadorId)} → posición #${posicion}`)
    return true
  }

  const resetTurnos = async () => {
    if (!turnos.length || !confirm('¿Limpiar lista de llegadas?')) return false
    const { error } = await supabase.from('turnos').delete().gt('posicion', 0)
    if (error) { showToast('Error al reiniciar turnos.', 'err'); return false }
    setTurnos([])
    showToast('🔄 Lista reiniciada.', 'warn')
    return true
  }

  /* ── FECHA BASE ─────────────────────────────────────────── */
  const guardarFechaBase = async (fecha) => {
    if (!fecha) { showToast('Selecciona una fecha.', 'warn'); return false }
    const { error } = await supabase
      .from('configuracion')
      .upsert({ key: 'fecha_base', value: fecha }, { onConflict: 'key' })
    if (error) { showToast('Error al guardar fecha base.', 'err'); return false }
    setFechaBase(fecha)
    showToast('📅 Fecha base guardada.')
    return true
  }

  /* ── IMPORTAR DATOS ─────────────────────────────────────── */
  const importarDatos = async (datos) => {
    // Borrar todo primero
    await supabase.from('turnos').delete().gt('posicion', 0)
    await supabase.from('pagos').delete().not('id', 'is', null)
    await supabase.from('gastos').delete().not('id', 'is', null)
    await supabase.from('integrantes').delete().not('id', 'is', null)
    await supabase.from('configuracion').delete().not('key', 'is', null)

    // Mapeo de IDs (old HTML app usa IDs cortos, aquí necesitamos UUIDs)
    const idMap = {}

    // Insertar integrantes
    if (datos.integrantes?.length) {
      const rows = datos.integrantes.map((i) => ({
        nombre:         i.nombre,
        fecha_registro: i.fechaRegistro || i.fecha_registro || hoy(),
      }))
      const { data: ins } = await supabase.from('integrantes').insert(rows).select()
      if (ins) datos.integrantes.forEach((old, idx) => { idMap[old.id] = ins[idx]?.id })
    }

    // Insertar pagos
    if (datos.pagos?.length) {
      const rows = datos.pagos.map((p) => ({
        jugador_id: idMap[p.jugadorId ?? p.jugador_id] ?? p.jugador_id,
        fecha:      p.fecha,
        monto:      p.monto ?? PAGO_MONTO,
      }))
      await supabase.from('pagos').insert(rows)
    }

    // Insertar gastos
    if (datos.gastos?.length) {
      const rows = datos.gastos.map((g) => ({
        concepto:   g.concepto,
        categoria:  g.categoria,
        fecha:      g.fecha,
        monto:      g.monto,
        nota:       g.nota || '',
      }))
      await supabase.from('gastos').insert(rows)
    }

    // Insertar turnos — soporta ambos formatos: array de IDs o array de objetos
    const turnosIds = Array.isArray(datos.turnos)
      ? typeof datos.turnos[0] === 'string'
        ? datos.turnos
        : datos.turnos.sort((a, b) => a.posicion - b.posicion).map((t) => t.jugador_id)
      : []
    if (turnosIds.length) {
      const rows = turnosIds.map((oldId, i) => ({
        jugador_id: idMap[oldId] ?? oldId,
        posicion:   i + 1,
      }))
      await supabase.from('turnos').insert(rows)
    }

    // Guardar fechaBase
    if (datos.fechaBase) {
      await supabase.from('configuracion')
        .upsert({ key: 'fecha_base', value: datos.fechaBase }, { onConflict: 'key' })
    }

    await loadData()
    return true
  }

  /* ── BORRAR TODO ────────────────────────────────────────── */
  const borrarTodo = async () => {
    if (!confirm('⚠️ ¿Borrar TODOS los datos? Esta acción es irreversible.')) return false
    if (!confirm('Última confirmación: ¿estás seguro?')) return false

    await supabase.from('turnos').delete().gt('posicion', 0)
    await supabase.from('pagos').delete().not('id', 'is', null)
    await supabase.from('gastos').delete().not('id', 'is', null)
    await supabase.from('integrantes').delete().not('id', 'is', null)
    await supabase.from('configuracion').delete().not('key', 'is', null)

    setIntegrantes([])
    setPagos([])
    setGastos([])
    setTurnos([])
    setFechaBase('')
    showToast('🗑️ Todos los datos fueron borrados.', 'warn')
    return true
  }

  /* ── Context value ──────────────────────────────────────── */
  return (
    <AppContext.Provider
      value={{
        integrantes, pagos, gastos, turnos, fechaBase,
        loading, toast, showToast,
        agregarIntegrante, eliminarIntegrante,
        registrarPago, eliminarPago,
        registrarGasto, eliminarGasto,
        anotarLlegada, resetTurnos,
        guardarFechaBase,
        importarDatos, borrarTodo,
        nombreJugador, totalPagado,
        loadData,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)

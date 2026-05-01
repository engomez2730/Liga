import { useRef, useState } from 'react'
import { useApp } from '../context/AppContext'
import { hoy, nombreDia, PAGO_MONTO } from '../utils/helpers'

export default function DatosPanel() {
  const {
    integrantes, pagos, gastos, turnos, fechaBase,
    borrarTodo, importarDatos, showToast, nombreJugador,
  } = useApp()

  const [importStatus, setImportStatus] = useState(null) // { ok: bool, msg: string }
  const fileRef = useRef(null)

  /* ── Exportar ──────────────────────────────────────────── */
  const descargar = (contenido, nombre, tipo) => {
    const a   = document.createElement('a')
    a.href    = URL.createObjectURL(new Blob([contenido], { type: tipo }))
    a.download = nombre
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const exportarJSON = () => {
    const sorted = [...turnos].sort((a, b) => a.posicion - b.posicion)
    const datos  = {
      version:     '2.0-react',
      exportado:   new Date().toISOString(),
      integrantes,
      pagos,
      gastos,
      turnos:      sorted.map((t) => t.jugador_id),
      fechaBase,
    }
    descargar(JSON.stringify(datos, null, 2), `liga-respaldo-${hoy()}.json`, 'application/json')
    showToast('✅ Respaldo descargado.')
  }

  const exportarCSV = () => {
    if (!pagos.length) { showToast('No hay pagos para exportar.', 'warn'); return }
    const rows = [
      ['Jugador', 'Fecha', 'Dia', 'Monto'],
      ...[...pagos].sort((a, b) => b.fecha.localeCompare(a.fecha))
        .map((p) => [nombreJugador(p.jugador_id), p.fecha, nombreDia(p.fecha), p.monto]),
    ]
    descargar(rows.map((r) => r.join(',')).join('\n'), `liga-pagos-${hoy()}.csv`, 'text/csv;charset=utf-8;')
    showToast('📄 CSV de pagos descargado.')
  }

  const exportarGastosCSV = () => {
    if (!gastos.length) { showToast('No hay gastos para exportar.', 'warn'); return }
    const rows = [
      ['Concepto', 'Categoria', 'Fecha', 'Monto', 'Nota'],
      ...[...gastos].sort((a, b) => b.fecha.localeCompare(a.fecha))
        .map((g) => [g.concepto, g.categoria, g.fecha, g.monto, g.nota || '']),
    ]
    descargar(
      rows.map((r) => r.map((v) => `"${v}"`).join(',')).join('\n'),
      `liga-gastos-${hoy()}.csv`,
      'text/csv;charset=utf-8;'
    )
    showToast('📄 CSV de gastos descargado.')
  }

  /* ── Importar ──────────────────────────────────────────── */
  const procesarArchivo = (archivo) => {
    if (!archivo || !archivo.name.endsWith('.json')) {
      showToast('Solo archivos .json', 'err'); return
    }
    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const datos = JSON.parse(e.target.result)
        if (!Array.isArray(datos.integrantes) || !Array.isArray(datos.pagos))
          throw new Error('Formato inválido.')

        if (!confirm(
          `¿Importar este respaldo?\n\n` +
          `· ${datos.integrantes.length} integrantes\n` +
          `· ${datos.pagos.length} pagos\n` +
          `· ${(datos.gastos || []).length} gastos\n\n` +
          `⚠️ Reemplazará TODOS los datos actuales.`
        )) { if (fileRef.current) fileRef.current.value = ''; return }

        setImportStatus({ ok: null, msg: 'Importando datos…' })
        await importarDatos(datos)
        setImportStatus({ ok: true, msg: `✅ Importación exitosa — ${new Date().toLocaleString('es-DO')}` })
        showToast('✅ Datos importados correctamente.')
      } catch (err) {
        setImportStatus({ ok: false, msg: `❌ Error: ${err.message}` })
        showToast('❌ No se pudo leer el archivo.', 'err')
      } finally {
        if (fileRef.current) fileRef.current.value = ''
      }
    }
    reader.readAsText(archivo)
  }

  return (
    <>
      {/* EXPORTAR */}
      <div className="card">
        <div className="card-title">📤 Exportar Datos</div>
        <p className="section-desc">
          Descarga un archivo <strong>.json</strong> con todos los datos de la liga
          (integrantes, pagos, gastos, turnos y configuración).<br />
          Guárdalo como respaldo o transfiérelo a otro dispositivo.
        </p>
        <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 14 }}>
          Datos actuales: {integrantes.length} integrantes · {pagos.length} pagos · {gastos.length} gastos
        </div>
        <div className="form-row">
          <button className="btn btn-green"  onClick={exportarJSON}>⬇️ Descargar respaldo (.json)</button>
          <button className="btn btn-yellow" onClick={exportarCSV}>📄 Exportar pagos (.csv)</button>
          <button className="btn btn-purple" onClick={exportarGastosCSV}>📄 Exportar gastos (.csv)</button>
        </div>
      </div>

      {/* IMPORTAR */}
      <div className="card">
        <div className="card-title">📥 Importar Datos</div>
        <p className="section-desc">
          Carga un archivo <strong>.json</strong> exportado desde esta app.{' '}
          <span className="text-red">⚠️ Esto reemplazará todos los datos actuales.</span>{' '}
          Exporta un respaldo primero.
        </p>
        <label
          className="import-zone"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); procesarArchivo(e.dataTransfer.files[0]) }}
        >
          <div className="import-icon">📂</div>
          <div>Haz clic para seleccionar el archivo <strong>.json</strong></div>
          <div style={{ fontSize: 12, marginTop: 6 }}>o arrastra el archivo aquí</div>
          <input
            type="file" ref={fileRef} accept=".json"
            style={{ display: 'none' }}
            onChange={(e) => procesarArchivo(e.target.files[0])}
          />
        </label>
        {importStatus && (
          <div
            style={{
              fontSize: 13, marginTop: 4,
              color: importStatus.ok === true
                ? 'var(--green)'
                : importStatus.ok === false
                  ? 'var(--red)'
                  : 'var(--muted)',
            }}
          >
            {importStatus.msg}
          </div>
        )}
      </div>

      {/* ZONA DE PELIGRO */}
      <div className="card" style={{ borderColor: 'var(--red-dim)' }}>
        <div className="card-title" style={{ color: 'var(--red)' }}>⚠️ Zona de Peligro</div>
        <p className="section-desc">Esta acción es irreversible. Exporta un respaldo antes de continuar.</p>
        <div className="form-row">
          <button className="btn btn-red" onClick={borrarTodo}>🗑️ Borrar todos los datos</button>
        </div>
      </div>
    </>
  )
}

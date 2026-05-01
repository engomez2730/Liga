import { useState } from 'react'
import { AppProvider } from './context/AppContext'
import { useApp } from './context/AppContext'
import Header from './components/Header'
import Nav from './components/Nav'
import Toast from './components/Toast'
import IntegrantesPanel from './panels/IntegrantesPanel'
import PagosPanel from './panels/PagosPanel'
import DeudasPanel from './panels/DeudasPanel'
import GastosPanel from './panels/GastosPanel'
import ResumenPanel from './panels/ResumenPanel'
import TurnosPanel from './panels/TurnosPanel'
import DatosPanel from './panels/DatosPanel'

const TABS = [
  { id: 'integrantes', label: '👥 Integrantes' },
  { id: 'pagos',       label: '💰 Pagos'        },
  { id: 'deudas',      label: '📊 Deudas'       },
  { id: 'gastos',      label: '🧾 Gastos'       },
  { id: 'resumen',     label: '🏆 Resumen'      },
  { id: 'turnos',      label: '📋 Turnos'       },
  { id: 'datos',       label: '💾 Datos'        },
]

function AppContent() {
  const { loading } = useApp()
  const [activeTab, setActiveTab] = useState('integrantes')

  return (
    <>
      <Header />
      <Nav tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />
      <main>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--muted)', fontSize: 14 }}>
            Cargando datos…
          </div>
        ) : (
          <>
            {activeTab === 'integrantes' && <IntegrantesPanel />}
            {activeTab === 'pagos'       && <PagosPanel />}
            {activeTab === 'deudas'      && <DeudasPanel />}
            {activeTab === 'gastos'      && <GastosPanel />}
            {activeTab === 'resumen'     && <ResumenPanel />}
            {activeTab === 'turnos'      && <TurnosPanel />}
            {activeTab === 'datos'       && <DatosPanel />}
          </>
        )}
      </main>
      <Toast />
    </>
  )
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  )
}

import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import { useLocation } from 'react-router-dom'

const TITLES = {
  '/':           { title: 'Dashboard',         subtitle: 'Vue d\'ensemble du portefeuille et des performances COFINA' },
  '/indicators': { title: 'Indicateurs',       subtitle: 'Suivi des indicateurs financiers, sociaux, environnementaux et de gouvernance' },
  '/bailleurs':  { title: 'Bailleurs',         subtitle: 'Gestion des partenaires financiers et de leurs exigences de reporting' },
  '/masterfile': { title: 'MasterFile',        subtitle: 'Import et gestion des données centralisées' },
  '/reports':    { title: 'Rapports',          subtitle: 'Génération et archivage des rapports par bailleur' },
  '/settings':   { title: 'Paramètres',        subtitle: 'Configuration de la plateforme' },
}

export default function Layout() {
  const location = useLocation()
  const page = TITLES[location.pathname] || { title: 'COFINA Reporting', subtitle: '' }

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-64 overflow-hidden">
        <Header title={page.title} subtitle={page.subtitle} />
        <main className="flex-1 overflow-y-auto p-6 animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

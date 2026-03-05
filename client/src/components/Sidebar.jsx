import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, BarChart3, Users2, FileText,
  Upload, Settings, ChevronRight, TrendingUp
} from 'lucide-react'

const NAV = [
  { to: '/',           icon: LayoutDashboard, label: 'Dashboard'    },
  { to: '/indicators', icon: BarChart3,        label: 'Indicateurs'  },
  { to: '/bailleurs',  icon: Users2,           label: 'Bailleurs'    },
  { to: '/masterfile', icon: Upload,           label: 'MasterFile'   },
  { to: '/reports',    icon: FileText,         label: 'Rapports'     },
]

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-slate-950 border-r border-slate-800 flex flex-col z-40">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cofina-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <TrendingUp size={18} className="text-white" />
          </div>
          <div>
            <div className="font-bold text-white text-sm tracking-wide">COFINA</div>
            <div className="text-[10px] text-slate-500 uppercase tracking-widest">Reporting</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 mb-3">
          <span className="text-[10px] uppercase tracking-widest text-slate-600 font-semibold">Menu principal</span>
        </div>
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-cofina-600/20 text-cofina-300 border border-cofina-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={17} className={isActive ? 'text-cofina-400' : 'text-slate-500 group-hover:text-slate-300'} />
                <span className="flex-1">{label}</span>
                {isActive && <ChevronRight size={14} className="text-cofina-500" />}
              </>
            )}
          </NavLink>
        ))}

        <div className="px-3 mt-6 mb-3">
          <span className="text-[10px] uppercase tracking-widest text-slate-600 font-semibold">Système</span>
        </div>
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
              isActive
                ? 'bg-cofina-600/20 text-cofina-300 border border-cofina-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`
          }
        >
          <Settings size={17} className="text-slate-500 group-hover:text-slate-300" />
          <span>Paramètres</span>
        </NavLink>
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cofina-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow">
            CF
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-slate-200 truncate">COFINA Group</div>
            <div className="text-[10px] text-slate-500">Impact & Reporting</div>
          </div>
        </div>
        <div className="mt-3 text-[10px] text-slate-700 text-center">v1.0.0 — 2025</div>
      </div>
    </aside>
  )
}

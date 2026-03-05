import { Bell, Search, Calendar } from 'lucide-react'

export default function Header({ title, subtitle }) {
  const today = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  })

  return (
    <header className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-sm border-b border-slate-800 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Title */}
        <div>
          <h1 className="text-lg font-semibold text-white leading-tight">{title}</h1>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative hidden md:flex items-center">
            <Search size={14} className="absolute left-3 text-slate-500" />
            <input
              type="text"
              placeholder="Rechercher..."
              className="bg-slate-800/60 border border-slate-700/50 text-slate-300 text-sm rounded-lg pl-8 pr-4 py-1.5 w-48 focus:outline-none focus:border-cofina-500/50 placeholder-slate-600"
            />
          </div>

          {/* Date */}
          <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-500 bg-slate-800/40 px-3 py-1.5 rounded-lg border border-slate-700/40">
            <Calendar size={12} />
            <span className="capitalize">{today}</span>
          </div>

          {/* Notifications */}
          <button className="relative p-2 rounded-lg bg-slate-800/60 border border-slate-700/50 text-slate-400 hover:text-slate-200 transition-colors">
            <Bell size={16} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full ring-1 ring-slate-950" />
          </button>

          {/* Avatar */}
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cofina-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold cursor-pointer hover:ring-2 hover:ring-cofina-500/50 transition-all">
            CF
          </div>
        </div>
      </div>
    </header>
  )
}

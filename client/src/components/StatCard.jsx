import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

export default function StatCard({ label, value, sub, trend, trendLabel, icon: Icon, color = 'indigo', large = false }) {
  const colorMap = {
    indigo:  { bg: 'bg-indigo-500/10',  text: 'text-indigo-400',  border: 'border-indigo-500/20'  },
    emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
    blue:    { bg: 'bg-blue-500/10',    text: 'text-blue-400',    border: 'border-blue-500/20'    },
    amber:   { bg: 'bg-amber-500/10',   text: 'text-amber-400',   border: 'border-amber-500/20'   },
    red:     { bg: 'bg-red-500/10',     text: 'text-red-400',     border: 'border-red-500/20'     },
  }
  const c = colorMap[color] || colorMap.indigo

  const trendIcon = trend > 0
    ? <TrendingUp size={12} className="text-emerald-400" />
    : trend < 0
      ? <TrendingDown size={12} className="text-red-400" />
      : <Minus size={12} className="text-slate-500" />

  const trendColor = trend > 0 ? 'text-emerald-400' : trend < 0 ? 'text-red-400' : 'text-slate-500'

  return (
    <div className={`card hover:border-slate-700 transition-all duration-200 ${large ? 'p-7' : 'p-5'}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-2">{label}</p>
          <p className={`font-bold text-white ${large ? 'text-3xl' : 'text-2xl'} leading-tight`}>{value}</p>
          {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
          {trendLabel !== undefined && (
            <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${trendColor}`}>
              {trendIcon}
              <span>{trendLabel}</span>
            </div>
          )}
        </div>
        {Icon && (
          <div className={`w-10 h-10 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center flex-shrink-0`}>
            <Icon size={18} className={c.text} />
          </div>
        )}
      </div>
    </div>
  )
}

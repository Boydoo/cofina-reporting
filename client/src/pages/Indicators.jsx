import { useState } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts'
import { Filter, Search, TrendingUp, TrendingDown, Minus, ChevronDown, ChevronRight, Edit2, CheckCircle, XCircle } from 'lucide-react'
import { INDICATORS, CATEGORIES, BAILLEURS } from '../data/mockData'
import Modal from '../components/Modal'

function getProgress(ind) {
  const last = ind.data?.at(-1)
  if (!last) return { pct: 0, status: 'nc' }
  const pct = last.target > 0 ? Math.round((last.actual / last.target) * 100) : 0
  const lIB = ind.lowerIsBetter
  const achieved = lIB ? last.actual <= last.target : last.actual >= last.target
  const status = achieved ? 'ok' : pct >= 80 ? 'warning' : 'danger'
  return { pct: Math.min(pct, 150), status, last }
}

function StatusDot({ status }) {
  const map = {
    ok:      'bg-emerald-400',
    warning: 'bg-amber-400',
    danger:  'bg-red-400',
    nc:      'bg-slate-600',
  }
  return <span className={`inline-block w-2 h-2 rounded-full ${map[status] || map.nc}`} />
}

function ProgressBar({ pct, status, lowerIsBetter }) {
  const fillColor = {
    ok:      'bg-emerald-500',
    warning: 'bg-amber-500',
    danger:  'bg-red-500',
    nc:      'bg-slate-600',
  }[status]
  const actual = lowerIsBetter ? (pct <= 100 ? 100 - pct + 100 : 100) : Math.min(pct, 100)
  return (
    <div className="progress-bar w-full">
      <div className={`progress-fill ${fillColor}`} style={{ width: `${Math.min(actual, 100)}%` }} />
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 shadow-xl text-xs space-y-1">
        <p className="text-slate-400 font-medium">{label}</p>
        {payload.map((p, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
            <span className="text-slate-300">{p.name}:</span>
            <span className="text-white font-bold">{p.value?.toLocaleString('fr-FR')}</span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

function IndicatorRow({ ind, onClick }) {
  const cat = CATEGORIES.find(c => c.id === ind.category)
  const { pct, status, last } = getProgress(ind)
  return (
    <tr
      className="table-row-hover cursor-pointer border-b border-slate-800/60"
      onClick={() => onClick(ind)}
    >
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-2">
          <StatusDot status={status} />
          <span className="text-xs font-mono text-slate-500">{ind.code}</span>
        </div>
      </td>
      <td className="px-4 py-3.5">
        <div className="text-sm font-medium text-slate-200">{ind.name}</div>
        <div className="text-xs text-slate-500 mt-0.5 max-w-xs truncate">{ind.description}</div>
      </td>
      <td className="px-4 py-3.5">
        <span className={`badge ${cat?.bg} ${cat?.text}`}>{cat?.label}</span>
      </td>
      <td className="px-4 py-3.5 text-xs text-slate-400">{ind.frequency}</td>
      <td className="px-4 py-3.5 text-right">
        <div className="text-sm font-semibold text-white">
          {last?.actual?.toLocaleString('fr-FR')} <span className="text-xs text-slate-500">{ind.unit}</span>
        </div>
        <div className="text-xs text-slate-500">Cible : {last?.target?.toLocaleString('fr-FR')}</div>
      </td>
      <td className="px-4 py-3.5 min-w-[120px]">
        <div className="space-y-1">
          <ProgressBar pct={pct} status={status} lowerIsBetter={ind.lowerIsBetter} />
          <div className="text-[10px] text-slate-500 text-right">
            {ind.lowerIsBetter ? (last?.actual <= last?.target ? '✓ Objectif atteint' : 'Au-dessus du seuil') : `${pct}%`}
          </div>
        </div>
      </td>
      <td className="px-4 py-3.5">
        <div className="flex flex-wrap gap-1">
          {BAILLEURS.filter(b => b.indicators?.includes(ind.id)).slice(0, 3).map(b => (
            <span key={b.id} className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700">{b.name}</span>
          ))}
        </div>
      </td>
    </tr>
  )
}

function IndicatorDetailModal({ ind, open, onClose }) {
  if (!ind) return null
  const cat = CATEGORIES.find(c => c.id === ind.category)
  const chartData = ind.data?.map(d => ({ period: d.period, Réel: d.actual, Cible: d.target })) || []

  return (
    <Modal open={open} onClose={onClose} title={`${ind.code} — ${ind.name}`} size="lg">
      <div className="space-y-5">
        {/* Meta */}
        <div className="flex flex-wrap gap-3">
          <span className={`badge ${cat?.bg} ${cat?.text}`}>{cat?.label}</span>
          <span className="badge badge-blue">{ind.frequency}</span>
          {ind.mandatory && <span className="badge bg-red-500/20 text-red-400">Obligatoire</span>}
          {ind.lowerIsBetter && <span className="badge bg-slate-700 text-slate-300">↓ Plus bas = mieux</span>}
        </div>
        <p className="text-sm text-slate-400">{ind.description}</p>

        {/* Chart */}
        <div className="bg-slate-800/50 rounded-xl p-4">
          <h4 className="text-sm font-medium text-white mb-4">Évolution : Réel vs Cible</h4>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
              <XAxis dataKey="period" tick={{ fill: '#64748B', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748B', fontSize: 10 }} axisLine={false} tickLine={false} width={60}
                tickFormatter={v => v.toLocaleString('fr-FR')} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="Réel"  stroke="#6366F1" strokeWidth={2.5} dot={{ fill: '#6366F1', r: 4 }} />
              <Line type="monotone" dataKey="Cible" stroke="#94A3B8" strokeWidth={1.5} strokeDasharray="5 5" dot={{ fill: '#94A3B8', r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Data table */}
        <div>
          <h4 className="text-sm font-medium text-white mb-3">Historique des données</h4>
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-2 text-slate-500 font-medium">Période</th>
                <th className="text-right py-2 text-slate-500 font-medium">Cible ({ind.unit})</th>
                <th className="text-right py-2 text-slate-500 font-medium">Réel ({ind.unit})</th>
                <th className="text-right py-2 text-slate-500 font-medium">Écart</th>
                <th className="text-right py-2 text-slate-500 font-medium">Statut</th>
              </tr>
            </thead>
            <tbody>
              {ind.data?.map((d, i) => {
                const ecart = d.actual - d.target
                const achieved = ind.lowerIsBetter ? d.actual <= d.target : d.actual >= d.target
                return (
                  <tr key={i} className="border-b border-slate-800 hover:bg-slate-800/30">
                    <td className="py-2.5 font-medium text-slate-300">{d.period}</td>
                    <td className="py-2.5 text-right text-slate-400">{d.target?.toLocaleString('fr-FR')}</td>
                    <td className="py-2.5 text-right font-semibold text-white">{d.actual?.toLocaleString('fr-FR')}</td>
                    <td className={`py-2.5 text-right font-medium ${ecart >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {ecart > 0 ? '+' : ''}{ecart?.toLocaleString('fr-FR')}
                    </td>
                    <td className="py-2.5 text-right">
                      {achieved
                        ? <CheckCircle size={13} className="inline text-emerald-400" />
                        : <XCircle size={13} className="inline text-red-400" />
                      }
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Bailleurs */}
        <div>
          <h4 className="text-sm font-medium text-white mb-2">Bailleurs concernés</h4>
          <div className="flex flex-wrap gap-2">
            {BAILLEURS.filter(b => b.indicators?.includes(ind.id)).map(b => (
              <div key={b.id} className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
                <span>{b.flag}</span>
                <span className="text-sm text-slate-300 font-medium">{b.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default function Indicators() {
  const [search, setSearch]     = useState('')
  const [catFilter, setCat]     = useState('ALL')
  const [selected, setSelected] = useState(null)

  const filtered = INDICATORS.filter(ind => {
    const matchCat  = catFilter === 'ALL' || ind.category === catFilter
    const matchSrch = !search || ind.name.toLowerCase().includes(search.toLowerCase()) || ind.code.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSrch
  })

  // Summary per category
  const summary = CATEGORIES.map(cat => {
    const inds = INDICATORS.filter(i => i.category === cat.id)
    const ok = inds.filter(i => {
      const { status } = getProgress(i)
      return status === 'ok'
    }).length
    return { ...cat, total: inds.length, ok }
  })

  return (
    <div className="space-y-5">
      {/* Category summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {summary.map(c => (
          <button
            key={c.id}
            onClick={() => setCat(catFilter === c.id ? 'ALL' : c.id)}
            className={`card text-left hover:border-slate-600 transition-all ${catFilter === c.id ? 'border-cofina-500/40 bg-cofina-500/5' : ''}`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className={`text-xs font-medium ${c.text}`}>{c.label}</span>
              <span className={`badge ${c.bg} ${c.text}`}>{c.total}</span>
            </div>
            <div className="text-2xl font-bold text-white">{c.ok}/{c.total}</div>
            <div className="text-xs text-slate-500 mt-1">objectifs atteints</div>
            <div className="progress-bar mt-2">
              <div className="progress-fill" style={{ width: `${Math.round((c.ok/c.total)*100)}%`, background: c.color }} />
            </div>
          </button>
        ))}
      </div>

      {/* Filters + table */}
      <div className="card p-0 overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-800">
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Rechercher un indicateur..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input pl-8 text-sm py-1.5"
            />
          </div>
          <div className="flex gap-2">
            <button onClick={() => setCat('ALL')} className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${catFilter === 'ALL' ? 'bg-cofina-600/20 border-cofina-500/30 text-cofina-300' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'}`}>
              Tous ({INDICATORS.length})
            </button>
            {CATEGORIES.map(c => (
              <button key={c.id} onClick={() => setCat(catFilter === c.id ? 'ALL' : c.id)}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${catFilter === c.id ? `${c.bg} ${c.text} border-current/30` : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'}`}>
                {c.id}
              </button>
            ))}
          </div>
          <div className="ml-auto text-xs text-slate-500">{filtered.length} indicateur(s)</div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-slate-800">
                {['Code', 'Indicateur', 'Catégorie', 'Fréquence', 'Dernière valeur', 'Progression', 'Bailleurs'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] text-slate-500 font-semibold uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(ind => (
                <IndicatorRow key={ind.id} ind={ind} onClick={setSelected} />
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-16 text-center text-slate-500 text-sm">Aucun indicateur trouvé</div>
          )}
        </div>
      </div>

      <IndicatorDetailModal ind={selected} open={!!selected} onClose={() => setSelected(null)} />
    </div>
  )
}

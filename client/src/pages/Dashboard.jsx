import { useState } from 'react'
import {
  AreaChart, Area, BarChart, Bar, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts'
import {
  TrendingUp, Users, DollarSign, AlertTriangle,
  FileText, CheckCircle, Clock, ArrowUpRight
} from 'lucide-react'
import { Link } from 'react-router-dom'
import StatCard from '../components/StatCard'
import { BAILLEURS, INDICATORS, REPORTS, PORTFOLIO_TREND, CATEGORY_SCORES, getGlobalStats } from '../data/mockData'

const stats = getGlobalStats()

// Tooltip custom
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 shadow-xl text-xs">
        <p className="text-slate-400 mb-2 font-medium">{label}</p>
        {payload.map((p, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
            <span className="text-slate-300">{p.name}:</span>
            <span className="text-white font-semibold">{p.value?.toLocaleString('fr-FR')}</span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

export default function Dashboard() {
  const urgent = BAILLEURS.filter(b => b.status === 'urgent')

  return (
    <div className="space-y-6">
      {/* Alert bandeau */}
      {urgent.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl px-5 py-3 flex items-center gap-3">
          <AlertTriangle size={16} className="text-amber-400 flex-shrink-0" />
          <p className="text-sm text-amber-300">
            <span className="font-semibold">{urgent.length} rapport(s) urgent(s)</span> — Date limite imminente :{' '}
            {urgent.map(b => b.name).join(', ')}
          </p>
          <div className="ml-auto flex gap-2">
            {urgent.map(b => (
              <span key={b.id} className="badge badge-yellow">{b.name} — {b.nextDeadline}</span>
            ))}
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Engagement total"
          value={`$${(stats.totalCommitment / 1_000_000).toFixed(0)}M`}
          sub={`${stats.disbursementRate}% décaissé`}
          trend={1}
          trendLabel="+12% vs 2023"
          icon={DollarSign}
          color="indigo"
        />
        <StatCard
          label="Clients actifs"
          value={stats.latestClients.toLocaleString('fr-FR')}
          sub={`${stats.latestWomen}% femmes`}
          trend={1}
          trendLabel="+9.4% vs S1 2024"
          icon={Users}
          color="emerald"
        />
        <StatCard
          label="Bailleurs actifs"
          value={`${stats.activeBailleurs}`}
          sub={`${stats.urgentBailleurs} rapport(s) urgent(s)`}
          trend={0}
          trendLabel="Stable"
          icon={TrendingUp}
          color="blue"
        />
        <StatCard
          label="Taux NPL"
          value={`${stats.latestNPL}%`}
          sub={`CAR : ${stats.latestCAR}%`}
          trend={1}
          trendLabel="↓ 0.4pt vs H1 2024"
          icon={FileText}
          color="amber"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Portfolio Trend — full width on left */}
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-semibold text-white text-sm">Évolution du portefeuille</h3>
              <p className="text-xs text-slate-500 mt-0.5">Encours brut (MXOF) & Clients actifs</p>
            </div>
            <span className="badge badge-blue">Semestriel</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={PORTFOLIO_TREND}>
              <defs>
                <linearGradient id="gPortfolio" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#6366F1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gClients" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#10B981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
              <XAxis dataKey="period" tick={{ fill: '#64748B', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="left" tick={{ fill: '#64748B', fontSize: 10 }} axisLine={false} tickLine={false} width={55}
                tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
              <YAxis yAxisId="right" orientation="right" tick={{ fill: '#64748B', fontSize: 10 }} axisLine={false} tickLine={false} width={65}
                tickFormatter={v => v.toLocaleString('fr-FR')} />
              <Tooltip content={<CustomTooltip />} />
              <Area yAxisId="left" type="monotone" dataKey="portfolio" name="Encours (MXOF)" stroke="#6366F1" fill="url(#gPortfolio)" strokeWidth={2} dot={{ fill: '#6366F1', r: 3 }} />
              <Area yAxisId="right" type="monotone" dataKey="clients" name="Clients actifs" stroke="#10B981" fill="url(#gClients)" strokeWidth={2} dot={{ fill: '#10B981', r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Category scores — radar */}
        <div className="card">
          <h3 className="font-semibold text-white text-sm mb-1">Score ESG par catégorie</h3>
          <p className="text-xs text-slate-500 mb-4">Performance globale 2024</p>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={CATEGORY_SCORES}>
              <PolarGrid stroke="#1E293B" />
              <PolarAngleAxis dataKey="category" tick={{ fill: '#64748B', fontSize: 9 }} />
              <Radar name="Score" dataKey="score" stroke="#6366F1" fill="#6366F1" fillOpacity={0.25} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {CATEGORY_SCORES.map(c => (
              <div key={c.category} className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: c.color }} />
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] text-slate-400 truncate">{c.category}</div>
                  <div className="text-xs font-bold text-white">{c.score}/100</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Prochaines échéances */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white text-sm">Prochaines échéances</h3>
            <span className="text-xs text-slate-500">{BAILLEURS.length} bailleurs</span>
          </div>
          <div className="space-y-2">
            {BAILLEURS
              .sort((a, b) => new Date(a.nextDeadline) - new Date(b.nextDeadline))
              .map(b => {
                const daysLeft = Math.ceil((new Date(b.nextDeadline) - new Date()) / 86400000)
                const isUrgent = daysLeft <= 30
                const isPast   = daysLeft < 0
                return (
                  <div key={b.id} className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors">
                    <span className="text-xl">{b.flag}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-white">{b.name}</div>
                      <div className="text-xs text-slate-500">{b.reportingFrequency}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-slate-400">{b.nextDeadline}</div>
                      <div className={`text-xs font-semibold mt-0.5 ${isPast ? 'text-red-400' : isUrgent ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {isPast ? 'En retard' : isUrgent ? `${daysLeft}j restants` : `${daysLeft}j`}
                      </div>
                    </div>
                    {(isUrgent || isPast) && <AlertTriangle size={14} className={isPast ? 'text-red-400' : 'text-amber-400'} />}
                  </div>
                )
              })}
          </div>
        </div>

        {/* Rapports récents */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white text-sm">Rapports récents</h3>
            <Link to="/reports" className="text-xs text-cofina-400 hover:text-cofina-300 flex items-center gap-1">
              Voir tout <ArrowUpRight size={12} />
            </Link>
          </div>
          <div className="space-y-2">
            {REPORTS.slice(0, 5).map(r => {
              const bailleur = BAILLEURS.find(b => b.id === r.bailleurId)
              const statusMap = {
                submitted: { label: 'Soumis',     cls: 'badge-green'  },
                review:    { label: 'En révision', cls: 'badge-yellow' },
                draft:     { label: 'Brouillon',   cls: 'badge-blue'   },
              }
              const s = statusMap[r.status] || statusMap.draft
              return (
                <div key={r.id} className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors group">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0`}
                       style={{ background: bailleur?.color + '40', border: `1px solid ${bailleur?.color}50` }}>
                    {bailleur?.name?.slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-slate-200 truncate">{r.title}</div>
                    <div className="text-[10px] text-slate-500">{r.period} · {r.createdAt}</div>
                  </div>
                  <span className={`badge ${s.cls} flex-shrink-0`}>{s.label}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Engagement par bailleur */}
      <div className="card">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-semibold text-white text-sm">Engagements par bailleur</h3>
            <p className="text-xs text-slate-500 mt-0.5">Montants en millions USD/EUR</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={BAILLEURS.map(b => ({ name: b.name, commitment: b.commitment / 1_000_000, disbursed: b.disbursed / 1_000_000, color: b.color }))} barSize={28}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
            <XAxis dataKey="name" tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#64748B', fontSize: 10 }} axisLine={false} tickLine={false} width={40} tickFormatter={v => `${v}M`} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="commitment" name="Engagement (M)" radius={[4,4,0,0]} fill="#6366F1" opacity={0.4} />
            <Bar dataKey="disbursed"  name="Décaissé (M)"   radius={[4,4,0,0]} fill="#6366F1" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

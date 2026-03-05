import { useState } from 'react'
import { Globe, Mail, Calendar, DollarSign, BarChart3, FileText, ArrowUpRight, CheckCircle, AlertCircle } from 'lucide-react'
import { BAILLEURS, INDICATORS, CATEGORIES } from '../data/mockData'
import Modal from '../components/Modal'

function BailleurCard({ b, onClick }) {
  const daysLeft = Math.ceil((new Date(b.nextDeadline) - new Date()) / 86400000)
  const isUrgent = daysLeft <= 30
  const statusMap = {
    actif:  { label: 'Actif',   cls: 'badge-green'  },
    urgent: { label: 'Urgent',  cls: 'badge-yellow' },
    inactif:{ label: 'Inactif', cls: 'badge-red'    },
  }
  const s = statusMap[b.status] || statusMap.actif
  const disbRate = Math.round((b.disbursed / b.commitment) * 100)
  const indCount = b.indicators?.length || 0

  return (
    <div
      onClick={() => onClick(b)}
      className="card hover:border-slate-600 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/20"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
               style={{ background: b.color + '20', border: `1px solid ${b.color}40` }}>
            {b.flag}
          </div>
          <div>
            <div className="font-bold text-white">{b.name}</div>
            <div className="text-xs text-slate-500">{b.type}</div>
          </div>
        </div>
        <span className={`badge ${s.cls}`}>{s.label}</span>
      </div>

      {/* Full name */}
      <p className="text-xs text-slate-500 mb-4 leading-relaxed">{b.fullName}</p>

      {/* Commitment progress */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-slate-500 mb-1.5">
          <span>Décaissement</span>
          <span className="font-semibold text-white">{disbRate}%</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${disbRate}%`, background: b.color }} />
        </div>
        <div className="flex justify-between text-[10px] text-slate-600 mt-1">
          <span>${(b.disbursed / 1_000_000).toFixed(0)}M décaissé</span>
          <span>${(b.commitment / 1_000_000).toFixed(0)}M total</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-slate-800/60 rounded-lg p-2 text-center">
          <div className="text-sm font-bold text-white">{indCount}</div>
          <div className="text-[10px] text-slate-500">Indicateurs</div>
        </div>
        <div className="bg-slate-800/60 rounded-lg p-2 text-center">
          <div className="text-sm font-bold text-white">{b.reportingFrequency.slice(0, 3)}.</div>
          <div className="text-[10px] text-slate-500">Fréquence</div>
        </div>
        <div className={`rounded-lg p-2 text-center ${isUrgent ? 'bg-amber-500/10' : 'bg-slate-800/60'}`}>
          <div className={`text-sm font-bold ${isUrgent ? 'text-amber-400' : 'text-white'}`}>{daysLeft}j</div>
          <div className="text-[10px] text-slate-500">Prochaine éch.</div>
        </div>
      </div>

      {/* Framework */}
      <div className="flex items-center gap-1.5 text-xs text-slate-500">
        <BarChart3 size={11} />
        <span className="truncate">{b.framework}</span>
      </div>
    </div>
  )
}

function BailleurDetailModal({ b, open, onClose }) {
  if (!b) return null
  const bIndicators = INDICATORS.filter(ind => b.indicators?.includes(ind.id))
  const daysLeft = Math.ceil((new Date(b.nextDeadline) - new Date()) / 86400000)

  return (
    <Modal open={open} onClose={onClose} title={`${b.flag} ${b.fullName}`} size="xl">
      <div className="space-y-6">
        {/* Info grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'Engagement', value: `$${(b.commitment / 1_000_000).toFixed(0)}M`, icon: DollarSign },
            { label: 'Décaissé',   value: `$${(b.disbursed  / 1_000_000).toFixed(0)}M`, icon: CheckCircle },
            { label: 'Type',       value: b.type,               icon: Globe },
            { label: 'Pays',       value: b.country,            icon: Globe },
          ].map(item => (
            <div key={item.label} className="bg-slate-800/50 rounded-xl p-3">
              <div className="text-xs text-slate-500 mb-1">{item.label}</div>
              <div className="font-bold text-white text-sm">{item.value}</div>
            </div>
          ))}
        </div>

        {/* Reporting info */}
        <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/40">
          <h4 className="text-sm font-semibold text-white mb-3">Informations de reporting</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-slate-500">Fréquence :</span>
              <span className="text-white ml-2 font-medium">{b.reportingFrequency}</span>
            </div>
            <div>
              <span className="text-slate-500">Framework :</span>
              <span className="text-white ml-2 font-medium">{b.framework}</span>
            </div>
            <div>
              <span className="text-slate-500">Prochaine échéance :</span>
              <span className={`ml-2 font-semibold ${daysLeft <= 30 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {b.nextDeadline} ({daysLeft}j)
              </span>
            </div>
            <div>
              <span className="text-slate-500">Dernier rapport :</span>
              <span className="text-white ml-2 font-medium">{b.lastReport}</span>
            </div>
          </div>
        </div>

        {/* Contact */}
        {b.contact && (
          <div className="flex items-center gap-3 bg-slate-800/30 rounded-xl p-3 border border-slate-700/40">
            <div className="w-8 h-8 rounded-full bg-cofina-600/20 flex items-center justify-center text-cofina-400 font-bold text-sm flex-shrink-0">
              {b.contact.name?.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <div className="text-sm font-medium text-white">{b.contact.name}</div>
              <div className="text-xs text-slate-500 flex items-center gap-1">
                <Mail size={10} /> {b.contact.email}
              </div>
            </div>
          </div>
        )}

        {/* Indicators table */}
        <div>
          <h4 className="text-sm font-semibold text-white mb-3">
            Indicateurs requis ({bIndicators.length})
          </h4>
          <div className="space-y-2">
            {CATEGORIES.map(cat => {
              const catInds = bIndicators.filter(i => i.category === cat.id)
              if (catInds.length === 0) return null
              return (
                <div key={cat.id}>
                  <div className={`text-xs font-semibold ${cat.text} mb-1.5 px-1`}>{cat.label}</div>
                  <div className="space-y-1">
                    {catInds.map(ind => {
                      const last = ind.data?.at(-1)
                      const achieved = ind.lowerIsBetter
                        ? last?.actual <= last?.target
                        : last?.actual >= last?.target
                      return (
                        <div key={ind.id} className="flex items-center gap-3 bg-slate-800/50 rounded-lg px-3 py-2.5">
                          {achieved
                            ? <CheckCircle size={13} className="text-emerald-400 flex-shrink-0" />
                            : <AlertCircle size={13} className="text-amber-400 flex-shrink-0" />
                          }
                          <span className="text-xs font-mono text-slate-500 w-14">{ind.code}</span>
                          <span className="text-xs text-slate-300 flex-1">{ind.name}</span>
                          <span className="text-xs font-semibold text-white">
                            {last?.actual?.toLocaleString('fr-FR')} <span className="text-slate-500">{ind.unit}</span>
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default function Bailleurs() {
  const [selected, setSelected] = useState(null)
  const [typeFilter, setTypeFilter] = useState('ALL')

  const types = ['ALL', ...new Set(BAILLEURS.map(b => b.type))]
  const filtered = typeFilter === 'ALL' ? BAILLEURS : BAILLEURS.filter(b => b.type === typeFilter)

  return (
    <div className="space-y-5">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card text-center">
          <div className="text-3xl font-bold text-white">{BAILLEURS.length}</div>
          <div className="text-xs text-slate-500 mt-1">Bailleurs partenaires</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-white">
            ${(BAILLEURS.reduce((s, b) => s + b.commitment, 0) / 1_000_000).toFixed(0)}M
          </div>
          <div className="text-xs text-slate-500 mt-1">Engagements totaux</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-amber-400">
            {BAILLEURS.filter(b => b.status === 'urgent').length}
          </div>
          <div className="text-xs text-slate-500 mt-1">Rapports urgents</div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2">
        {types.map(t => (
          <button
            key={t}
            onClick={() => setTypeFilter(t)}
            className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${typeFilter === t ? 'bg-cofina-600/20 border-cofina-500/30 text-cofina-300' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'}`}
          >
            {t === 'ALL' ? `Tous (${BAILLEURS.length})` : t}
          </button>
        ))}
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(b => (
          <BailleurCard key={b.id} b={b} onClick={setSelected} />
        ))}
      </div>

      <BailleurDetailModal b={selected} open={!!selected} onClose={() => setSelected(null)} />
    </div>
  )
}

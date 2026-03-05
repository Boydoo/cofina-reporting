import { useState } from 'react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'
import {
  FileText, Download, Plus, Eye, CheckCircle,
  Clock, Edit3, Trash2, FileDown, Calendar,
  ChevronDown, Search, Filter
} from 'lucide-react'
import { BAILLEURS, INDICATORS, REPORTS, CATEGORIES } from '../data/mockData'
import Modal from '../components/Modal'

const STATUS_MAP = {
  submitted: { label: 'Soumis',      cls: 'badge-green',  icon: CheckCircle },
  review:    { label: 'En révision', cls: 'badge-yellow', icon: Clock       },
  draft:     { label: 'Brouillon',   cls: 'badge-blue',   icon: Edit3       },
}

function generatePDF(report, bailleur) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const pageW = doc.internal.pageSize.getWidth()
  const now = new Date().toLocaleDateString('fr-FR')

  // Header background
  doc.setFillColor(27, 58, 107)
  doc.rect(0, 0, pageW, 38, 'F')

  // Title
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.setTextColor(255, 255, 255)
  doc.text('COFINA Group', 14, 15)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.text('Impact & ESG Reporting Platform', 14, 22)

  // Report info
  doc.setFontSize(9)
  doc.setTextColor(180, 200, 230)
  doc.text(`Rapport : ${report.title}`, 14, 30)
  doc.text(`Généré le ${now}`, pageW - 14, 30, { align: 'right' })

  let y = 50

  // Bailleur info box
  doc.setFillColor(240, 244, 255)
  doc.roundedRect(14, y - 6, pageW - 28, 30, 3, 3, 'F')
  doc.setTextColor(27, 58, 107)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.text(`${bailleur.fullName}`, 20, y + 2)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(80, 100, 130)
  doc.text(`Période : ${report.period}`, 20, y + 10)
  doc.text(`Fréquence : ${bailleur.reportingFrequency}`, 20, y + 16)
  doc.text(`Framework : ${bailleur.framework}`, pageW / 2, y + 10)
  doc.text(`Contact : ${bailleur.contact?.name}`, pageW / 2, y + 16)

  y += 40

  // Indicators by category
  const bInds = INDICATORS.filter(ind => bailleur.indicators?.includes(ind.id))
  CATEGORIES.forEach(cat => {
    const catInds = bInds.filter(i => i.category === cat.id)
    if (catInds.length === 0) return

    // Category header
    doc.setFillColor(245, 247, 255)
    doc.rect(14, y, pageW - 28, 8, 'F')
    doc.setTextColor(27, 58, 107)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.text(`${cat.label}`, 17, y + 5.5)
    y += 12

    // Table
    const rows = catInds.map(ind => {
      const last = ind.data?.at(-1)
      const achieved = ind.lowerIsBetter
        ? (last?.actual <= last?.target)
        : (last?.actual >= last?.target)
      const pct = last?.target > 0 ? Math.round((last.actual / last.target) * 100) : '-'
      return [
        ind.code,
        ind.name,
        `${last?.actual?.toLocaleString('fr-FR') ?? 'N/A'} ${ind.unit}`,
        `${last?.target?.toLocaleString('fr-FR') ?? 'N/A'} ${ind.unit}`,
        `${pct}%`,
        achieved ? '✓ Atteint' : '✗ Non atteint',
      ]
    })

    autoTable(doc, {
      startY: y,
      head: [['Code', 'Indicateur', 'Réel', 'Cible', '%', 'Statut']],
      body: rows,
      margin: { left: 14, right: 14 },
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [27, 58, 107], textColor: 255, fontStyle: 'bold', fontSize: 8 },
      alternateRowStyles: { fillColor: [248, 250, 255] },
      columnStyles: {
        0: { cellWidth: 16 },
        1: { cellWidth: 65 },
        2: { cellWidth: 25 },
        3: { cellWidth: 25 },
        4: { cellWidth: 12 },
        5: { cellWidth: 28 },
      },
      didParseCell: (data) => {
        if (data.column.index === 5 && data.section === 'body') {
          if (String(data.cell.text).includes('✓')) {
            data.cell.styles.textColor = [22, 163, 74]
          } else {
            data.cell.styles.textColor = [220, 38, 38]
          }
          data.cell.styles.fontStyle = 'bold'
        }
      },
    })

    y = doc.lastAutoTable.finalY + 8
    if (y > 260) { doc.addPage(); y = 20 }
  })

  // Footer
  const pages = doc.internal.getNumberOfPages()
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i)
    doc.setFillColor(27, 58, 107)
    doc.rect(0, 287, pageW, 10, 'F')
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    doc.setTextColor(150, 180, 220)
    doc.text('COFINA Group — Impact & ESG Reporting Platform — Confidentiel', 14, 293)
    doc.text(`Page ${i} / ${pages}`, pageW - 14, 293, { align: 'right' })
  }

  doc.save(`${report.title.replace(/\s+/g, '_')}.pdf`)
}

function generateExcel(report, bailleur) {
  const wb = XLSX.utils.book_new()
  const bInds = INDICATORS.filter(ind => bailleur.indicators?.includes(ind.id))

  // Sheet 1: Summary
  const summaryData = [
    ['COFINA Group — Impact & ESG Reporting'],
    [''],
    ['Bailleur',    bailleur.fullName],
    ['Période',     report.period],
    ['Framework',   bailleur.framework],
    ['Date de génération', new Date().toLocaleDateString('fr-FR')],
  ]
  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData)
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Résumé')

  // Sheet 2: Indicators
  const headers = ['Code', 'Catégorie', 'Indicateur', 'Unité', 'Période', 'Cible', 'Réel', 'Écart', '% Réalisation', 'Statut']
  const rows = []
  bInds.forEach(ind => {
    ind.data?.forEach(d => {
      const ecart = d.actual - d.target
      const pct = d.target > 0 ? Math.round((d.actual / d.target) * 100) : null
      const cat = CATEGORIES.find(c => c.id === ind.category)
      const achieved = ind.lowerIsBetter ? d.actual <= d.target : d.actual >= d.target
      rows.push([
        ind.code, cat?.label, ind.name, ind.unit,
        d.period, d.target, d.actual, ecart,
        pct ? `${pct}%` : 'N/A',
        achieved ? 'Atteint' : 'Non atteint',
      ])
    })
  })
  const wsData = XLSX.utils.aoa_to_sheet([headers, ...rows])
  wsData['!cols'] = [8,15,40,10,12,12,12,12,12,15].map(w => ({ wch: w }))
  XLSX.utils.book_append_sheet(wb, wsData, 'Indicateurs')

  XLSX.writeFile(wb, `${report.title.replace(/\s+/g, '_')}.xlsx`)
}

function ReportRow({ r, onView, onPDF, onExcel }) {
  const bailleur = BAILLEURS.find(b => b.id === r.bailleurId)
  const s = STATUS_MAP[r.status] || STATUS_MAP.draft
  const StatusIcon = s.icon

  return (
    <tr className="table-row-hover border-b border-slate-800/60">
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
               style={{ background: bailleur?.color + '30', border: `1px solid ${bailleur?.color}40` }}>
            {bailleur?.flag}
          </div>
          <div>
            <div className="text-sm font-medium text-white">{bailleur?.name}</div>
            <div className="text-[10px] text-slate-500">{bailleur?.type}</div>
          </div>
        </div>
      </td>
      <td className="px-4 py-3.5">
        <div className="text-sm text-slate-200 font-medium max-w-xs">{r.title}</div>
      </td>
      <td className="px-4 py-3.5">
        <span className="badge badge-blue">{r.period}</span>
      </td>
      <td className="px-4 py-3.5">
        <span className={`badge ${s.cls} flex items-center gap-1`}>
          <StatusIcon size={10} />
          {s.label}
        </span>
      </td>
      <td className="px-4 py-3.5 text-xs text-slate-500">{r.createdAt}</td>
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-1">
          <button onClick={() => onView(r)} className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors" title="Aperçu">
            <Eye size={14} />
          </button>
          <button onClick={() => onPDF(r, bailleur)} className="p-1.5 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors" title="Télécharger PDF">
            <FileDown size={14} />
          </button>
          <button onClick={() => onExcel(r, bailleur)} className="p-1.5 rounded-lg hover:bg-emerald-500/20 text-slate-400 hover:text-emerald-400 transition-colors" title="Exporter Excel">
            <Download size={14} />
          </button>
        </div>
      </td>
    </tr>
  )
}

function NewReportModal({ open, onClose }) {
  const [bailleurId, setBailleur] = useState('')
  const [period, setPeriod]       = useState('')
  const [title, setTitle]         = useState('')

  function handleBailleurChange(id) {
    setBailleur(id)
    const b = BAILLEURS.find(b => b.id === id)
    if (b && period) setTitle(`${b.name} ${b.reportingFrequency} Report ${period}`)
  }
  function handlePeriodChange(p) {
    setPeriod(p)
    const b = BAILLEURS.find(b => b.id === bailleurId)
    if (b) setTitle(`${b.name} ${b.reportingFrequency} Report ${p}`)
  }

  return (
    <Modal open={open} onClose={onClose} title="Nouveau rapport" size="md">
      <div className="space-y-4">
        <div>
          <label className="text-xs text-slate-400 font-medium block mb-1.5">Bailleur</label>
          <select value={bailleurId} onChange={e => handleBailleurChange(e.target.value)} className="input">
            <option value="">Sélectionner un bailleur</option>
            {BAILLEURS.map(b => (
              <option key={b.id} value={b.id}>{b.flag} {b.name} — {b.fullName}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-slate-400 font-medium block mb-1.5">Période</label>
          <select value={period} onChange={e => handlePeriodChange(e.target.value)} className="input">
            <option value="">Sélectionner une période</option>
            {['H1 2024', 'H2 2024', 'FY 2024', 'Q1 2025', 'Q2 2025', 'H1 2025'].map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-slate-400 font-medium block mb-1.5">Titre du rapport</label>
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Titre du rapport" className="input" />
        </div>
        {bailleurId && (
          <div className="bg-slate-800/50 rounded-xl p-3 text-xs text-slate-400 space-y-1">
            {(() => {
              const b = BAILLEURS.find(b => b.id === bailleurId)
              return (
                <>
                  <div>Framework : <span className="text-white font-medium">{b?.framework}</span></div>
                  <div>Indicateurs : <span className="text-white font-medium">{b?.indicators?.length || 0} requis</span></div>
                  <div>Prochaine échéance : <span className="text-amber-400 font-medium">{b?.nextDeadline}</span></div>
                </>
              )
            })()}
          </div>
        )}
        <div className="flex gap-3 pt-2">
          <button onClick={onClose} className="btn-secondary flex-1 justify-center">Annuler</button>
          <button
            disabled={!bailleurId || !period}
            onClick={() => {
              alert(`Rapport "${title}" créé en brouillon !\nCette fonctionnalité sera complète avec le backend.`)
              onClose()
            }}
            className="btn-primary flex-1 justify-center disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Créer le rapport
          </button>
        </div>
      </div>
    </Modal>
  )
}

function ReportPreviewModal({ report, bailleur, open, onClose }) {
  if (!report || !bailleur) return null
  const bInds = INDICATORS.filter(ind => bailleur.indicators?.includes(ind.id))
  const s = STATUS_MAP[report.status] || STATUS_MAP.draft

  return (
    <Modal open={open} onClose={onClose} title={`Aperçu — ${report.title}`} size="xl">
      <div className="space-y-5">
        {/* Header info */}
        <div className="bg-gradient-to-r from-cofina-900/30 to-indigo-900/10 border border-cofina-600/20 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">{bailleur.flag}</span>
            <div>
              <div className="font-bold text-white">{bailleur.fullName}</div>
              <div className="text-xs text-slate-400">{report.period} · {bailleur.framework}</div>
            </div>
            <div className="ml-auto">
              <span className={`badge ${s.cls}`}>{s.label}</span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div><span className="text-slate-500">Créé le :</span> <span className="text-white">{report.createdAt}</span></div>
            <div><span className="text-slate-500">Contact :</span> <span className="text-white">{bailleur.contact?.name}</span></div>
            <div><span className="text-slate-500">Indicateurs :</span> <span className="text-white">{bInds.length}</span></div>
          </div>
        </div>

        {/* Indicators preview */}
        {CATEGORIES.map(cat => {
          const catInds = bInds.filter(i => i.category === cat.id)
          if (catInds.length === 0) return null
          return (
            <div key={cat.id}>
              <div className={`flex items-center gap-2 mb-3`}>
                <span className={`w-2 h-2 rounded-full`} style={{ background: cat.color }} />
                <h4 className={`text-sm font-semibold ${cat.text}`}>{cat.label}</h4>
              </div>
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-2 text-slate-500 font-medium">Code</th>
                    <th className="text-left py-2 text-slate-500 font-medium">Indicateur</th>
                    <th className="text-right py-2 text-slate-500 font-medium">Cible</th>
                    <th className="text-right py-2 text-slate-500 font-medium">Réel</th>
                    <th className="text-right py-2 text-slate-500 font-medium">%</th>
                    <th className="text-right py-2 text-slate-500 font-medium">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {catInds.map(ind => {
                    const last = ind.data?.at(-1)
                    const achieved = ind.lowerIsBetter
                      ? last?.actual <= last?.target
                      : last?.actual >= last?.target
                    const pct = last?.target > 0 ? Math.round((last.actual / last.target) * 100) : null
                    return (
                      <tr key={ind.id} className="border-b border-slate-800/50 hover:bg-slate-800/20">
                        <td className="py-2.5 font-mono text-slate-400">{ind.code}</td>
                        <td className="py-2.5 text-slate-300">{ind.name}</td>
                        <td className="py-2.5 text-right text-slate-400">{last?.target?.toLocaleString('fr-FR')} {ind.unit}</td>
                        <td className="py-2.5 text-right font-semibold text-white">{last?.actual?.toLocaleString('fr-FR')} {ind.unit}</td>
                        <td className="py-2.5 text-right text-slate-400">{pct ? `${pct}%` : '-'}</td>
                        <td className="py-2.5 text-right">
                          <span className={achieved ? 'text-emerald-400 font-semibold' : 'text-red-400 font-semibold'}>
                            {achieved ? '✓ Atteint' : '✗ Non atteint'}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )
        })}

        {/* Export buttons */}
        <div className="flex gap-3 pt-2 border-t border-slate-800">
          <button onClick={() => generatePDF(report, bailleur)} className="btn-primary flex-1 justify-center">
            <FileDown size={14} /> Télécharger PDF
          </button>
          <button onClick={() => generateExcel(report, bailleur)} className="btn-secondary flex-1 justify-center">
            <Download size={14} /> Exporter Excel
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default function Reports() {
  const [search, setSearch]         = useState('')
  const [statusFilter, setStatus]   = useState('ALL')
  const [newModal, setNewModal]     = useState(false)
  const [preview, setPreview]       = useState(null)

  const filtered = REPORTS.filter(r => {
    const b = BAILLEURS.find(b => b.id === r.bailleurId)
    const matchSearch = !search ||
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      b?.name.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'ALL' || r.status === statusFilter
    return matchSearch && matchStatus
  })

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card text-center">
          <div className="text-3xl font-bold text-emerald-400">{REPORTS.filter(r => r.status === 'submitted').length}</div>
          <div className="text-xs text-slate-500 mt-1">Soumis</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-amber-400">{REPORTS.filter(r => r.status === 'review').length}</div>
          <div className="text-xs text-slate-500 mt-1">En révision</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-blue-400">{REPORTS.filter(r => r.status === 'draft').length}</div>
          <div className="text-xs text-slate-500 mt-1">Brouillons</div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="card p-0 overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-800">
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} className="input pl-8 text-sm py-1.5" />
          </div>
          <div className="flex gap-2">
            {['ALL', ...Object.keys(STATUS_MAP)].map(s => (
              <button key={s} onClick={() => setStatus(s)}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${statusFilter === s ? 'bg-cofina-600/20 border-cofina-500/30 text-cofina-300' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'}`}>
                {s === 'ALL' ? 'Tous' : STATUS_MAP[s]?.label}
              </button>
            ))}
          </div>
          <button onClick={() => setNewModal(true)} className="ml-auto btn-primary text-sm py-1.5">
            <Plus size={14} /> Nouveau rapport
          </button>
        </div>

        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-800">
              {['Bailleur', 'Titre', 'Période', 'Statut', 'Date création', 'Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-[11px] text-slate-500 font-semibold uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(r => {
              const b = BAILLEURS.find(b => b.id === r.bailleurId)
              return (
                <ReportRow
                  key={r.id}
                  r={r}
                  onView={r => setPreview({ report: r, bailleur: b })}
                  onPDF={(r, b) => generatePDF(r, b)}
                  onExcel={(r, b) => generateExcel(r, b)}
                />
              )
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-16 text-center text-slate-500 text-sm">Aucun rapport trouvé</div>
        )}
      </div>

      <NewReportModal open={newModal} onClose={() => setNewModal(false)} />
      {preview && (
        <ReportPreviewModal
          report={preview.report}
          bailleur={preview.bailleur}
          open={!!preview}
          onClose={() => setPreview(null)}
        />
      )}
    </div>
  )
}

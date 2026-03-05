import { useState, useRef } from 'react'
import * as XLSX from 'xlsx'
import { Upload, FileSpreadsheet, CheckCircle, AlertTriangle, X, Download, Table2, RefreshCw } from 'lucide-react'

function parseExcel(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target.result, { type: 'array' })
        const sheets = wb.SheetNames.map(name => {
          const ws = wb.Sheets[name]
          const data = XLSX.utils.sheet_to_json(ws, { defval: '' })
          const headers = data.length > 0 ? Object.keys(data[0]) : []
          return { name, data, headers, rowCount: data.length }
        })
        resolve(sheets)
      } catch (err) {
        reject(err)
      }
    }
    reader.onerror = reject
    reader.readAsArrayBuffer(file)
  })
}

export default function MasterFile() {
  const [sheets, setSheets]         = useState([])
  const [activeSheet, setActive]    = useState(0)
  const [fileName, setFileName]     = useState('')
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState('')
  const [dragOver, setDragOver]     = useState(false)
  const [maxRows, setMaxRows]       = useState(50)
  const inputRef = useRef()

  async function handleFile(file) {
    if (!file) return
    if (!file.name.match(/\.(xlsx|xls|csv)$/i)) {
      setError('Formats acceptés : .xlsx, .xls, .csv')
      return
    }
    setLoading(true)
    setError('')
    try {
      const data = await parseExcel(file)
      setSheets(data)
      setFileName(file.name)
      setActive(0)
    } catch (e) {
      setError('Erreur de lecture du fichier : ' + e.message)
    }
    setLoading(false)
  }

  function handleDrop(e) {
    e.preventDefault()
    setDragOver(false)
    handleFile(e.dataTransfer.files[0])
  }

  function handleInputChange(e) {
    handleFile(e.target.files[0])
  }

  function exportSheet(sheet) {
    const ws = XLSX.utils.json_to_sheet(sheet.data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, sheet.name)
    XLSX.writeFile(wb, `${sheet.name}_export.xlsx`)
  }

  const currentSheet = sheets[activeSheet]

  return (
    <div className="space-y-5">
      {/* Upload zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-200 ${
          dragOver ? 'border-cofina-500 bg-cofina-500/5' : 'border-slate-700 hover:border-slate-500 bg-slate-900/50'
        }`}
      >
        <input ref={inputRef} type="file" accept=".xlsx,.xls,.csv" onChange={handleInputChange} className="hidden" />

        {loading ? (
          <div className="flex flex-col items-center gap-3">
            <RefreshCw size={36} className="text-cofina-400 animate-spin" />
            <p className="text-sm text-slate-400">Lecture du fichier en cours...</p>
          </div>
        ) : fileName ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <FileSpreadsheet size={28} className="text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{fileName}</p>
              <p className="text-xs text-slate-500 mt-0.5">
                {sheets.length} feuille(s) · {sheets.reduce((s, sh) => s + sh.rowCount, 0).toLocaleString('fr-FR')} lignes total
              </p>
            </div>
            <div className="flex gap-2">
              <span className="badge badge-green"><CheckCircle size={10} /> Importé avec succès</span>
              <button
                onClick={e => { e.stopPropagation(); setSheets([]); setFileName('') }}
                className="badge bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors"
              >
                <X size={10} /> Changer
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center">
              <Upload size={28} className="text-slate-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-200">Glissez votre MasterFile ici</p>
              <p className="text-xs text-slate-500 mt-1">ou cliquez pour sélectionner</p>
            </div>
            <p className="text-[11px] text-slate-600">Formats acceptés : .xlsx, .xls, .csv</p>
          </div>
        )}

        {error && (
          <div className="mt-4 flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2 max-w-sm mx-auto">
            <AlertTriangle size={14} className="text-red-400" />
            <span className="text-xs text-red-400">{error}</span>
          </div>
        )}
      </div>

      {/* Sheet tabs + data */}
      {sheets.length > 0 && (
        <div className="space-y-4">
          {/* Sheet tabs */}
          <div className="flex items-center gap-2 flex-wrap">
            {sheets.map((sh, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  activeSheet === i
                    ? 'bg-cofina-600/20 border-cofina-500/30 text-cofina-300'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Table2 size={11} />
                {sh.name}
                <span className="text-[10px] opacity-60">{sh.rowCount}</span>
              </button>
            ))}
            {currentSheet && (
              <button
                onClick={() => exportSheet(currentSheet)}
                className="ml-auto btn-secondary text-xs py-1.5"
              >
                <Download size={13} /> Exporter
              </button>
            )}
          </div>

          {/* Data table */}
          {currentSheet && (
            <div className="card p-0 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-sm font-semibold text-white">{currentSheet.name}</span>
                  <span className="text-xs text-slate-500 ml-3">
                    {currentSheet.rowCount.toLocaleString('fr-FR')} lignes · {currentSheet.headers.length} colonnes
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  Afficher :
                  {[50, 100, 200].map(n => (
                    <button key={n} onClick={() => setMaxRows(n)}
                      className={`px-2 py-1 rounded ${maxRows === n ? 'bg-cofina-600/20 text-cofina-300' : 'hover:bg-slate-800 text-slate-500'}`}>
                      {n}
                    </button>
                  ))}
                </div>
              </div>
              <div className="overflow-auto max-h-[500px]">
                <table className="w-full min-w-max text-xs">
                  <thead className="sticky top-0 bg-slate-900 z-10">
                    <tr className="border-b border-slate-800">
                      <th className="px-3 py-2.5 text-left text-slate-600 font-medium w-12">#</th>
                      {currentSheet.headers.map(h => (
                        <th key={h} className="px-3 py-2.5 text-left text-slate-400 font-semibold whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {currentSheet.data.slice(0, maxRows).map((row, i) => (
                      <tr key={i} className="border-b border-slate-800/60 hover:bg-slate-800/30 transition-colors">
                        <td className="px-3 py-2 text-slate-600">{i + 1}</td>
                        {currentSheet.headers.map(h => (
                          <td key={h} className="px-3 py-2 text-slate-300 whitespace-nowrap max-w-xs truncate">
                            {String(row[h] ?? '')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {currentSheet.rowCount > maxRows && (
                  <div className="py-4 text-center text-xs text-slate-500">
                    Affichage de {maxRows} sur {currentSheet.rowCount.toLocaleString('fr-FR')} lignes —{' '}
                    <button onClick={() => setMaxRows(prev => prev + 100)} className="text-cofina-400 hover:underline">
                      Charger 100 de plus
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Column summary */}
          {currentSheet && (
            <div className="card">
              <h3 className="text-sm font-semibold text-white mb-3">Résumé des colonnes</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {currentSheet.headers.map(h => {
                  const values = currentSheet.data.map(r => r[h]).filter(v => v !== '' && v != null)
                  const numericValues = values.filter(v => !isNaN(Number(v))).map(Number)
                  const isNumeric = numericValues.length > values.length * 0.5
                  const fillRate = Math.round((values.length / currentSheet.rowCount) * 100)
                  return (
                    <div key={h} className="bg-slate-800/50 rounded-lg p-3">
                      <div className="text-xs font-medium text-slate-300 truncate mb-1">{h}</div>
                      <div className="text-[10px] text-slate-500">
                        {isNumeric ? (
                          <>
                            <div>Min: {Math.min(...numericValues).toLocaleString('fr-FR')}</div>
                            <div>Max: {Math.max(...numericValues).toLocaleString('fr-FR')}</div>
                          </>
                        ) : (
                          <div>{new Set(values.map(String)).size} valeurs uniques</div>
                        )}
                        <div className="mt-1 flex items-center gap-1">
                          <div className="progress-bar flex-1">
                            <div className="progress-fill bg-cofina-500" style={{ width: `${fillRate}%` }} />
                          </div>
                          <span>{fillRate}%</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {sheets.length === 0 && !loading && !fileName && (
        <div className="card text-center py-12">
          <FileSpreadsheet size={40} className="text-slate-600 mx-auto mb-3" />
          <p className="text-sm text-slate-400 font-medium">Aucun fichier importé</p>
          <p className="text-xs text-slate-600 mt-1">Importez votre MasterFile Excel pour visualiser et analyser les données</p>
        </div>
      )}
    </div>
  )
}

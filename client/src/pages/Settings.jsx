import { useState } from 'react'
import { Save, Bell, Globe, Shield, Database, RefreshCw } from 'lucide-react'

export default function Settings() {
  const [saved, setSaved] = useState(false)

  function handleSave() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* Organisation */}
      <div className="card space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Globe size={16} className="text-cofina-400" />
          <h3 className="text-sm font-semibold text-white">Organisation</h3>
        </div>
        {[
          { label: 'Nom de l\'organisation', value: 'COFINA Group' },
          { label: 'Devise principale', value: 'XOF / USD / EUR' },
          { label: 'Fuseau horaire', value: 'Africa/Dakar (GMT+0)' },
          { label: 'Langue d\'interface', value: 'Français' },
        ].map(f => (
          <div key={f.label}>
            <label className="text-xs text-slate-400 block mb-1.5">{f.label}</label>
            <input defaultValue={f.value} className="input text-sm" />
          </div>
        ))}
      </div>

      {/* Notifications */}
      <div className="card space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Bell size={16} className="text-amber-400" />
          <h3 className="text-sm font-semibold text-white">Alertes & Notifications</h3>
        </div>
        {[
          { label: 'Alerte échéance — J-30', defaultChecked: true },
          { label: 'Alerte échéance — J-7',  defaultChecked: true },
          { label: 'Rapport soumis',          defaultChecked: false },
          { label: 'Indicateur hors seuil',   defaultChecked: true },
        ].map(n => (
          <div key={n.label} className="flex items-center justify-between">
            <span className="text-sm text-slate-300">{n.label}</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked={n.defaultChecked} className="sr-only peer" />
              <div className="w-9 h-5 bg-slate-700 peer-focus:ring-2 peer-focus:ring-cofina-500/30 rounded-full peer peer-checked:bg-cofina-600 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4" />
            </label>
          </div>
        ))}
      </div>

      {/* Data */}
      <div className="card space-y-3">
        <div className="flex items-center gap-2 mb-2">
          <Database size={16} className="text-blue-400" />
          <h3 className="text-sm font-semibold text-white">Données</h3>
        </div>
        <div className="text-xs text-slate-500 bg-slate-800/50 rounded-lg p-3">
          <div>Indicateurs chargés : <span className="text-white font-medium">14</span></div>
          <div>Bailleurs : <span className="text-white font-medium">6</span></div>
          <div>Rapports archivés : <span className="text-white font-medium">6</span></div>
          <div className="mt-2 pt-2 border-t border-slate-700">Version platform : <span className="text-cofina-400 font-medium">v1.0.0</span></div>
        </div>
        <button className="btn-secondary text-sm w-full justify-center">
          <RefreshCw size={13} /> Synchroniser avec le backend
        </button>
      </div>

      <button onClick={handleSave} className="btn-primary w-full justify-center">
        {saved ? <><RefreshCw size={14} className="animate-spin" /> Sauvegardé !</> : <><Save size={14} /> Enregistrer les paramètres</>}
      </button>
    </div>
  )
}

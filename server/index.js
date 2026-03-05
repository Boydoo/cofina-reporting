const express = require('express')
const cors    = require('cors')
const multer  = require('multer')
const XLSX    = require('xlsx')
const path    = require('path')
const fs      = require('fs')
const Database = require('better-sqlite3')

const app  = express()
const PORT = process.env.PORT || 5000
const isProd = process.env.NODE_ENV === 'production'

// ─── Middleware ────────────────────────────────────────────────────────────────
const allowedOrigins = isProd
  ? (process.env.CORS_ORIGIN || '*')
  : 'http://localhost:3000'

app.use(cors({ origin: allowedOrigins }))
app.use(express.json({ limit: '50mb' }))

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } })

// ─── Database ──────────────────────────────────────────────────────────────────
const DB_PATH = path.join(__dirname, 'data', 'cofina.db')
if (!fs.existsSync(path.join(__dirname, 'data'))) fs.mkdirSync(path.join(__dirname, 'data'))

const db = new Database(DB_PATH)
db.pragma('journal_mode = WAL')

db.exec(`
  CREATE TABLE IF NOT EXISTS indicators (
    id          TEXT PRIMARY KEY,
    code        TEXT NOT NULL,
    category    TEXT NOT NULL,
    name        TEXT NOT NULL,
    description TEXT,
    unit        TEXT,
    frequency   TEXT,
    mandatory   INTEGER DEFAULT 0,
    lower_is_better INTEGER DEFAULT 0,
    created_at  TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS indicator_data (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    indicator_id  TEXT NOT NULL REFERENCES indicators(id),
    period        TEXT NOT NULL,
    year          INTEGER,
    target        REAL,
    actual        REAL,
    created_at    TEXT DEFAULT (datetime('now')),
    UNIQUE(indicator_id, period)
  );

  CREATE TABLE IF NOT EXISTS bailleurs (
    id                TEXT PRIMARY KEY,
    name              TEXT NOT NULL,
    full_name         TEXT,
    country           TEXT,
    type              TEXT,
    flag              TEXT,
    color             TEXT,
    commitment        REAL,
    currency          TEXT DEFAULT 'USD',
    disbursed         REAL,
    reporting_freq    TEXT,
    next_deadline     TEXT,
    last_report       TEXT,
    status            TEXT DEFAULT 'actif',
    contact_name      TEXT,
    contact_email     TEXT,
    framework         TEXT,
    indicator_ids     TEXT,  -- JSON array
    created_at        TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS reports (
    id          TEXT PRIMARY KEY,
    bailleur_id TEXT REFERENCES bailleurs(id),
    period      TEXT,
    title       TEXT,
    status      TEXT DEFAULT 'draft',
    format      TEXT,
    pages       INTEGER DEFAULT 0,
    data        TEXT,   -- JSON snapshot
    created_at  TEXT DEFAULT (datetime('now')),
    submitted_at TEXT
  );

  CREATE TABLE IF NOT EXISTS masterfile_imports (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    filename    TEXT,
    sheets      TEXT,   -- JSON: sheet names + row counts
    created_at  TEXT DEFAULT (datetime('now'))
  );
`)

// ─── Seed initial data ─────────────────────────────────────────────────────────
const seedCount = db.prepare('SELECT COUNT(*) as c FROM bailleurs').get().c
if (seedCount === 0) {
  console.log('🌱 Seeding initial data...')

  const bailleurs = [
    { id: 'DPI',      name: 'DPI',         full_name: 'Development Partners International',             country: 'Mauritius / UK', type: 'DFI',       flag: '🇲🇺', color: '#6366F1', commitment: 15000000, disbursed: 15000000, reporting_freq: 'Annuel',     next_deadline: '2025-03-31', last_report: '2024-09-30', status: 'actif',  contact_name: 'Sarah Mensah',   contact_email: 's.mensah@dpifund.com',    framework: 'DCED / IMP',          indicator_ids: JSON.stringify(['FIN-01','FIN-02','FIN-03','FIN-04','SOC-01','SOC-02','SOC-03','ENV-01','GOV-01','GOV-02']) },
    { id: 'SWEDFUND', name: 'SwedFund',     full_name: 'Swedfund International AB',                     country: 'Sweden',         type: 'DFI',       flag: '🇸🇪', color: '#EF4444', commitment: 10000000, disbursed: 10000000, reporting_freq: 'Annuel',     next_deadline: '2025-04-30', last_report: '2024-06-30', status: 'actif',  contact_name: 'Erik Lindqvist', contact_email: 'e.lindqvist@swedfund.se', framework: 'ESMS / IFC PS',       indicator_ids: JSON.stringify(['FIN-01','FIN-03','SOC-01','SOC-02','SOC-04','ENV-01','ENV-02','GOV-01','GOV-03']) },
    { id: 'EU',       name: 'EU Guarantee', full_name: 'European Union External Investment Plan',       country: 'European Union', type: 'Guarantee', flag: '🇪🇺', color: '#3B82F6', commitment: 20000000, disbursed: 14000000, reporting_freq: 'Semestriel', next_deadline: '2025-01-31', last_report: '2024-07-31', status: 'urgent', contact_name: 'Marie Dupont',   contact_email: 'm.dupont@ec.europa.eu',  framework: 'EFSD+ / Results Framework',indicator_ids: JSON.stringify(['FIN-01','FIN-02','FIN-05','SOC-01','SOC-02','SOC-03','SOC-04','ENV-01','ENV-03','GOV-01']) },
    { id: 'BII',      name: 'BII',          full_name: 'British International Investment',             country: 'United Kingdom', type: 'DFI',       flag: '🇬🇧', color: '#10B981', commitment: 12000000, disbursed: 12000000, reporting_freq: 'Annuel',     next_deadline: '2025-05-31', last_report: '2024-05-31', status: 'actif',  contact_name: 'James Osei',     contact_email: 'j.osei@bii.co.uk',       framework: 'IFC PS / UNGP',       indicator_ids: JSON.stringify(['FIN-01','FIN-02','FIN-04','SOC-01','SOC-02','SOC-05','ENV-01','ENV-02','GOV-02','GOV-03']) },
    { id: 'COFIDES',  name: 'COFIDES',      full_name: 'Compañía Española de Financiación del Desarrollo', country: 'Spain',      type: 'DFI',       flag: '🇪🇸', color: '#F59E0B', commitment:  8000000, disbursed:  8000000, reporting_freq: 'Annuel',     next_deadline: '2025-06-30', last_report: '2024-06-30', status: 'actif',  contact_name: 'Carlos García',  contact_email: 'c.garcia@cofides.es',     framework: 'SDGs / GRI',          indicator_ids: JSON.stringify(['FIN-01','FIN-03','SOC-01','SOC-03','SOC-04','ENV-01','GOV-01']) },
    { id: 'EIB',      name: 'EIB',          full_name: 'European Investment Bank',                     country: 'Luxembourg',     type: 'MDB',       flag: '🇱🇺', color: '#8B5CF6', commitment: 25000000, disbursed: 20000000, reporting_freq: 'Semestriel', next_deadline: '2025-01-31', last_report: '2024-07-31', status: 'urgent', contact_name: 'Pierre Martin',  contact_email: 'p.martin@eib.org',       framework: 'REAP / CAF / EFSD+', indicator_ids: JSON.stringify(['FIN-01','FIN-02','FIN-05','SOC-01','SOC-02','SOC-04','ENV-01','ENV-02','ENV-03','GOV-01','GOV-02']) },
  ]

  const insertBailleur = db.prepare(`INSERT INTO bailleurs VALUES (@id,@name,@full_name,@country,@type,@flag,@color,@commitment,'USD',@disbursed,@reporting_freq,@next_deadline,@last_report,@status,@contact_name,@contact_email,@framework,@indicator_ids,datetime('now'))`)
  for (const b of bailleurs) insertBailleur.run(b)
  console.log(`  ✓ ${bailleurs.length} bailleurs insérés`)
}

// ─── Routes: Bailleurs ─────────────────────────────────────────────────────────
app.get('/api/bailleurs', (req, res) => {
  const rows = db.prepare('SELECT * FROM bailleurs ORDER BY name').all()
  res.json(rows.map(r => ({ ...r, indicators: JSON.parse(r.indicator_ids || '[]') })))
})

app.get('/api/bailleurs/:id', (req, res) => {
  const r = db.prepare('SELECT * FROM bailleurs WHERE id = ?').get(req.params.id)
  if (!r) return res.status(404).json({ error: 'Bailleur non trouvé' })
  res.json({ ...r, indicators: JSON.parse(r.indicator_ids || '[]') })
})

app.patch('/api/bailleurs/:id', (req, res) => {
  const allowed = ['name','full_name','status','next_deadline','contact_name','contact_email','framework']
  const updates = Object.entries(req.body).filter(([k]) => allowed.includes(k))
  if (updates.length === 0) return res.status(400).json({ error: 'Aucun champ valide' })
  const set = updates.map(([k]) => `${k} = ?`).join(', ')
  db.prepare(`UPDATE bailleurs SET ${set} WHERE id = ?`).run(...updates.map(([,v]) => v), req.params.id)
  res.json({ success: true })
})

// ─── Routes: Indicators ────────────────────────────────────────────────────────
app.get('/api/indicators', (req, res) => {
  const indicators = db.prepare('SELECT * FROM indicators ORDER BY code').all()
  const dataByInd  = db.prepare('SELECT * FROM indicator_data ORDER BY year, period').all()
  const result = indicators.map(ind => ({
    ...ind,
    mandatory: !!ind.mandatory,
    lowerIsBetter: !!ind.lower_is_better,
    data: dataByInd.filter(d => d.indicator_id === ind.id),
  }))
  res.json(result)
})

app.post('/api/indicators/:id/data', (req, res) => {
  const { period, year, target, actual } = req.body
  try {
    db.prepare(`
      INSERT INTO indicator_data (indicator_id, period, year, target, actual)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(indicator_id, period) DO UPDATE SET actual = excluded.actual, target = excluded.target
    `).run(req.params.id, period, year, target, actual)
    res.json({ success: true })
  } catch (e) {
    res.status(400).json({ error: e.message })
  }
})

// ─── Routes: Reports ───────────────────────────────────────────────────────────
app.get('/api/reports', (req, res) => {
  const rows = db.prepare('SELECT * FROM reports ORDER BY created_at DESC').all()
  res.json(rows)
})

app.post('/api/reports', (req, res) => {
  const { bailleur_id, period, title, format } = req.body
  const id = `RPT-${Date.now()}`
  db.prepare(`INSERT INTO reports (id, bailleur_id, period, title, status, format) VALUES (?,?,?,?,'draft',?)`).run(id, bailleur_id, period, title, format || 'PDF')
  res.json({ id, status: 'draft' })
})

app.patch('/api/reports/:id/status', (req, res) => {
  const { status } = req.body
  const valid = ['draft', 'review', 'submitted']
  if (!valid.includes(status)) return res.status(400).json({ error: 'Statut invalide' })
  const submittedAt = status === 'submitted' ? new Date().toISOString().split('T')[0] : null
  db.prepare('UPDATE reports SET status = ?, submitted_at = ? WHERE id = ?').run(status, submittedAt, req.params.id)
  res.json({ success: true })
})

// ─── Routes: MasterFile upload ─────────────────────────────────────────────────
app.post('/api/masterfile/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Aucun fichier reçu' })
  try {
    const wb = XLSX.read(req.file.buffer, { type: 'buffer' })
    const sheets = wb.SheetNames.map(name => {
      const data = XLSX.utils.sheet_to_json(wb.Sheets[name], { defval: '' })
      return { name, rowCount: data.length, headers: data.length > 0 ? Object.keys(data[0]) : [], rows: data.slice(0, 5) }
    })
    db.prepare('INSERT INTO masterfile_imports (filename, sheets) VALUES (?, ?)').run(req.file.originalname, JSON.stringify(sheets.map(s => ({ name: s.name, rowCount: s.rowCount }))))
    res.json({ filename: req.file.originalname, sheets })
  } catch (e) {
    res.status(500).json({ error: 'Erreur de lecture : ' + e.message })
  }
})

// ─── Health ────────────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => res.json({ status: 'ok', env: process.env.NODE_ENV || 'development', db: DB_PATH, ts: new Date().toISOString() }))

// ─── Production : servir le build React ────────────────────────────────────────
if (isProd) {
  const distPath = path.join(__dirname, '../client/dist')
  if (fs.existsSync(distPath)) {
    app.use(express.static(distPath))
    // SPA fallback : toute route non-API renvoie index.html
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'))
    })
    console.log(`   Static  : serving ${distPath}`)
  } else {
    console.warn('   ⚠ client/dist introuvable — lancez "npm run build" dans client/')
  }
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 COFINA Reporting — port ${PORT} [${process.env.NODE_ENV || 'development'}]`)
  console.log(`   Database : ${DB_PATH}`)
  if (isProd) console.log(`   URL      : http://0.0.0.0:${PORT}`)
  else        console.log(`   API      : http://localhost:${PORT}/api/`)
  console.log()
})

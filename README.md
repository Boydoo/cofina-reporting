# COFINA Reporting Platform

Plateforme interne de reporting ESG & Impact pour le groupe COFINA.

## Stack
- **Frontend :** React 18 + Vite + Tailwind CSS + Recharts
- **Backend :** Node.js + Express + SQLite (better-sqlite3)
- **Export :** jsPDF (PDF) + SheetJS (Excel)

## Installation & Démarrage

### Prérequis
- Node.js v18+ ([nodejs.org](https://nodejs.org))
- npm v9+

### 1. Installer les dépendances

```bash
# Depuis le dossier cofina-reporting/
npm install

cd client && npm install
cd ../server && npm install
cd ..
```

### 2. Lancer l'application (frontend uniquement — mode démo)

```bash
cd client
npm run dev
```

Ouvrir → http://localhost:3000

### 3. Lancer frontend + backend (mode complet)

```bash
# À la racine du projet
npm run dev
```

- Frontend : http://localhost:3000
- API : http://localhost:5000/api/

## Structure du projet

```
cofina-reporting/
├── client/                      # Application React
│   └── src/
│       ├── App.jsx              # Router principal
│       ├── data/mockData.js     # Données COFINA (bailleurs, indicateurs)
│       ├── components/          # Layout, Sidebar, Header, StatCard, Modal
│       └── pages/
│           ├── Dashboard.jsx    # Vue d'ensemble + KPIs
│           ├── Indicators.jsx   # Suivi des 14 indicateurs ESG
│           ├── Bailleurs.jsx    # 6 bailleurs (DPI, SwedFund, EU, BII, COFIDES, EIB)
│           ├── MasterFile.jsx   # Import Excel + visualisation
│           ├── Reports.jsx      # Génération PDF/Excel par bailleur
│           └── Settings.jsx     # Paramètres
└── server/                      # API Node.js
    ├── index.js                 # Express + SQLite
    └── data/cofina.db           # Base de données (auto-créée)
```

## Fonctionnalités

| Feature | Description |
|---|---|
| Dashboard | KPIs globaux, tendances portefeuille, radar ESG, alertes |
| Indicateurs | 14 indicateurs (FIN, SOC, ENV, GOV) avec cibles vs réel |
| Bailleurs | Fiches détaillées : DPI, SwedFund, EU Guarantee, BII, COFIDES, EIB |
| MasterFile | Import Excel multi-feuilles, aperçu, statistiques colonnes |
| Rapports | Génération PDF professionnel + export Excel par bailleur |
| API REST | CRUD complet bailleurs, indicateurs, rapports |

## Ajouter vos vraies données

1. Ouvrez `client/src/data/mockData.js`
2. Modifiez `INDICATORS` avec vos vrais indicateurs et historiques
3. Modifiez `BAILLEURS` avec vos engagements réels
4. Ou importez via le MasterFile (onglet MasterFile)

## Générer un rapport PDF

1. Aller sur l'onglet **Rapports**
2. Cliquer **Nouveau rapport** → sélectionner bailleur + période
3. Cliquer l'icône **PDF** (rouge) sur la ligne du rapport
4. Le PDF est téléchargé automatiquement avec le branding COFINA

## Évolutions prévues

- [ ] Authentification (login/rôles)
- [ ] Import automatique du MasterFile vers les indicateurs
- [ ] Templates de rapports par bailleur (EU, EIB spécifiques)
- [ ] Notifications email J-30 / J-7
- [ ] Export vers portail bailleur (API EIB, etc.)

---

*COFINA Group — Usage interne — 2025*

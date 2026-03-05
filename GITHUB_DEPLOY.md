# Déploiement sur GitHub Pages — Guide complet

## Architecture de déploiement

```
GitHub repo (main)
      │
      │  git push
      ▼
GitHub Actions
  └── ci.yml       → Build check automatique
  └── deploy.yml   → Build React → Deploy GitHub Pages
      │
      ▼
GitHub Pages (GRATUIT, illimité)
https://VOTRE-USERNAME.github.io/cofina-reporting/
```

> **Pourquoi GitHub Pages ?**
> - 100% gratuit, sans limite de temps
> - Hébergé directement depuis votre repo GitHub
> - Déploiement automatique à chaque `git push`
> - SSL (HTTPS) inclus automatiquement
> - Aucun serveur à gérer

---

## Structure du dépôt

```
cofina-reporting/                ← racine du repo GitHub
├── .github/
│   └── workflows/
│       ├── ci.yml               ← Build check automatique
│       └── deploy.yml           ← Deploy auto sur GitHub Pages ✅
├── client/                      ← Frontend React (= ce qui est déployé)
│   ├── src/
│   ├── vite.config.js           ← base: '/cofina-reporting/' configuré
│   └── package.json
├── server/                      ← Backend Node.js (pour dev local uniquement)
├── .gitignore
├── .env.example
└── README.md
```

---

## Étape 1 — Créer le dépôt GitHub

1. Aller sur **https://github.com/new**
2. Remplir :
   - **Repository name :** `cofina-reporting`
   - **Description :** `COFINA Group — Plateforme de reporting ESG & Impact`
   - **Visibility :** `Public` ← **obligatoire** pour GitHub Pages gratuit
3. **Ne pas** cocher "Add README" (on a déjà le nôtre)
4. Cliquer **Create repository**

> ⚠️ GitHub Pages gratuit nécessite un repo **Public**.
> Pour un repo privé, il faut GitHub Pro/Team ($4/mois).

---

## Étape 2 — Initialiser Git et pousser le code

Ouvrir un terminal dans le dossier `cofina-reporting/` :

```bash
# Initialiser Git
git init

# Ajouter tous les fichiers (le .gitignore exclut node_modules, .env, etc.)
git add .

# Premier commit
git commit -m "feat: initial COFINA Reporting Platform v1.0"

# Renommer la branche en 'main'
git branch -M main

# Connecter au repo GitHub (remplacer VOTRE-USERNAME)
git remote add origin https://github.com/VOTRE-USERNAME/cofina-reporting.git

# Pousser
git push -u origin main
```

✅ GitHub Actions se lance automatiquement dès le premier push.

---

## Étape 3 — Activer GitHub Pages

**À faire une seule fois, après le premier push :**

1. Aller sur **GitHub → votre repo → Settings**
2. Dans le menu gauche → **Pages**
3. Sous **Source** → sélectionner **"GitHub Actions"**
4. Cliquer **Save**

> GitHub Pages est maintenant configuré pour utiliser votre workflow CI/CD.

---

## Étape 4 — Vérifier le déploiement

1. **GitHub → votre repo → Actions**
2. Voir le workflow **"Deploy → GitHub Pages"** en cours
3. Attendre ~2 minutes que le build se termine ✅
4. Accéder à votre app :

```
https://VOTRE-USERNAME.github.io/cofina-reporting/
```

---

## Commandes Git courantes

```bash
# Récupérer les dernières modifications
git pull origin main

# Créer une branche pour une nouvelle feature
git checkout -b feature/mon-indicateur

# Pousser une modification (redéploiement automatique ~2 min)
git add .
git commit -m "feat: ajouter indicateur SOC-06"
git push origin main

# Voir l'historique
git log --oneline
```

---

## Workflows GitHub Actions

| Workflow | Déclencheur | Action |
|---|---|---|
| `ci.yml` | Push sur `main` ou PR | Build React + vérification serveur |
| `deploy.yml` | Push sur `main` | Build React + Deploy GitHub Pages |

Voir les résultats : **GitHub → votre repo → Actions**

---

## Configuration technique (déjà appliquée)

### vite.config.js — base path
```js
base: '/cofina-reporting/'   // ← correspond au nom du repo GitHub
```
> Si vous changez le nom du repo, mettre à jour ce `base` en conséquence.
> Pour un repo racine (`username.github.io`), utiliser `base: '/'`.

### App.jsx — HashRouter
```jsx
<HashRouter>   // ← remplace BrowserRouter pour GitHub Pages
```
> GitHub Pages ne gère pas le routing serveur → HashRouter est nécessaire.
> Les URLs auront le format : `https://.../#/indicators`

---

## Mettre à jour l'application

```bash
# Modifier les fichiers sources...
git add .
git commit -m "feat: ajouter indicateur SOC-06"
git push origin main
# → GitHub Pages redéploie automatiquement en ~2 minutes ✅
```

---

## Dépannage

| Problème | Solution |
|---|---|
| Page blanche après déploiement | Vérifier `base` dans `vite.config.js` — doit être `/cofina-reporting/` |
| 404 sur les pages de l'app | Vérifier que `HashRouter` est bien utilisé dans `App.jsx` |
| Workflow échoue au build | Voir les logs dans **GitHub → Actions** |
| Pages non activées | **Settings → Pages → Source → GitHub Actions** |
| Repo privé → Pages inaccessible | Passer le repo en Public, ou souscrire GitHub Pro |

---

*COFINA Group — Usage interne — 2025*

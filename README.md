## Neogend React App

Application front-end (Vite + React) pour la plateforme Neogend / France RolePlay.

### 🎯 Objectif

Portail utilisateur + interface d’administration : gestion des comptes, privilèges, profil RP (grade, affectation, serveur, etc.).

### 🧱 Stack

-   Vite + React
-   TailwindCSS + DaisyUI
-   React Router
-   Axios
-   Zustand (store auth)

### 🚀 Scripts NPM

`npm install` installe les dépendances
`npm run dev` lance le serveur de dev (https avec certs configurés dans `vite.config.js`)
`npm run build` build production
`npm run preview` prévisualisation du build

### 🔐 Variables d’environnement

Les fichiers `.env.*` sont automatiquement chargés par Vite.
Exemple (`.env.development`) :

```
VITE_API_URL=https://192.168.1.40:8000
```

Préfixe obligatoire côté client : `VITE_`
Accès dans le code : `import.meta.env.VITE_API_URL`

### 📁 Structure (extrait)

```
src/
	components/        Composants UI réutilisables
	pages/             Pages (routing)
	stores/            Zustand stores (auth)
	global/            Helpers globaux (API base URL, formatters)
	tools/             Fonctions de traduction (privileges, grades, etc.)
```

### 🔑 Authentification

`authStore.js` conserve token + user. Rafraîchissement éventuel via `refreshAccess` (TODO si non implémenté complètement).

### 👤 Profils & Administration

-   Page profil : affiche infos perso + RP
-   Page admin : tableau utilisateurs + changement privilèges + création/suppression (en cours d’évolution)

### 🛰 Appels API

Base URL résolue dans `src/global/API.js` :

1. Utilise `VITE_API_URL` si définie
2. Sinon fallback `window.location.hostname:8000`

### 🧪 TODO (prochaines étapes)

-   Endpoint direct pour récupérer un utilisateur /admin/user/:id (éviter fetch complet)
-   Validation plus robuste des formulaires (y compris formats date)
-   Gestion des états de chargement uniformisée (squelettes)
-   Tests unitaires simples (formatName, traductions)
-   Dark / light mode toggle explicite
-   Internationalisation potentielle

### 🧩 Easter Eggs

Un petit panda apparaît après >10s de chargement (`LoadingComponent`).

### 🛡 Sécurité & Bonnes pratiques

-   Toujours envoyer Authorization: Bearer <token>
-   Empêcher modification des comptes protégés côté backend (déjà géré)
-   Nettoyer / normaliser les entrées (lowercase emails, trim)

### 🛠 Développement rapide

1. Copier `.env.development` si besoin d’une autre config (`.env.production`)
2. `npm install`
3. `npm run dev`
4. Ouvrir https://localhost:5173

### 📦 Build

`npm run build` génère `dist/`. Servir derrière un reverse proxy HTTPS (même origine que l’API si possible pour limiter CORS).

### 📝 Licence

Projet privé – usage interne RP. Ajouter une licence si ouverture partielle prévue.

---

Tu veux ajouter une section captures ou un guide d’API front/back ? Dis-le et on l’étend.

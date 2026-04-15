# Guide de déploiement MonParcImmo

## Frontend → Vercel (gratuit)

1. Créer un compte sur vercel.com
2. Connecter ton repo GitHub
3. Importer le dossier `frontend/`
4. Dans "Environment Variables", ajouter :
   - VITE_API_URL = https://ton-backend.railway.app
   - VITE_FIREBASE_API_KEY = (depuis Firebase Console)
   - VITE_FIREBASE_AUTH_DOMAIN = (depuis Firebase Console)
   - VITE_FIREBASE_PROJECT_ID = (depuis Firebase Console)
   - VITE_FIREBASE_STORAGE_BUCKET = (depuis Firebase Console)
   - VITE_FIREBASE_MESSAGING_SENDER_ID = (depuis Firebase Console)
   - VITE_FIREBASE_APP_ID = (depuis Firebase Console)
5. Cliquer "Deploy" → ton site sera en ligne sur monparcimmo.vercel.app

## Backend → Railway (gratuit)

1. Créer un compte sur railway.app
2. "New Project" → "Deploy from GitHub" → sélectionner le dossier `backend/`
3. Railway détecte automatiquement le Dockerfile
4. Dans "Variables", ajouter :
   - ADMIN_EMAIL = ton@email.com
   - SPRING_MAIL_USERNAME = ton@gmail.com
   - SPRING_MAIL_PASSWORD = motdepasseapplication16car
   - APP_FRONTEND_URL = https://monparcimmo.vercel.app
   - APP_CORS_ALLOWED_ORIGINS = https://monparcimmo.vercel.app
5. Copier l'URL Railway générée (ex: https://xxx.railway.app)
6. La mettre dans VITE_API_URL sur Vercel

## Firebase Storage Rules

Dans Firebase Console → Storage → Rules, coller le contenu de `storage.rules`

## Domaine personnalisé (optionnel)

Sur Vercel → Settings → Domains → ajouter monparcimmo.fr
Sur ton registrar DNS, ajouter un CNAME vers cname.vercel-dns.com

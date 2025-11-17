# Deployment Guide

The project has two deployable surfaces:

- **Frontend**: Next.js app in `frontend/` (deployed to Vercel)
- **Backend**: FastAPI app in `backend/` (deployed to Railway, Fly.io, or any container-friendly host)

Use this guide end-to-end or jump to the section you need.

---

## 1. Prepare the repository

```bash
# from repo root
git status        # ensure clean working tree
git pull          # grab latest changes from remote
```

For CI/CD with Vercel or Railway you must push commits:

```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

---

## 2. Frontend → Vercel

### Prerequisites

- Node 18+ locally
- Vercel account with access to the project
- Vercel CLI (`npm i -g vercel`) if deploying from the terminal

### Option A – GitHub integration (preferred)

1. Connect your GitHub repo to Vercel (Import Project → select repo).
2. Configure build settings:
   - Framework: **Next.js**
   - Root Directory: `frontend`
   - Build command: `npm run build`
   - Install command: `npm install`
   - Output directory: `.next`
3. Click **Deploy**. Every push to `main` now triggers a production deployment; other branches get preview URLs automatically.

### Option B – Vercel CLI

```bash
cd frontend
vercel login
vercel            # first-time setup (links project)
vercel --prod     # triggers production deploy
```

Tips:
- Always run the CLI from `frontend/`.
- Use `vercel --prod --force` to bypass cached builds.
- If asked for project directory, answer `./`.

### Frontend environment variables

Current build does **not** require client-side env vars. When the backend is live set these under Project → Settings → Environment Variables:

```
NEXT_PUBLIC_API_BASE_URL=https://your-backend.example.com/api
NEXT_PUBLIC_MAX_FILE_SIZE_MB=10
NEXT_PUBLIC_ALLOWED_FILE_TYPES=.docx
```

After editing env vars click **Redeploy**.

### Verification checklist

- Run `npm run build && npm start` locally before pushing.
- After deploy visit the Vercel URL, clear cache/hard refresh.
- Test upload, chat flow, completion screen, and download.

---

## 3. Backend → Railway (or any container platform)

> Detailed commands live in `backend/RAILWAY_DEPLOYMENT.md`. Summary:

### Prerequisites

- Python 3.12 runtime supported by your host.
- Supabase credentials (URL + service role key).
- Google Gemini API key.

### Steps (Railway example)

```bash
cd backend
railway login
railway init            # create project or link existing
railway up              # deploy using Dockerfile / Nixpacks
```

Configure env vars inside Railway → Variables tab:

```
SUPABASE_URL=...
SUPABASE_KEY=...
GEMINI_API_KEY=...
ALLOWED_ORIGINS=https://your-frontend.vercel.app,http://localhost:3000
APP_NAME=LegalDoc Filler Backend
DEBUG=false
```

### Post-deploy

1. Grab the public backend URL.
2. Update `NEXT_PUBLIC_API_BASE_URL` in Vercel to point to `https://backend-url/api`.
3. Redeploy the frontend.

---

## 4. Continuous deployment model

- **Frontend**: push to `main` → Vercel production deploy. Other branches → Vercel preview.
- **Backend**: depends on hosting provider (Railway supports GitHub auto-deploys or manual triggers).

Use feature branches + PRs to trigger preview environments for both tiers.

---

## 5. Troubleshooting

| Issue | Checks |
| --- | --- |
| Build fails on Vercel | Inspect logs (`Deployments → <build> → Logs`). Ensure `npm run build` succeeds locally. |
| 404 after deploy | Confirm project root is `frontend`, `vercel.json` exists, routes live under `src/app`. |
| Frontend not updating | Did you push commits? Run `vercel --prod --force`. Clear browser cache / disable extensions. |
| Backend CORS errors | `ALLOWED_ORIGINS` must include both local dev (`http://localhost:3000`) and the Vercel domain. |
| Env vars ignored | They must be set per environment (Production / Preview). Redeploy after edits. |

Rollback:

```bash
vercel ls          # list deployments
vercel rollback    # promote previous deployment
```

or use the Vercel dashboard → Deployments → "Promote to Production".

---

## 6. Production checklist

- [ ] `npm run build` / `python main.py` succeed locally
- [ ] All env vars configured in Vercel/Railway
- [ ] File uploads, chat flow, completion, and download tested
- [ ] Responsive on desktop & mobile
- [ ] No console errors in browser
- [ ] Accessibility quick pass (tab order, color contrast)
- [ ] Error states/empty states verified
- [ ] Secrets not committed; `.env` excluded

---

## 7. Support & references

- Vercel docs: https://vercel.com/docs
- Next.js docs: https://nextjs.org/docs
- Railway docs: https://docs.railway.app/
- Supabase docs: https://supabase.com/docs

For deeper backend deployment steps refer to `backend/RAILWAY_DEPLOYMENT.md`. For infrastructure questions reach out to the maintainer in `README.md`.

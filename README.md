# ResumeForge

AI-powered resume and cover letter generator. Paste a job description, get a tailored resume (PDF) and cover letter (copy-paste text) grounded in your real profile data.

## Stack

- **Frontend:** React (Vite) + Tailwind CSS
- **Backend:** Node.js + Express
- **Database:** Neon (Postgres) via `pg`
- **AI:** Google Gemini Pro (`gemini-1.5-pro`)
- **PDF:** Puppeteer (HTML/CSS → PDF)

## Quick start

```bash
# 1. Install dependencies
npm run install:all

# 2. Configure backend env (placeholders ship ready to run)
#    Edit backend/.env with your real keys when ready:
#    - GEMINI_API_KEY from https://aistudio.google.com/apikey
#    - DATABASE_URL from your Neon project dashboard

# 3. Run migrations (requires a real DATABASE_URL)
npm run migrate

# 4. Start both servers
npm run dev
# Or separately: npm run dev:backend  and  npm run dev:frontend
```

- Frontend: http://localhost:5173  
- Backend: http://localhost:5000  

With placeholder keys, the app starts and shows clear warnings. Profile/history need a real Neon `DATABASE_URL` (then `npm run migrate`). `/api/generate` returns a clear error until you set a real `GEMINI_API_KEY`.

## Env vars

See `backend/.env.example`. Never put secrets in frontend code.

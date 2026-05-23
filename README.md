# VERIS — AI Governance Command Platform

> _Govern with certainty._

A multi-role AI governance command platform serving five C-suite roles: CISO, CAIO, CIO, CDPO, CGO.

## Deploy to Vercel

1. Push this repo to GitHub.
2. In Vercel, click **Add New → Project**, import the GitHub repo.
3. Vercel auto-detects Vite — no config changes needed. Click **Deploy**.
4. After the first deploy: **Project → Settings → Environment Variables**, add:
   - **Name:** `ANTHROPIC_API_KEY`
   - **Value:** your `sk-ant-...` key from [console.anthropic.com](https://console.anthropic.com/)
   - **Environments:** Production, Preview, Development (tick all three)
5. **Deployments → … → Redeploy** the latest deployment so the new env var takes effect.

That's it. The AI features (Strategy generator, Template generator) call `/api/anthropic`, which is a Vercel serverless function that proxies to Anthropic with the key from the env var.

## Structure

```
veris/
├── index.html              Vite entry
├── src/
│   ├── main.jsx            React mount
│   └── App.jsx             The VERIS app (2,923 lines)
├── api/
│   └── anthropic.js        Vercel serverless function (Anthropic proxy)
├── package.json
└── vite.config.js
```

## Run locally (optional)

```bash
npm install
npm run dev
```

Opens at http://localhost:5173. Note: AI features only work when deployed to Vercel (or you set up the local equivalent of the serverless function).

## Brand

VERIS — from Latin *veritas* (truth) + *iris* (controlled access).  
Tagline: **Govern with certainty.**

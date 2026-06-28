# RentSure

AI-powered lease analyzer for UAE tenants. Upload a lease agreement and get an instant breakdown of red/yellow/green flags against UAE tenancy law, a fair-rent comparison, a multilingual AI assistant for follow-up questions, and ready-to-send legal document templates (rent reduction requests, deposit refund demands, eviction responses, etc).

## Project Structure

This is a monorepo with three independent parts that share one backend API and one database:

```
RentSure/
├── backend/    FastAPI + PostgreSQL + Claude AI
├── frontend/   Next.js 14 web app
└── mobile/     React Native (bare CLI) Android/iOS app
```

```
                ┌────────────────────────┐
                │   PostgreSQL (Neon)    │
                └───────────┬────────────┘
                            │
                ┌───────────┴────────────┐
                │     FastAPI Backend     │
                └──────┬──────────┬───────┘
                       │          │
              ┌────────┘          └────────┐
      ┌───────┴───────┐          ┌─────────┴────────┐
      │   Web (Next.js) │          │  Mobile (React Native) │
      └─────────────────┘          └────────────────────────┘
```

## Backend (`/backend`)

FastAPI + SQLAlchemy + Alembic + Claude API (Anthropic) for lease analysis, multilingual chat, and document generation. PDF text extraction via `pdfplumber` with OCR fallback (`pytesseract`) for scanned leases. Cloudinary for file storage, Stripe for subscriptions, Resend for transactional email.

```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # fill in your keys
alembic upgrade head
uvicorn app.main:app --reload
```

API docs: `http://localhost:8000/docs`

## Frontend (`/frontend`)

Next.js 14 (App Router) + TypeScript + Tailwind + Shadcn/ui + NextAuth (credentials + Google OAuth).

```bash
cd frontend
npm install
cp .env.local.example .env.local   # fill in your keys
npm run dev
```

Runs at `http://localhost:3000`.

## Mobile (`/mobile`)

React Native (bare CLI), same feature set as the web app, talking to the same backend.

```bash
cd mobile
npm install
node --version   # needs 20+; see .nvmrc
npx react-native start            # Metro bundler
npx react-native run-android      # build + install on emulator/device
```

Update `src/api/client.ts` with your deployed backend URL before building a release APK/AAB.

## Deployment

| Part | Target | Config already in repo |
|------|--------|--------------------------|
| Backend | Railway | `backend/Dockerfile`, `backend/railway.toml` |
| Frontend | Vercel | `frontend/vercel.json` |
| Database | Neon.tech (already cloud-hosted, no migration needed) | — |
| Mobile | Google Play / App Store | update `API_URL` before building release |

## Plans

| Plan | Price | Limits |
|------|-------|--------|
| Free | AED 0 | 1 lease analysis/month, 5 AI chats/day |
| Premium (monthly) | AED 29/month | Unlimited |
| Premium (lifetime) | AED 199 one-time | Unlimited |

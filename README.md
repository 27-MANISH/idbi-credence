# FinHealth — AI-Powered MSME Credit Intelligence Platform

> **IDBI Credence** · Built for the IDBI Bank Fintech Hackathon  
> Alternate Data Underwriting System using LangGraph + FastAPI + Next.js 14

---

## 📋 Overview

FinHealth is an end-to-end AI credit intelligence platform that enables **MSME (Micro, Small & Medium Enterprise) loan underwriting** using alternate data sources — GST filings, UPI transaction flows, Account Aggregator (AA) banking data, and EPFO payroll records — in place of traditional collateral-based assessment.

The system replaces subjective judgment with an explainable AI pipeline that generates a **300–900 trust score**, detailed SHAP feature attributions, and a structured credit dossier — all reviewable by a bank officer through a modern web interface.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Next.js 14 Frontend                  │
│  MSME Onboarding → Score Result → Officer Dashboard    │
│  /api/v1/[...path] (proxy → FastAPI, no CORS)          │
└──────────────────────────┬──────────────────────────────┘
                           │ HTTP / JSON
┌──────────────────────────▼──────────────────────────────┐
│               FastAPI Backend (Python 3.11)             │
│  /api/v1/auth  /api/v1/loans  /api/v1/score             │
│  LangGraph Agent Pipeline (Multi-step scoring chain)   │
└──────────┬──────────────────────────────────────────────┘
           │
    ┌──────▼──────┐     ┌──────────────┐
    │  Supabase   │     │  PostgreSQL   │
    │  (Profiles  │     │  (Prisma ORM) │
    │   Loans     │     │  Auth, Score  │
    │   RLS ✓)   │     │  Audit Logs)  │
    └─────────────┘     └──────────────┘
```

### Key Design Decisions
- **No CORS friction** — Next.js proxies all `/api/v1/*` requests server-side to FastAPI
- **Graceful degradation** — every API hook falls back to cached/mock data if backend is offline
- **JWT-first auth** — tokens persisted in Zustand + localStorage; `Authorization: Bearer` auto-injected
- **Supabase RLS** — Row-Level Security enabled on all FinHealth tables; FastAPI uses `service_role` to bypass

---

## 🧠 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| **State Management** | Zustand (persisted stores) |
| **Backend** | FastAPI, Python 3.11, Uvicorn |
| **AI Pipeline** | LangGraph (stateful multi-agent scoring graph) |
| **Database** | Supabase (PostgreSQL) + Prisma ORM |
| **Auth** | JWT (python-jose), bcrypt password hashing |
| **Alternate Data** | GST API, UPI ledger, Account Aggregator, EPFO |

---

## 📁 Project Structure

```
idbi-credence/
├── src/                          # Next.js 14 frontend
│   ├── app/
│   │   ├── page.tsx              # Landing / redirect
│   │   ├── login/                # JWT login page
│   │   ├── signup/               # MSME self-registration
│   │   ├── msme/
│   │   │   └── onboarding/       # Multi-step MSME onboarding form
│   │   ├── officer/
│   │   │   ├── dashboard/        # Underwriting queue (live API fetch)
│   │   │   ├── application/[id]/ # Full application dossier
│   │   │   └── monitoring/       # System monitoring
│   │   └── api/v1/[...path]/     # Next.js proxy → FastAPI
│   ├── lib/
│   │   ├── api.ts                # Typed API client (auth, loans, score)
│   │   └── useApi.ts             # React hooks with loading/error states
│   ├── stores/
│   │   ├── useAuthStore.ts       # JWT + user profile persistence
│   │   ├── useOfficerStore.ts    # Underwriting queue + decision store
│   │   └── useScoreStore.ts      # Credit score + SHAP contributions
│   ├── components/               # RadarChart, ExplainabilityPanel, etc.
│   └── types/                    # Shared TypeScript interfaces
│
├── server/                       # FastAPI backend
│   ├── app/
│   │   ├── main.py               # App entry + router registration
│   │   ├── agents.py             # LangGraph scoring pipeline
│   │   ├── routers/
│   │   │   ├── auth.py           # POST /login, POST /register
│   │   │   ├── loans.py          # POST /onboard, GET /queue, PATCH /{id}
│   │   │   └── score.py          # POST /compute, GET /explain/{id}
│   │   ├── models/               # Pydantic schemas
│   │   ├── core/                 # JWT utils, config
│   │   └── db/                   # Supabase client + Prisma client
│   └── .env                      # Backend environment variables
│
└── .env.example                  # Frontend environment variables template
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **Python** ≥ 3.11
- **Supabase** project (free tier works)

### 1. Clone the repository

```bash
git clone https://github.com/27-MANISH/idbi-credence.git
cd idbi-credence
```

### 2. Frontend setup

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
FASTAPI_URL=http://localhost:8000
```

### 3. Backend setup

```bash
cd server

# Create virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux

# Install dependencies
pip install -r requirements.txt
```

Edit `server/.env`:
```env
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres
SUPABASE_URL=https://[PROJECT].supabase.co
SUPABASE_SERVICE_KEY=[your-service-role-key]
SECRET_KEY=[random-secret-for-jwt]
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

### 4. Run both servers

**Terminal 1 — FastAPI backend:**
```bash
cd server
uvicorn app.main:app --reload --port 8000
```

**Terminal 2 — Next.js frontend:**
```bash
npm run dev
```

Open **http://localhost:3000**

---

## 🔄 End-to-End Flow

```
MSME Applicant                 FastAPI Backend                Supabase DB
     │                              │                              │
     │  1. Fill onboarding form     │                              │
     │─────────────────────────────►│                              │
     │     POST /api/v1/loans/onboard                              │
     │                              │──── INSERT profiles ────────►│
     │                              │──── INSERT consents ────────►│
     │                              │──── INSERT loans ───────────►│
     │                              │                              │
     │  2. Trigger scoring          │                              │
     │─────────────────────────────►│                              │
     │     POST /api/v1/score/compute                              │
     │                              │── LangGraph Agent Chain ─┐  │
     │                              │   GST → UPI → AA → EPFO  │  │
     │                              │   → Ensemble → SHAP ◄────┘  │
     │                              │──── INSERT scores ──────────►│
     │◄─────────────────────────────│                              │
     │    Score: 782 | Grade: A     │                              │
     │                              │                              │
                                    │
Officer Dashboard                   │
     │  3. Load underwriting queue  │                              │
     │─────────────────────────────►│                              │
     │     GET /api/v1/loans/queue  │                              │
     │◄─────────────────────────────│                              │
     │    [Company cards rendered]  │                              │
     │                              │                              │
     │  4. Review SHAP explanation  │                              │
     │─────────────────────────────►│                              │
     │     GET /api/v1/score/explain/{id}                          │
     │◄─────────────────────────────│                              │
     │    [Feature contributions]   │                              │
     │                              │                              │
     │  5. Record decision          │                              │
     │─────────────────────────────►│                              │
     │     PATCH /api/v1/loans/{id} │                              │
     │                              │──── UPDATE loans ───────────►│
     │◄─────────────────────────────│                              │
     │    Decision saved ✓          │                              │
```

---

## 🔌 API Reference

### Auth
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/auth/login` | Get JWT token |
| `POST` | `/api/v1/auth/register` | Register MSME user |
| `GET` | `/api/v1/auth/me` | Get current user profile |

### Loans
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/loans/onboard` | Create profile + consent + loan record |
| `GET` | `/api/v1/loans/queue` | Officer underwriting queue |
| `GET` | `/api/v1/loans/{id}` | Full loan + audit details |
| `PATCH` | `/api/v1/loans/{id}` | Record officer decision (APPROVED/REJECTED) |

### Score
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/score/compute` | Run LangGraph scoring pipeline |
| `GET` | `/api/v1/score/explain/{id}` | SHAP feature attributions + risk report |

---

## 🎨 Frontend Pages

| Route | Role | Description |
|---|---|---|
| `/` | Public | Landing → redirect by role |
| `/login` | Public | JWT login |
| `/signup` | Public | MSME self-registration |
| `/msme/onboarding` | MSME | 4-step onboarding wizard |
| `/officer/dashboard` | Officer | Live underwriting queue |
| `/officer/application/[id]` | Officer | Full dossier: Overview · Radar · SHAP · Audit · Decision |
| `/officer/monitoring` | Officer | System health monitoring |

---

## 🗄️ Database Schema

**Supabase tables (with RLS enabled):**

| Table | Description |
|---|---|
| `profiles` | MSME business entity (GSTIN, name, type, location) |
| `consents` | Data-sharing consents (GST, UPI, AA, EPFO) |
| `loans` | Loan application (amount, tenure, status, decided_by) |
| `scores` | Credit score (300–900, grade, SHAP signals, explanation) |
| `audits` | Immutable audit trail (entity, action, actor, timestamp) |

---

## 🔐 Security

- **JWT Authentication** — all API routes (except `/auth/*`) require `Authorization: Bearer <token>`
- **Row Level Security** — Supabase RLS policies ensure tenancy isolation:
  - `authenticated` role: read/write own data only
  - `service_role` (FastAPI): bypasses RLS for backend operations
- **Password Hashing** — bcrypt via `passlib`
- **Environment Variables** — secrets never committed; `.env` files in `.gitignore`

---

## ⚙️ Environment Variables

### Frontend (`.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:3000   # Points to Next.js itself (proxy)
FASTAPI_URL=http://localhost:8000           # Server-side proxy target
```

### Backend (`server/.env`)
```env
DATABASE_URL=...          # Supabase PostgreSQL connection string
SUPABASE_URL=...          # Supabase project URL
SUPABASE_SERVICE_KEY=...  # Service role key (bypasses RLS)
SECRET_KEY=...            # JWT signing secret (min 32 chars)
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

---

## 🧪 Development Notes

### Build Status
```
✓ Compiled successfully
✓ Type checking passed (0 errors)
✓ Static pages generated (10/10)
Exit code: 0
```

### Running the production build locally
```bash
npm run build && npm start
```

### Backend auto-reload
```bash
uvicorn app.main:app --reload --port 8000
```

### Checking the Supabase schema
```bash
# View all tables via Supabase MCP or:
# Supabase Dashboard > Table Editor
```

---

## 📊 Scoring Model

The LangGraph pipeline runs 5 parallel data fetchers followed by an ensemble scorer:

| Signal | Weight | Data Source |
|---|---|---|
| GST Compliance | 25% | GST portal — filing regularity, turnover match |
| UPI Transactions | 22% | UPI ledger — transaction volume, pattern stability |
| Account Aggregator | 25% | Banking cash flow, OD utilization, bounce rate |
| EPFO Payroll | 18% | Employee headcount, ESI contribution history |
| Revenue Growth | 10% | YoY turnover expansion from GST data |

**Output:** Score (300–900) → Grade (A+/A/B+/B/C) → Risk band (LOW/MED/HIGH) + SHAP explanations

---

## 🤝 Team & Acknowledgements

Built for the **IDBI Bank Fintech Hackathon 2026** — *Credence Track: Alternate Data Underwriting for MSMEs*

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

# 🚀 ResumeForge

**ResumeForge** is an AI-powered resume and cover letter builder. It grounds every generation in your real profile data, matching job requirements and producing ATS-optimized PDF resumes alongside tailored cover letters.

It features an **in-house NLP Humanizer engine** to refine cover letters, an **AI Detection Analyzer**, **Smart AI Profile Auto-Fill**, and a modern **Mobile-First & Desktop-Optimized UI/UX design system**.

---

## ✨ Features

- 🎯 **ATS-Optimized Resumes**: Multi-template support (Modern Single-Column & Premium ATS) crafted to pass Applicant Tracking Systems cleanly.
- ✉️ **Tailored Cover Letters**: Contextualized cover letters built from real user experience and tuned to specific job descriptions.
- ⚡ **AI Profile Classifier & Merger**: Paste raw CV text, notes, or LinkedIn exports to automatically parse and merge new entries into your profile without overwriting existing data.
- 🧪 **AI Detection Analyzer**: Evaluate readability metrics (Flesch Reading Ease), burstiness ($\sigma$), sentence length, and estimated AI likelihood scores.
- ✨ **NLP Cover Letter Humanizer**: Advanced statistical & lexical transformations to reduce AI footprints while preserving semantic meaning.
- 📄 **Puppeteer PDF Rendering**: High-fidelity HTML-to-PDF conversion with custom typography and color themes.
- 📱 **Responsive Mobile-First Design System**: Hand-crafted UI/UX built with Tailwind v4, custom HSL-tailored mesh gradients, glassmorphic headers, responsive bottom navigation, and micro-animations.

---

## 🛠️ Tech Stack

### **Frontend**
- **Framework**: React 18 (Vite)
- **State Management**: Redux Toolkit (`@reduxjs/toolkit` + `react-redux`) for smart client-side caching & instant page switching
- **Styling**: Tailwind CSS v4 + Custom HSL Design Tokens
- **Typography**: *Plus Jakarta Sans*, *Fraunces*, and *Inter* via Google Fonts
- **Routing**: React Router v6

### **Backend**
- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **Database**: PostgreSQL (Neon Serverless) via `pg`
- **Authentication**: JSON Web Tokens (JWT) + `bcryptjs`
- **PDF Engine**: Puppeteer

### **AI & NLP Stack**
- **LLM**: Google Gemini API (`@google/generative-ai`)
- **NLP & Analysis**: `wink-nlp`, `natural`, `compromise`, `sentence-splitter`, `syllable`, `stopword`
- **ML / Scoring**: `ml-logistic-regression`, `ml-random-forest`, `ml-matrix`

---

## 📂 Project Structure

```text
resume-and-cover-letter/
├── backend/
│   ├── sql/                 # PostgreSQL database schemas
│   ├── src/
│   │   ├── db/              # Database connection & migration runner
│   │   ├── middleware/      # JWT auth & CORS/rate-limiting middleware
│   │   ├── routes/          # Express API route controllers
│   │   │   ├── auth.js      # User registration & login
│   │   │   ├── profile.js   # Profile CRUD & AI auto-fill parsing
│   │   │   ├── generate.js  # Gemini generation, PDF download, Humanize & Detect
│   │   │   └── generations.js # Application history management
│   │   ├── services/        # Core business logic
│   │   │   ├── gemini.js    # Gemini prompt engineering & parsing
│   │   │   ├── pdf.js       # Puppeteer HTML-to-PDF compiler
│   │   │   ├── detector/    # AI detection scoring pipeline
│   │   │   └── humanizer/   # NLP text transformation engine
│   │   └── templates/       # Resume HTML/CSS layout templates
│   └── package.json
├── frontend/
│   ├── public/              # Static brand assets & icons
│   ├── src/
│   │   ├── api/             # API client & fetch wrappers
│   │   ├── auth/            # AuthContext state provider
│   │   ├── components/      # UI primitives (Card, Button, ChoiceCards, etc.)
│   │   ├── pages/           # Application views (Profile, Generate, History, Auth)
│   │   ├── App.jsx          # Shell, navigation & router setup
│   │   └── index.css        # Core design system tokens & animations
│   ├── index.html           # HTML entry point with web font imports
│   └── package.json
├── scripts/                 # Utility scripts (port management & dev launcher)
├── README.md
└── package.json
```

---

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js**: v18.x or higher
- **npm**: v9.x or higher
- **PostgreSQL Database**: (e.g. Neon)
- **Google Gemini API Key**: Obtain from [Google AI Studio](https://aistudio.google.com/apikey)

---

### 2. Installation

Clone the repository and install dependencies across all workspaces with a single command:

```bash
npm run install:all
```

---

### 3. Environment Configuration

Copy `.env.example` in the `backend/` directory to `backend/.env`:

```bash
cp backend/.env.example backend/.env
```

Configure your environment variables in `backend/.env`:

```env
PORT=5000
JWT_SECRET=your_super_secret_jwt_key
DATABASE_URL=postgres://user:password@ep-example.neon.tech/neondb?sslmode=require
GEMINI_API_KEY=your_gemini_api_key_here
```

> **Note**: The application includes fallback handling so you can launch the app even before configuring your API keys.

---

### 4. Database Setup & Migration

Run the migration script to initialize the PostgreSQL database tables (Users, Profiles, Skills, Experience, Projects, Education, Certifications, and Generations):

```bash
npm run migrate
```

---

### 5. Launch Development Servers

Start both the backend API server (`localhost:5000`) and the Vite frontend dev server (`localhost:5173` or `5174`):

```bash
npm run dev
```

Alternatively, you can run them in separate terminal windows:

```bash
# Start Backend
npm run dev:backend

# Start Frontend
npm run dev:frontend
```

---

## 🔌 API Endpoints Summary

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/auth/signup` | Register a new user account | ❌ |
| `POST` | `/api/auth/login` | Authenticate & retrieve JWT token | ❌ |
| `GET` | `/api/auth/me` | Fetch current user session info | ✅ |
| `GET` | `/api/profile` | Retrieve user profile & nested sections | ✅ |
| `POST` | `/api/profile` | Create/update profile core details | ✅ |
| `POST` | `/api/profile/parse-ai` | Parse raw text with AI & merge into profile | ✅ |
| `POST` | `/api/generate` | Generate tailored resume & cover letter | ✅ |
| `POST` | `/api/generate/pdf` | Render and download resume PDF | ✅ |
| `POST` | `/api/generate/humanize-cover-letter` | Apply NLP humanizer to cover letter | ✅ |
| `POST` | `/api/generate/detect-cover-letter` | Analyze AI probability & readability metrics | ✅ |
| `GET` | `/api/generations` | List user generation history | ✅ |
| `GET` | `/api/health` | Health check & system status | ❌ |

---

## 🎨 Design & Accessibility Highlights

- **Palette**: Dark teal (`#0c3b3a`), vibrant accent (`#14b8a6`), clean slate backgrounds, and crisp borders.
- **Micro-Interactions**: Hover lifts, smooth spring buttons, loading ring animations, and collapsible match accordions.
- **Accessibility**: Focused visible rings (`:focus-visible`), ARIA attributes, semantic HTML hierarchy, and mobile safe-area inset support (`env(safe-area-inset-bottom)`).

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).

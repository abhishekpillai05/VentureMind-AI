# VentureMind AI – AI Entrepreneur Trainer & Co-Founder Simulator

[![React](https://img.shields.io/badge/React-18-blue.svg)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-22-green.svg)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon_Cloud-blue.svg)](https://neon.tech/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v3-cyan.svg)](https://tailwindcss.com/)
[![Gemini](https://img.shields.io/badge/Google_Gemini-2.5_Live-indigo.svg)](https://ai.google.dev/)
[![License](https://img.shields.io/badge/License-MIT-purple.svg)](LICENSE)

**VentureMind AI** is an intelligent, full-stack entrepreneurial co-founder simulator and startup training platform. Powered by Google Gemini AI, it helps founders stress-test assumptions, assess market opportunities, calculate unit economics, pitch to virtual venture capitalists, and prepare for institutional fundraising.

---

## 🚀 Core Features

### 1. 🧠 AI Idea Validator & SWOT Diagnostics
- **Comprehensive Viability Analysis**: Evaluates problem-solution fit, market timing, defensibility, and competitive moats.
- **Dynamic SWOT Matrix**: In-depth analysis of Strengths, Weaknesses, Opportunities, and Threats tailored to your target industry.
- **Actionable Strategic Recommendations**: Specific, prioritized steps to pivot, refine, or accelerate your value proposition.

### 2. 🌍 Market Research & Competitive Intelligence
- **TAM / SAM / SOM Market Sizing**: Automated estimation of Total Addressable Market, Serviceable Addressable Market, and Serviceable Obtainable Market.
- **Competitor Landscape**: Direct and indirect competitor identification with feature-by-feature differentiation analysis.
- **Audience Profiling**: Target customer persona segmentation, demographics, pain points, and willingness-to-pay signals.

### 3. 📊 Financial Simulator & Unit Economics Engine
- **Financial Forecasts & Runway Modeling**: Interactive projections for monthly recurring revenue (MRR), burn rate, and runway.
- **Unit Economics**: Dynamic calculations for Customer Acquisition Cost (CAC), Lifetime Value (LTV), LTV:CAC ratio, and payback period.
- **Scenario Analysis**: Toggle between Conservative, Base-Case, and Aggressive growth models with interactive Recharts visualizations.

### 4. 🎙️ AI Virtual Investor Room (VC Simulation)
- **Interactive VC Grilling**: Simulates real-world pitch meetings with AI venture capitalist archetypes (e.g., Metrics-Driven VC, Visionary Angel, Skeptical Partner).
- **Due Diligence Drills**: Tough questioning on unit economics, go-to-market strategy, churn risk, and competitive threats.
- **Term Sheet Negotiations**: Practice answering tough questions and defending your valuation before meeting real investors.

### 5. 🎯 Pitch Evaluation & Deck Diagnostics
- **Slide-by-Slide Pitch Scrutiny**: Objective review covering Hook, Problem, Solution, Market Size, Traction, Business Model, Team, and Ask.
- **Punchy Counter-Arguments**: Anticipate harsh investor objections and generate data-backed talking points to neutralize them.
- **Pitch Readiness Score**: Clear breakdown of strengths and blind spots across your narrative.

### 6. 🏆 Startup Readiness Index (SRI)
- **Holistic Fundability Scoring**: A unified composite score (0–100) combining Validation, Market, Finance, Investor, and Pitch preparedness.
- **Multi-Axis Radar Visualizations**: Instant visual feedback on areas of strength and operational gaps.
- **Founder Action Checklist**: Dynamic, checklist-driven milestone tracking to take your startup from concept to seed-round readiness.

### 7. 📄 Executive PDF & Dossier Generation
- **One-Click Export**: Generate clean, print-ready executive summaries, startup audit reports, and investor dossiers.
- **Institutional Layout**: Formatted for angel networks, accelerators, grant applications, and venture funds.

### 8. 💱 Multi-Currency & Regional Formatting
- **Live Currency Conversion**: Seamless real-time conversion across **INR (₹)**, **USD ($)**, **EUR (€)**, and **GBP (£)**.
- **Number Grouping Systems**:
  - **Indian System**: Default grouping with Lakhs & Crores (e.g. ₹15,00,000 / ₹1.5 Cr / ₹50 L).
  - **International System**: Standard grouping with Millions & Billions (e.g. $1,500,000 / $1.5M).

### 9. 🎨 Next-Gen Dual-Theme Architecture
- **Signature Dark Theme (Default)**: Immersive high-contrast dark navy workspace with ambient accents, optimized for charts and low eye-strain.
- **Enterprise Light Mode**: Clean, high-contrast SaaS aesthetic with crisp slate typography, white cards, and refined borders.
- **Zero-Flicker Boot**: Instant theme application via `<head>` boot scripts and synchronization with cloud user preferences.

### 10. 🔒 Enterprise Security & Verification
- **Email OTP Verification**: 6-digit confirmation codes sent via Gmail SMTP with expiration tracking and resend limits.
- **Robust Encryption**: Passwords hashed with Bcrypt (12 salt rounds) and session management with signed JWTs.
- **Strict Validation**: Bidirectional schema validation using Zod.

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS, React Router v6, Lucide Icons, Recharts |
| **Backend** | Node.js (ES Modules), Express.js, Zod Schema Validation |
| **Database** | Neon Cloud Serverless PostgreSQL (`pg`) with MySQL backward compatibility |
| **AI Engine** | Google Gemini API (Interactions & Analysis) |
| **Email / SMTP** | Nodemailer with Gmail SMTP TLS (Port 587) |
| **Security** | JWT (JSON Web Tokens), Bcrypt.js, CORS |

---

## 📁 Project Structure

```text
VentureMind AI/
├── client/                           # React + Vite + Tailwind CSS Frontend
│   ├── public/
│   │   ├── logo.png                  # High-res rocket brand logo
│   │   ├── favicon.svg               # Vector SVG favicon
│   │   └── favicon.ico               # Browser favicon
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/               # ProtectedRoute, Modals
│   │   │   ├── landing/              # Hero, Features, CTA sections
│   │   │   ├── layout/               # Fixed Navbar, Sidebar, DashboardLayout
│   │   │   └── startups/             # Startup creation & edit modals
│   │   ├── context/                  # AuthContext, CurrencyContext
│   │   ├── pages/                    # 11 Application views (Simulators, Settings, etc.)
│   │   ├── services/                 # Axios clients (Auth, Startups, User preferences)
│   │   ├── utils/                    # Theme manager (Dark/Light), Currency formats
│   │   ├── App.jsx                   # Main routing & Theme initialization
│   │   └── index.css                 # Glassmorphism & Enterprise Light/Dark CSS rules
│   └── tailwind.config.js            # Custom obsidian, brand, and cyber palette
│
├── server/                           # Node.js + Express Backend
│   ├── schema.postgres.sql           # Neon PostgreSQL DDL (10 relational tables)
│   ├── schema.sql                    # MySQL backward-compatible DDL
│   ├── src/
│   │   ├── config/                   # Dual DB pool (Postgres/MySQL), env loader
│   │   ├── controllers/              # Auth, User, Startup, Simulator controllers
│   │   ├── middleware/               # requireAuth, validateRequest, errorHandler
│   │   ├── models/                   # User, Startup, Preferences, Readiness models
│   │   ├── routes/                   # REST API routes
│   │   ├── services/                 # Email (SMTP), AI (Gemini), Currency exchange
│   │   ├── validators/               # Zod request validators
│   │   └── server.js                 # Express bootstrap & auto-migrations
│   └── package.json
└── README.md
```

---

## ⚡ Quick Start Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [Neon](https://neon.tech/) PostgreSQL database (or a local MySQL instance)
- A Google Gemini API Key

---

### 1. Backend Configuration
Create a `.env` file in the `server` directory (copy from `server/.env.example`):

```env
PORT=5000
NODE_ENV=development

# Neon PostgreSQL Connection URL
DATABASE_URL=postgresql://<user>:<password>@<host>/<dbname>?sslmode=require

# JWT Secret
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d

# Gmail SMTP Configuration (For email verification OTPs)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_gmail_app_password
SMTP_FROM_NAME="VentureMind AI"
SMTP_FROM_EMAIL=your_email@gmail.com

# Google Gemini API Key
GEMINI_API_KEY=your_gemini_api_key_here
```

### 2. Install & Start Backend
```bash
cd server
npm install
npm run dev
```
The server will start at `http://localhost:5000`, automatically verifying and initializing all tables in your Neon PostgreSQL database.

### 3. Install & Start Frontend
In a new terminal window:
```bash
cd client
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 🧪 Verification & Testing

Run the automated requirement verification suite to validate PostgreSQL relational integrity, user preferences persistence, and OTP verification:

```bash
cd server
npm run test:requirements
```

Or run end-to-end integration tests:
```bash
npm run test:integration
```

---


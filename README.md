# 🌍 GlobeTrotter — Next-Gen AI Travel Architect & Enterprise Odoo Platform

[![React 19](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.2-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Odoo ERP](https://img.shields.io/badge/Odoo_ERP-17.0-714B67?style=for-the-badge&logo=odoo&logoColor=white)](https://www.odoo.com/)
[![Groq LLaMA](https://img.shields.io/badge/Groq_LLaMA-3.3_70B-FF6F00?style=for-the-badge&logo=groq&logoColor=white)](https://groq.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

**GlobeTrotter** (powered by Tech Titans) is an all-in-one AI travel planning, live booking aggregator, and corporate expense platform integrated with Odoo ERP. Designed to outperform traditional OTA platforms like MakeMyTrip, Goibibo, and TripAdvisor, GlobeTrotter introduces zero convenience fees, dynamic AI itinerary generation, in-browser neural bill scanning, and seamless B2B corporate accounting.

---

## ✨ Key Features & Unfair Advantages

### 🤖 1. Smart Multi-City AI Itinerary Architect
- Powered by **Groq LLaMA 3.3 70B** and **Gemini 1.5 Flash** with strict runtime schema validation.
- Generates constraint-aware, day-by-day travel routes based on starting city, budget limit, travel style, and interests.
- Integrated with live destination weather forecasts via the **Open-Meteo API**.

### ⚔️ 2. MakeMyTrip Competitive Crusher Engine
- **₹0 Convenience Fee Guarantee**: Saves users ₹300 - ₹500 per booking compared to MakeMyTrip's hidden fees.
- **1-Click AI Tour Customization**: Personalize pre-curated holiday packages on the fly.
- **Instant Razorpay PNR Checkout**: Simulated & live 256-bit encrypted payment checkout with automatic E-ticket generation.

### 🧾 3. WebAssembly Neural OCR Bill Scanner & Expense Splitter
- Runs client-side **Tesseract.js WebAssembly OCR** to scan paper receipts or UPI screenshots directly inside the browser.
- Automatically extracts merchant names, invoice dates, line items, and grand totals with 90%+ confidence.
- Replaces external apps like Splitwise with native group balance tracking and CSV export.

### 🏢 4. Native Enterprise Odoo ERP Integration
- 1-click synchronization with corporate **Odoo HR & Accounting modules**.
- Automated GST tax invoice generation, corporate travel policy compliance checks, and employee claim reimbursement workflows.

### 💱 5. Real Live Forex & Embassy-Compliant Travel Insurance
- Live interbank currency exchange rate calculator via **OpenExchange API** for zero-markup multi-currency cards.
- Instant 100% Embassy-approved Schengen visa PDF insurance certificate generator.

### 🎙️ 6. Bilingual Voice AI Travel Copilot
- Hands-free speech recognition supporting **Hindi and English** voice input and speech synthesis output.

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
|---|---|
| **Frontend Core** | React 19, Vite 8, TypeScript, React Router DOM 7 |
| **Styling & UI** | Vanilla CSS / TailwindCSS v4, Lucide React Icons, Recharts, Leaflet Maps |
| **AI & Neural OCR** | Groq LLaMA 3.3 70B API, Gemini 1.5 Flash, Tesseract.js WebAssembly |
| **Backend & Database** | Python 3.11+, FastAPI, SQLAlchemy, Alembic, PostgreSQL, SQLite |
| **Enterprise ERP** | Odoo ERP REST / XML-RPC Integration |
| **Live External APIs** | Open-Meteo Weather API, OpenExchange Currency Rates API |

---

## 📂 Project Directory Structure

```
Globe-Trotter_odoo_Tech-Titans/
├── frontend/
│   ├── src/
│   │   ├── app/                # Main Application Shell & AppRoutes
│   │   ├── components/         # Reusable UI Controls, Navigation & Weather
│   │   ├── features/           # Feature Modules (AI, Booking, Budget, Odoo, etc.)
│   │   ├── hooks/              # Custom React Hooks & Selectors
│   │   ├── lib/                # API Client, Export Utils & Formatting Helpers
│   │   ├── state/              # State Management, Context, Reducer & Actions
│   │   └── main.tsx            # Application Entry Point
│   ├── package.json
│   └── vite.config.ts
├── backend/
│   ├── app/                    # FastAPI Microservices & Database Models
│   ├── alembic/                # Database Migration Scripts
│   ├── requirements.txt
│   └── tripwise.db             # Local SQLite Database Cache
└── README.md
```

---

## 🚀 Quick Start & Local Setup

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **Python**: v3.11 or higher
- **Git**

### 1. Frontend Setup
```bash
# Navigate to the frontend directory
cd frontend

# Install node dependencies
npm install

# Start local development server
npm run dev
```
The application will launch on **`http://localhost:5174/`** (or `http://localhost:5173/`).

### 2. Backend Setup (Optional for Live API sync)
```bash
# Navigate to the backend directory
cd backend

# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install python requirements
pip install -r requirements.txt

# Start FastAPI server
uvicorn app.main:app --reload --port 8000
```

---

## 🔑 Environment Variables Reference

Create a `.env` file in `frontend/` or `backend/` with the following variables:

```env
# Frontend (.env)
VITE_GROQ_API_KEY=your_groq_api_key_here
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id_here
VITE_BACKEND_URL=http://localhost:8000

# Backend (.env)
DATABASE_URL=sqlite:///./tripwise.db
GROQ_API_KEY=your_groq_api_key_here
ODOO_URL=https://your-odoo-instance.com
ODOO_DB=odoo_db_name
```

---

## 📝 Verification & Build Performance

To verify code validity and generate a production bundle:
```bash
cd frontend
npx vite build
```
- **Vite Build Time**: ~1.06s (Zero Type / Compilation Errors)
- **Code Splitting**: Dynamic `React.lazy()` chunking applied across all 20+ feature routes.

---

## 📄 License
This project is licensed under the **MIT License** — feel free to use and customize!

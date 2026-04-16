# ClinSight

**Perioperative Intelligence & AI Decision Support**

ClinSight is an enterprise-grade healthcare application that equips clinical staff with real-time, AI-driven predictions for Intensive Care Unit (ICU) admission risk and extended Length of Stay (LOS) probability for preoperative patients.

## 🚀 Core Capabilities

- **Predictive ML Pipelines:** Custom Scikit-Learn pipelines evaluate patient lab results and vitals to generate dynamic physiological risk scores.
- **Generative AI Summaries:** Integrates Google's **Gemini 2.5 Flash** to automatically translate complex mathematical probabilities into concise, professional clinical assessment notes.
- **Historical Case Matching:** A K-Nearest Neighbors engine provides contextual decision support by cross-referencing hundreds of historical surgeries.
- **Role-Based Security:** Secure JWT authentication enforces strict HIPAA-oriented data boundaries and permissions between Doctors and Administrators.

## 🛠️ Architecture

- **Frontend:** React (Vite), TypeScript, Tailwind CSS, Lucide
- **Backend:** Python, FastAPI, SQLAlchemy, SQLite
- **AI/ML:** Scikit-Learn, Pandas, Google GenAI SDK

## ⚡ Quick Start

**1. Backend Server**
```bash
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```
*> Note: Requires a valid `GEMINI_API_KEY` defined in `backend/.env`.*

**2. Frontend Client**
```bash
cd frontend
npm install
npm run dev
```
*> Access the application at `http://localhost:5173`.*

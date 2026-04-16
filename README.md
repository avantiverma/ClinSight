# ClinSight: Perioperative Intelligence System

ClinSight is an AI-driven, full-stack healthcare application designed to support clinical staff by predicting intensive care (ICU) admission risks and extended Length of Stay (LOS) probabilities for preoperative patients. By analyzing patient vitals, demographics, and lab results, it empowers doctors with data-driven insights to optimize hospital resources and improve patient care workflows.

## 🚀 Key Features

- **Predictive Analytics:** Custom Machine Learning pipelines (Scikit-Learn) integrated natively into the backend to calculate ICU and LOS risk factors dynamically.
- **AI Clinical Summaries:** Utilizes Google's **Gemini 2.5 Flash LLM** to digest complex mathematical predictions and automatically generate professional, concise clinical note summaries.
- **Historical Case Matching:** A K-Nearest Neighbors similarity engine that finds past patients with similar physiological features to provide doctors with historical context.
- **Doctor Dashboard:** Real-time metrics reflecting the specific provider's active patient roster and tracking high-risk triage alerts.
- **Secure Authentication:** Complete JWT-based authentication system supporting distinct permission roles for Doctors vs. Administrators.

## 🛠️ Technology Stack

**Frontend Architecture:**
- React (Vite)
- TypeScript
- Tailwind CSS
- React Router DOM
- Lucide React (Icons)
- Framer Motion (Micro-animations)

**Backend Architecture:**
- Python 3.x
- FastAPI
- SQLAlchemy (ORM) & SQLite
- Scikit-Learn / Pandas (Machine Learning & Data Processing)
- `google-genai` (Gemini API Integration)

## 📦 Project Structure

The repository is modularly split into completely decoupled frontend and backend services:

- `/frontend` - The Vite React client workspace.
- `/backend` - The Python Server, REST API architecture, and Machine Learning models.

## 🚦 Getting Started Locally

### 1. Start the Backend
```bash
cd backend
python -m venv venv
.\venv\Scripts\activate   # Windows
pip install -r requirements.txt
```
*Note: You must create a `.env` file containing a valid `GEMINI_API_KEY` for the AI summaries to function.*

Run the FastAPI server:
```bash
uvicorn app.main:app --reload
```

### 2. Start the Frontend
In a separate terminal:
```bash
cd frontend
npm install
npm run dev
```

Navigate to `http://localhost:5173` to access the application.

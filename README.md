# LearnPath AI - Intelligent Personalized Learning Agent

> A full-stack, AI-driven educational platform that identifies knowledge gaps, constructs dynamic personalized learning paths, conducts real-time assessments, and adapts curriculum recommendations based on student performance.

---

## 1. Problem Statement & Architecture

**Goal:**
> *"Build an intelligent learning agent that identifies knowledge gaps, creates personalized learning paths, generates assessments, and adapts recommendations based on student progress."*

LearnPath AI fulfills all four core capabilities:
1. **Identifying Knowledge Gaps**: Rule-based and explainable diagnostic analysis calculates topic-wise accuracy, classifies competencies into `Weak` (<60%), `Moderate` (60–79%), and `Strong` (&ge;80%), and outputs pedagogical reasoning.
2. **Personalized Learning Paths**: Generates day-by-day learning roadmaps arranged topologically according to prerequisite graphs, prioritizing weak concepts first while respecting foundational dependencies.
3. **Dynamic Assessment Generation**: Generates contextual MCQs, True/False questions, and conceptual problems dynamically via OpenAI, backed by verified academic curriculum banks with instant feedback and answer explanations.
4. **Adaptive Recommendation Engine**: Continuously tracks attempt histories, detects recurring mistakes, triggers prerequisite remediation alerts, increases challenge difficulty on mastery, and curates external resources via SerpAPI.

---

## 2. Technology Stack

- **Frontend**: React.js, Tailwind CSS, React Router v6, Recharts (analytics & visualizations), Lucide React (modern icon system).
- **Backend**: Python 3, Flask, RESTful APIs, Flask-CORS.
- **Database**: SQLite with foreign key enforcement and persistent historical records (`learning_agent.db`).
- **AI & External Search**:
  - **OpenAI API**: Dynamic question generation, pedagogical concept explanations, answer critiques, and interactive AI tutor chat.
  - **SerpAPI**: Real-time web tutorial, official documentation, and YouTube educational video discovery.
- **Analytics & PDF**:
  - **Pandas**: Performance timeline aggregation and subject-wise statistical analysis.
  - **FPDF2**: Automated generation of downloadable, printable personalized roadmap and diagnostic reports.

---

## 3. Core Modules & Required Pages

1. **Landing Page (`/`)**: Overview of the platform, the 4 intelligent pillars, and onboarding.
2. **Student Authentication (`/auth`)**: Registration and login with password hashing, education level, learning goals, and target subject interests.
3. **Student Dashboard (`/dashboard`)**: Summary stat cards, active adaptive recommendation alerts, current subject roadmap tracker, and recent assessment history.
4. **Initial Assessment (`/diagnostic`)**: Diagnostic quiz player across subjects and topics with instant post-submission gap classification.
5. **Knowledge Gap Analysis (`/gaps`)**: Objective competency matrix (Weak, Moderate, Strong) with explainable reasoning and remediation triggers.
6. **Personalized Learning Roadmap (`/roadmap`)**: Day-by-day scheduled targets, topological prerequisite ordering, task completion toggling, and PDF export.
7. **AI Learning Assistant (`/tutor`)**: Interactive conversational AI tutor and structured concept deep-dive with beginner-friendly analogies and code snippets.
8. **Assessment & Quiz Interface (`/quiz`)**: Dynamic topic-wise quiz generator with difficulty filters (Easy, Medium, Hard).
9. **Progress Analytics (`/analytics`)**: Recharts data visualizations including score trendlines, subject-wise comparisons, and proficiency distributions.
10. **Recommended Learning Resources (`/resources`)**: Articles, documentation, and YouTube videos discovered via SerpAPI with AI relevance explanations.
11. **Student Profile & Settings (`/profile`)**: Update student academic preferences, learning goals, target domains, and view backend system status.

---

## 4. Folder Structure

```
LEARNING_AGENT/
├── backend/
│   ├── app.py                      # Flask application entry point & CORS
│   ├── config.py                   # Environment configuration (.env loader)
│   ├── requirements.txt            # Python dependencies
│   ├── .env.example                # Example environment variables
│   ├── database/
│   │   ├── db.py                   # SQLite schema initialization & seeding
│   │   └── learning_agent.db       # SQLite persistent database file
│   ├── services/
│   │   ├── ai_service.py           # OpenAI API client & verified question bank
│   │   ├── gap_engine.py           # Knowledge gap detection & classification logic
│   │   ├── roadmap_engine.py       # Topological prerequisite roadmap generator
│   │   ├── recommendation.py       # Adaptive intelligence & remediation engine
│   │   ├── search_service.py       # SerpAPI & educational resource discovery
│   │   └── pdf_service.py          # FPDF2 roadmap & diagnostic report generator
│   ├── routes/
│   │   ├── auth.py                 # Student registration, login, and profile
│   │   ├── subjects.py             # Subjects & topic hierarchies
│   │   ├── assessment.py           # Diagnostic quizzes & answer evaluation
│   │   ├── roadmap.py              # Learning path tracking, toggling, & PDF download
│   │   ├── gap.py                  # Knowledge gap analytics endpoints
│   │   ├── tutor.py                # AI conversational tutor & explanations
│   │   ├── analytics.py            # Pandas-powered progress metrics
│   │   └── resources.py            # Learning resources endpoints
│   └── tests/
│       └── test_backend.py         # Pytest automated test suite
├── frontend/
│   ├── src/
│   │   ├── components/             # Sidebar, Navbar, Layout
│   │   ├── pages/                  # All 11 application pages
│   │   ├── services/api.js         # REST API client
│   │   ├── App.jsx                 # Route definitions
│   │   ├── index.css               # Tailwind CSS styles
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
└── README.md
```

---

## 5. Quick Start Instructions

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### 1. Backend Setup
```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Initialize database
python database/db.py

# (Optional) Add your API keys to .env
cp .env.example .env
# Edit .env with your OPENAI_API_KEY and SERPAPI_API_KEY

# Start backend server
python app.py
```
*Backend runs on `http://127.0.0.1:5001`.*

### 2. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```
*Frontend runs on `http://localhost:5173`.*

---

## 6. Running Automated Tests

To run the backend integration test suite:
```bash
cd backend
source venv/bin/activate
pytest tests/test_backend.py -v
```

All tests verify:
- Health check and database connectivity
- Subject and topic prerequisite hierarchies
- Knowledge gap rule classification (Weak / Moderate / Strong)
- Student registration and session authentication
- Assessment generation and answer evaluation
- Roadmap generation, task completion toggling, and PDF generation

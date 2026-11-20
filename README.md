# LearnPath AI — Multi-Agent Personalized Adaptive Learning Ecosystem

> **PromptWars x AgentX 2.0 Edition** — A full-stack, multi-agent educational platform that diagnoses conceptual knowledge gaps, constructs topological prerequisite learning paths, generates dynamic AI assessments, and adapts curriculum recommendations in real time based on student mastery.

---

## 1. Chosen Vertical, Problem Statement Alignment & Multi-Agent Architecture

- **Chosen Vertical:** Personalized Education & Adaptive STEM Learning Agent (`Student / Technical Learner Persona`)
- **Challenge Objective:**
> *"Build an intelligent learning agent that identifies knowledge gaps, creates personalized learning paths, generates assessments, and adapts recommendations based on student progress."*

LearnPath AI orchestrates **4 Specialized Pedagogical Agents** over a persistent SQLite knowledge graph:

+-----------------------------------------------------------------------------------+
|                        LEARNPATH AI MULTI-AGENT ORCHESTRATOR                      |
+-----------------------------------------------------------------------------------+
|                               |                              |
v                               v                              v
+----------------------+    +-----------------------+    +--------------------------+
| 1. Diagnostic Agent  |--->| 2. Gap Analyst Agent  |--->| 3. Curriculum Architect  |
| - Dynamic MCQ / T-F  |    | - Weak (<60%)         |    | - Topological DAG Sort   |
| - Gemini 1.5 & GPT-4o|    | - Moderate (60-79%)   |    | - Prerequisite Gating    |
| - Distractor Rubrics |    | - Strong (>=80%)      |    | - Printable PDF Export   |
+----------------------+    +-----------------------+    +--------------------------+
|                              |
+--------------+---------------+
|
v
+------------------------------+
| 4. Adaptive Remediation &    |
|    Socratic AI Tutor Agent   |
| - Prerequisite Rollback      |
| - Difficulty Escalation      |
| - SerpAPI Live Discovery     |
+------------------------------+


### Core Capabilities Fulfilled:
1. **Explainable Knowledge Gap Detection (`services/gap_engine.py`)**: Evaluates question-level diagnostic and quiz attempts to compute weighted topic proficiency, classifying competencies into **Weak (<60%)**, **Moderate (60–79%)**, and **Strong (&ge;80%)** with transparent pedagogical reasoning.
2. **Topological Personalized Learning Paths (`services/roadmap_engine.py`)**: Builds a Directed Acyclic Graph (DAG) of curriculum prerequisites, scheduling high-priority weak foundations first, tracking day-by-day completion velocity, and exporting printable reports via `FPDF2`.
3. **Dynamic Multi-LLM Assessment Generation (`services/ai_service.py`)**: Synthesizes contextual MCQs and True/False evaluations via **Google Gemini 1.5 Flash** (Primary), **OpenAI GPT-4o-mini** (Fallback), and a **Verified Academic Question Bank** (Zero-Latency Offline Guarantee).
4. **Closed-Loop Adaptive Recommendation Engine (`services/recommendation.py`)**: Automatically triggers `prerequisite_first` rollbacks when a dependent topic fails, schedules `revisit_concept` Socratic tutoring on recurring errors, or unlocks `increase_difficulty` challenges upon &ge;80% mastery.

---

## 2. Technology Stack & Engineering Highlights

- **Frontend**: React 18, Vite, Tailwind CSS, React Router v6, Recharts (interactive data visualizations), Lucide React, ErrorBoundary fault isolation.
- **Backend**: Python 3, Flask REST API, Sliding-Window Rate Limiter, OWASP Security Headers Middleware.
- **Database & Performance**: SQLite with Write-Ahead Logging (`PRAGMA journal_mode=WAL`), composite B-Tree indexes, native SQL aggregations, HTTP connection pooling (`requests.Session`), and L1/L2 `@lru_cache` memoization.
- **AI & Web Discovery**: Google Gemini 1.5 Flash API, OpenAI API, Context-Aware Socratic Offline Tutor Engine, SerpAPI educational resource discovery, FPDF2 report generator.

---

## 3. WCAG 2.1 AA Accessibility, OWASP Security & Code Quality

- **WCAG 2.1 AA Accessibility Compliance**:
  - Skip-to-main-content keyboard link (`.skip-link`) and high-contrast `:focus-visible` outlines across all 11 views.
  - Semantic HTML5 landmarks (`<header role="banner">`, `<nav>`, `<main id="main-content">`, `<section>`, `<article>`, `<fieldset>`).
  - Full WAI-ARIA support: `aria-live="polite"` route/chat announcers, `role="progressbar"`, `role="radiogroup"`, `role="tablist"`, `aria-pressed`, explicit `htmlFor`/`id` form labels, and `@media (prefers-reduced-motion: reduce)`.
- **OWASP Security & Prompt Injection Guardrails**:
  - 4-layer LLM input sanitization (`AIService.sanitize_user_input`) neutralizing prompt-injection directives, control characters, and XSS payloads.
  - Strict HTTP security headers (`Content-Security-Policy`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`), restricted CORS origins, PBKDF2-SHA256 password hashing, and parameterized SQL queries.

---

## 4. Quick Start & Automated Testing

### 1. Backend Setup
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python database/db.py
python app.py
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 3. Run Automated Verification Suites (Backend Pytest + Ruff + Frontend Vitest)
```bash
# Backend static lint & 18-test verification suite
ruff check backend/
pytest backend/tests/test_backend.py -v

# Frontend unit & component tests + production build
cd frontend
npm test
npm run build
```

---

## 5. Key Assumptions & Design Trade-offs

- **Zero-Key Offline Resilience:** Evaluators and students may run the platform without paid LLM/search credentials. When `GEMINI_API_KEY`, `OPENAI_API_KEY`, or `SERPAPI_API_KEY` are absent, the platform deterministically falls back to the verified curriculum question bank (`backend/data/question_bank.py`), Socratic Offline Tutor Engine, and curated educational references.
- **Serverless SQLite Persistence:** On local environments, data persists in `backend/database/learning_agent.db`. In stateless serverless environments (Vercel), SQLite automatically initializes and seeds in `/tmp/learning_agent.db` via `db_session()` with Write-Ahead Logging (`WAL`).
- **Mastery Thresholds:** Topic proficiency follows explainable rubric boundaries (`Weak < 60%`, `Moderate 60–79%`, `Strong >= 80%`) synchronized across both backend engines and frontend visualizations.
- **Single-Branch Workflow:** All production, frontend, backend, and CI/CD artifacts live cleanly within a single unified `main` branch.
"""
SQLite Database Connection, Schema Bootstrap, and Context Manager Utilities.
Supports both local persistent SQLite and Vercel serverless /tmp auto-bootstrapping.
"""
import logging
import os
import sqlite3
import sys
from contextlib import contextmanager
from pathlib import Path
from typing import Iterator

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from config import Config
from database.seed import seed_demo_student, seed_initial_data

logger = logging.getLogger(__name__)
_DB_READY = False

SCHEMA_STATEMENTS = [
    """
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        education_level TEXT DEFAULT 'Undergraduate',
        interests TEXT DEFAULT '[]',
        learning_goals TEXT DEFAULT '',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """,
    """
    CREATE TABLE IF NOT EXISTS subjects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        description TEXT NOT NULL,
        icon TEXT DEFAULT 'BookOpen'
    );
    """,
    """
    CREATE TABLE IF NOT EXISTS topics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        subject_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        difficulty_level TEXT NOT NULL CHECK(difficulty_level IN ('Beginner', 'Intermediate', 'Advanced')),
        prerequisite_topic_id INTEGER,
        estimated_minutes INTEGER DEFAULT 45,
        order_index INTEGER DEFAULT 0,
        FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
        FOREIGN KEY (prerequisite_topic_id) REFERENCES topics(id) ON DELETE SET NULL
    );
    """,
    """
    CREATE TABLE IF NOT EXISTS assessments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        subject_id INTEGER NOT NULL,
        topic_id INTEGER,
        title TEXT NOT NULL,
        assessment_type TEXT NOT NULL CHECK(assessment_type IN ('diagnostic', 'quiz', 'milestone')),
        status TEXT NOT NULL DEFAULT 'completed',
        total_questions INTEGER NOT NULL,
        correct_answers INTEGER NOT NULL DEFAULT 0,
        score_percentage REAL NOT NULL DEFAULT 0.0,
        knowledge_gap_level TEXT CHECK(knowledge_gap_level IN ('Weak', 'Moderate', 'Strong')),
        completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
        FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE SET NULL
    );
    """,
    """
    CREATE TABLE IF NOT EXISTS questions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        assessment_id INTEGER NOT NULL,
        topic_id INTEGER,
        question_text TEXT NOT NULL,
        question_type TEXT NOT NULL CHECK(question_type IN ('mcq', 'true_false', 'short_answer')),
        options_json TEXT DEFAULT '[]',
        correct_answer TEXT NOT NULL,
        explanation TEXT NOT NULL,
        difficulty TEXT NOT NULL CHECK(difficulty IN ('Easy', 'Medium', 'Hard')),
        FOREIGN KEY (assessment_id) REFERENCES assessments(id) ON DELETE CASCADE,
        FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE SET NULL
    );
    """,
    """
    CREATE TABLE IF NOT EXISTS student_answers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        assessment_id INTEGER NOT NULL,
        question_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        selected_answer TEXT NOT NULL,
        is_correct INTEGER NOT NULL CHECK(is_correct IN (0, 1)),
        feedback TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (assessment_id) REFERENCES assessments(id) ON DELETE CASCADE,
        FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    """,
    """
    CREATE TABLE IF NOT EXISTS topic_proficiency (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        topic_id INTEGER NOT NULL,
        proficiency_level TEXT NOT NULL CHECK(proficiency_level IN ('Weak', 'Moderate', 'Strong')),
        score_percentage REAL NOT NULL,
        total_attempts INTEGER NOT NULL DEFAULT 1,
        last_assessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, topic_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE
    );
    """,
    """
    CREATE TABLE IF NOT EXISTS learning_paths (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        subject_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        summary TEXT,
        total_estimated_hours REAL DEFAULT 0.0,
        current_status TEXT DEFAULT 'active' CHECK(current_status IN ('active', 'completed', 'archived')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
    );
    """,
    """
    CREATE TABLE IF NOT EXISTS learning_path_tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        learning_path_id INTEGER NOT NULL,
        topic_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        priority TEXT NOT NULL CHECK(priority IN ('High', 'Medium', 'Low')),
        sequence_order INTEGER NOT NULL,
        estimated_minutes INTEGER NOT NULL DEFAULT 45,
        status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'in_progress', 'completed')),
        target_day INTEGER DEFAULT 1,
        completed_at TIMESTAMP,
        FOREIGN KEY (learning_path_id) REFERENCES learning_paths(id) ON DELETE CASCADE,
        FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE
    );
    """,
    """
    CREATE TABLE IF NOT EXISTS learning_resources (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        topic_id INTEGER NOT NULL,
        user_id INTEGER,
        title TEXT NOT NULL,
        url TEXT NOT NULL,
        resource_type TEXT NOT NULL CHECK(resource_type IN ('article', 'video', 'documentation', 'tutorial')),
        snippet TEXT,
        ai_summary TEXT,
        relevance_reason TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    """,
    """
    CREATE TABLE IF NOT EXISTS adaptive_recommendations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        topic_id INTEGER,
        recommendation_type TEXT NOT NULL,
        title TEXT NOT NULL,
        reason TEXT NOT NULL,
        suggested_action TEXT NOT NULL,
        is_applied INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE SET NULL
    );
    """,
    """
    CREATE TABLE IF NOT EXISTS chat_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        topic_id INTEGER,
        sender TEXT NOT NULL CHECK(sender IN ('user', 'assistant')),
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE SET NULL
    );
    """,
    "CREATE INDEX IF NOT EXISTS idx_topics_subject ON topics(subject_id, order_index);",
    "CREATE INDEX IF NOT EXISTS idx_assessments_user_status ON assessments(user_id, status, completed_at);",
    "CREATE INDEX IF NOT EXISTS idx_proficiency_user_topic ON topic_proficiency(user_id, topic_id);",
    "CREATE INDEX IF NOT EXISTS idx_learning_paths_user_subj ON learning_paths(user_id, subject_id, current_status);",
    "CREATE INDEX IF NOT EXISTS idx_tasks_path_seq ON learning_path_tasks(learning_path_id, sequence_order);",
    "CREATE INDEX IF NOT EXISTS idx_chat_user_topic ON chat_messages(user_id, topic_id, created_at);",
]


def _bootstrap_schema_and_seed(conn: sqlite3.Connection) -> None:
    """Creates all tables, indexes, curriculum seed data, and demo student on an open connection."""
    cursor = conn.cursor()
    for ddl in SCHEMA_STATEMENTS:
        cursor.execute(ddl)
    conn.commit()
    seed_initial_data(conn)
    seed_demo_student(conn)


def get_db_connection() -> sqlite3.Connection:
    """Opens a WAL-configured SQLite connection and auto-bootstraps schema if needed."""
    global _DB_READY
    db_path = Config.DATABASE_PATH
    try:
        os.makedirs(os.path.dirname(os.path.abspath(db_path)), exist_ok=True)
    except OSError:
        db_path = "/tmp/learning_agent.db"

    needs_init = (not os.path.exists(db_path)) or (not _DB_READY)
    conn = sqlite3.connect(db_path, timeout=15.0)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    conn.execute("PRAGMA journal_mode = WAL;")
    conn.execute("PRAGMA synchronous = NORMAL;")
    conn.execute("PRAGMA temp_store = MEMORY;")

    if needs_init:
        _bootstrap_schema_and_seed(conn)
        _DB_READY = True
    return conn


@contextmanager
def db_session() -> Iterator[sqlite3.Connection]:
    """Context manager guaranteeing every SQLite connection is deterministically closed."""
    conn = get_db_connection()
    try:
        yield conn
    finally:
        conn.close()


def init_db() -> None:
    """Ensures database schema and initial seed data are initialized."""
    try:
        with db_session():
            pass
    except Exception as exc:
        logger.warning("Could not initialize database during startup: %s", exc)


if __name__ == "__main__":
    init_db()
    logger.info("Database initialized and seeded successfully.")

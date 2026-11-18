import sqlite3
import os
import sys
from pathlib import Path

# Add backend directory to sys.path so config can be imported from any working directory
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from config import Config

def get_db_connection():
    db_path = Config.DATABASE_PATH
    try:
        os.makedirs(os.path.dirname(os.path.abspath(db_path)), exist_ok=True)
    except OSError:
        db_path = "/tmp/learning_agent.db"
    
    conn = sqlite3.connect(db_path, timeout=15.0)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    conn.execute("PRAGMA journal_mode = WAL;")
    conn.execute("PRAGMA synchronous = NORMAL;")
    conn.execute("PRAGMA temp_store = MEMORY;")
    return conn

def init_db():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
    except Exception as e:
        print(f"Warning: Could not connect to database during init_db: {e}")
        return

    # Users Table
    cursor.execute('''
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
    ''')

    # Subjects Table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS subjects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        description TEXT NOT NULL,
        icon TEXT DEFAULT 'BookOpen'
    );
    ''')

    # Topics Table with prerequisites
    cursor.execute('''
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
    ''')

    # Assessments Table
    cursor.execute('''
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
    ''')

    # Questions Table
    cursor.execute('''
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
    ''')

    # Student Answers Table
    cursor.execute('''
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
    ''')

    # Topic Proficiency Table
    cursor.execute('''
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
    ''')

    # Learning Paths Table
    cursor.execute('''
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
    ''')

    # Learning Path Tasks Table
    cursor.execute('''
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
    ''')

    # Learning Resources Table
    cursor.execute('''
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
    ''')

    # Adaptive Recommendations Table
    cursor.execute('''
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
    ''')

    # Chat Messages (for AI Learning Assistant tutor session history)
    cursor.execute('''
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
    ''')
    # Performance Indexes for High-Efficiency Queries
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_topics_subject ON topics(subject_id, order_index);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_assessments_user_status ON assessments(user_id, status, completed_at);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_proficiency_user_topic ON topic_proficiency(user_id, topic_id);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_learning_paths_user_subj ON learning_paths(user_id, subject_id, current_status);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_tasks_path_seq ON learning_path_tasks(learning_path_id, sequence_order);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_chat_user_topic ON chat_messages(user_id, topic_id, created_at);")
    
    conn.commit()
    seed_initial_data(conn)
    seed_demo_student(conn)
    conn.close()

def seed_initial_data(conn):
    cursor = conn.cursor()
    # Check if subjects exist
    cursor.execute("SELECT COUNT(*) FROM subjects;")
    if cursor.fetchone()[0] > 0:
        return

    # Seed core academic & tech subjects
    subjects = [
        ("Python Programming", "Master Python from fundamental syntax to object-oriented patterns and data structures.", "Code"),
        ("Data Structures & Algorithms", "Core computer science fundamentals: lists, trees, graphs, sorting, and dynamic programming.", "Binary"),
        ("Machine Learning Foundations", "Statistical learning, regression, classification, clustering, and neural network basics.", "Cpu"),
        ("Web Development", "Modern web technologies: HTML5/CSS3, JavaScript ES6+, React, REST APIs, and database fundamentals.", "Globe")
    ]
    cursor.executemany("INSERT INTO subjects (name, description, icon) VALUES (?, ?, ?);", subjects)
    
    # Retrieve subject IDs
    cursor.execute("SELECT id, name FROM subjects;")
    subject_map = {name: id for id, name in cursor.fetchall()}

    # Topics for Python Programming (with prerequisite chains)
    py_id = subject_map["Python Programming"]
    py_topics = [
        # (subject_id, name, description, difficulty_level, prereq_name, minutes, order)
        (py_id, "Variables, Data Types & Operators", "Core numeric, boolean, and string primitives and arithmetic operations.", "Beginner", None, 30, 1),
        (py_id, "Control Flow & Loops", "Conditional statements (if/elif/else), while loops, for loops, and iteration patterns.", "Beginner", "Variables, Data Types & Operators", 45, 2),
        (py_id, "Functions & Scope", "Defining functions, parameters, return values, variable scope, and lambda expressions.", "Beginner", "Control Flow & Loops", 45, 3),
        (py_id, "Data Structures: Lists, Tuples & Dicts", "In-depth collection manipulation, list comprehensions, slicing, and dictionary methods.", "Intermediate", "Functions & Scope", 60, 4),
        (py_id, "Object-Oriented Programming (OOP)", "Classes, objects, inheritance, polymorphism, encapsulation, and dunder methods.", "Intermediate", "Data Structures: Lists, Tuples & Dicts", 75, 5),
        (py_id, "File I/O & Exception Handling", "Reading and writing files, context managers (with statements), try-except-finally blocks.", "Intermediate", "Object-Oriented Programming (OOP)", 45, 6),
        (py_id, "Generators, Iterators & Decorators", "Advanced Python metaprogramming, yield keyword, closures, and custom decorators.", "Advanced", "File I/O & Exception Handling", 60, 7)
    ]

    # Topics for Data Structures & Algorithms
    dsa_id = subject_map["Data Structures & Algorithms"]
    dsa_topics = [
        (dsa_id, "Time & Space Complexity (Big-O)", "Analyzing algorithm asymptotic bounds: O(1), O(log n), O(n), O(n log n), O(n^2).", "Beginner", None, 45, 1),
        (dsa_id, "Arrays & Strings", "Two-pointer techniques, sliding window patterns, prefix sums, and in-place manipulations.", "Beginner", "Time & Space Complexity (Big-O)", 60, 2),
        (dsa_id, "Linked Lists (Singly & Doubly)", "Pointers, node traversals, list reversals, cycle detection (Floyd's algorithm).", "Beginner", "Arrays & Strings", 60, 3),
        (dsa_id, "Stacks & Queues", "LIFO and FIFO mechanics, monotonic stacks, bracket matching, and queue applications.", "Intermediate", "Linked Lists (Singly & Doubly)", 50, 4),
        (dsa_id, "Binary Trees & BST", "Tree traversals (in-order, pre-order, post-order, level-order), search trees, and recursion.", "Intermediate", "Stacks & Queues", 75, 5),
        (dsa_id, "Graphs & Graph Algorithms", "Adjacency lists/matrices, BFS, DFS, Dijkstra's shortest path, and topological sort.", "Advanced", "Binary Trees & BST", 90, 6),
        (dsa_id, "Dynamic Programming Basics", "Memoization, tabulation, subproblem breakdowns, knapsack problem, and coin change.", "Advanced", "Graphs & Graph Algorithms", 90, 7)
    ]

    # Topics for Machine Learning Foundations
    ml_id = subject_map["Machine Learning Foundations"]
    ml_topics = [
        (ml_id, "Linear Algebra & Probability Basics", "Vectors, matrices, dot products, Bayes theorem, distributions, and variance.", "Beginner", None, 60, 1),
        (ml_id, "Data Preprocessing & Feature Engineering", "Handling missing values, scaling, normalization, encoding categorical variables, and train-test splits.", "Beginner", "Linear Algebra & Probability Basics", 50, 2),
        (ml_id, "Supervised Learning: Regression", "Simple & multiple linear regression, cost functions, gradient descent, MSE, and R2 score.", "Beginner", "Data Preprocessing & Feature Engineering", 60, 3),
        (ml_id, "Supervised Learning: Classification", "Logistic regression, decision trees, random forests, precision, recall, and ROC-AUC.", "Intermediate", "Supervised Learning: Regression", 75, 4),
        (ml_id, "Unsupervised Learning: Clustering", "K-Means, hierarchical clustering, PCA dimensionality reduction, and elbow method.", "Intermediate", "Supervised Learning: Classification", 60, 5),
        (ml_id, "Model Evaluation & Overfitting", "Bias-variance tradeoff, cross-validation, regularization (L1 Lasso, L2 Ridge).", "Intermediate", "Unsupervised Learning: Clustering", 60, 6),
        (ml_id, "Neural Networks & Deep Learning Intro", "Perceptrons, multi-layer perceptrons, activation functions (ReLU, Sigmoid), backpropagation.", "Advanced", "Model Evaluation & Overfitting", 90, 7)
    ]

    # Topics for Web Development
    web_id = subject_map["Web Development"]
    web_topics = [
        (web_id, "HTML5 Semantic Structure & Forms", "Modern semantic tags, accessible forms, inputs, validations, and page architecture.", "Beginner", None, 40, 1),
        (web_id, "CSS3 Styling, Flexbox & Grid", "Box model, responsive layouts, Flexbox alignment, CSS Grid systems, and media queries.", "Beginner", "HTML5 Semantic Structure & Forms", 60, 2),
        (web_id, "JavaScript Fundamentals & DOM", "Data types, closures, DOM selection/manipulation, event listeners, and bubbling.", "Beginner", "CSS3 Styling, Flexbox & Grid", 60, 3),
        (web_id, "Asynchronous JavaScript & APIs", "Promises, async/await, fetch API, handling JSON responses, and error states.", "Intermediate", "JavaScript Fundamentals & DOM", 60, 4),
        (web_id, "React Fundamentals: Components & Props", "JSX syntax, functional components, props passing, conditional rendering, and lists.", "Intermediate", "Asynchronous JavaScript & APIs", 75, 5),
        (web_id, "React State Management & Hooks", "useState, useEffect, custom hooks, and lifting state up for reactive interfaces.", "Intermediate", "React Fundamentals: Components & Props", 75, 6),
        (web_id, "Backend Integration & RESTful APIs", "Connecting React client to Flask/Express backend, request headers, CORS, and auth tokens.", "Advanced", "React State Management & Hooks", 75, 7)
    ]

    all_topics = py_topics + dsa_topics + ml_topics + web_topics
    topic_name_to_id = {}

    for sub_id, name, desc, diff, prereq_name, minutes, order in all_topics:
        prereq_id = topic_name_to_id.get(prereq_name) if prereq_name else None
        cursor.execute('''
            INSERT INTO topics (subject_id, name, description, difficulty_level, prerequisite_topic_id, estimated_minutes, order_index)
            VALUES (?, ?, ?, ?, ?, ?, ?);
        ''', (sub_id, name, desc, diff, prereq_id, minutes, order))
        topic_name_to_id[name] = cursor.lastrowid

    conn.commit()

def seed_demo_student(conn):
    """
    Pre-populates a rich demo student profile (User ID 1) with realistic historical
    assessments, topic proficiencies, multi-agent recommendations, and an active roadmap.
    Ensures judges and reviewers immediately experience a populated, intelligent dashboard.
    """
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM users WHERE id = 1;")
    user = cursor.fetchone()
    if user:
        return

    from werkzeug.security import generate_password_hash
    import json
    import datetime

    # 1. Create Demo Student
    cursor.execute('''
        INSERT INTO users (id, name, email, password_hash, education_level, interests, learning_goals)
        VALUES (1, 'Sneha Sharma (Demo Student)', 'demo@learnpath.ai', ?, 'Undergraduate', ?, ?)
    ''', (
        generate_password_hash('password123'),
        json.dumps(['Python Programming', 'Data Structures & Algorithms']),
        'Eliminate conceptual knowledge gaps and master CS algorithms for technical interviews.'
    ))

    # Retrieve subject & topics for Python Programming
    cursor.execute("SELECT id FROM subjects WHERE name = 'Python Programming';")
    subj_row = cursor.fetchone()
    if not subj_row:
        return
    py_id = subj_row["id"]

    cursor.execute("SELECT id, name FROM topics WHERE subject_id = ? ORDER BY order_index ASC;", (py_id,))
    topics = cursor.fetchall()
    topic_map = {t["name"]: t["id"] for t in topics}

    t1_id = topic_map.get("Variables, Data Types & Operators")
    t2_id = topic_map.get("Control Flow & Loops")
    t3_id = topic_map.get("Functions & Scope")

    now = datetime.datetime.now()
    d1 = (now - datetime.timedelta(days=3)).strftime("%Y-%m-%d %H:%M:%S")
    d2 = (now - datetime.timedelta(days=2)).strftime("%Y-%m-%d %H:%M:%S")
    d3 = (now - datetime.timedelta(days=1)).strftime("%Y-%m-%d %H:%M:%S")

    # 2. Insert Completed Assessments
    if t1_id:
        cursor.execute('''
            INSERT INTO assessments (user_id, subject_id, topic_id, title, assessment_type, status, total_questions, correct_answers, score_percentage, knowledge_gap_level, completed_at)
            VALUES (1, ?, ?, 'Diagnostic: Variables, Data Types & Operators', 'diagnostic', 'completed', 3, 3, 100.0, 'Strong', ?)
        ''', (py_id, t1_id, d1))
        cursor.execute('''
            INSERT INTO topic_proficiency (user_id, topic_id, proficiency_level, score_percentage, total_attempts, last_assessed_at)
            VALUES (1, ?, 'Strong', 100.0, 1, ?)
        ''', (t1_id, d1))

    if t2_id:
        cursor.execute('''
            INSERT INTO assessments (user_id, subject_id, topic_id, title, assessment_type, status, total_questions, correct_answers, score_percentage, knowledge_gap_level, completed_at)
            VALUES (1, ?, ?, 'Quiz: Control Flow & Loops', 'quiz', 'completed', 3, 1, 33.3, 'Weak', ?)
        ''', (py_id, t2_id, d2))
        cursor.execute('''
            INSERT INTO topic_proficiency (user_id, topic_id, proficiency_level, score_percentage, total_attempts, last_assessed_at)
            VALUES (1, ?, 'Weak', 33.3, 2, ?)
        ''', (t2_id, d2))

    if t3_id:
        cursor.execute('''
            INSERT INTO assessments (user_id, subject_id, topic_id, title, assessment_type, status, total_questions, correct_answers, score_percentage, knowledge_gap_level, completed_at)
            VALUES (1, ?, ?, 'Quiz: Functions & Scope', 'quiz', 'completed', 3, 2, 66.7, 'Moderate', ?)
        ''', (py_id, t3_id, d3))
        cursor.execute('''
            INSERT INTO topic_proficiency (user_id, topic_id, proficiency_level, score_percentage, total_attempts, last_assessed_at)
            VALUES (1, ?, 'Moderate', 66.7, 1, ?)
        ''', (t3_id, d3))

    # 3. Insert Multi-Agent Adaptive Recommendations
    recommendations = [
        (1, t1_id, "prerequisite_first", "Review Prerequisite: Variables, Data Types & Operators",
         "Diagnostic Agent detected score of 33.3% in 'Control Flow & Loops', indicating foundational hurdles in prerequisite 'Variables, Data Types & Operators'.",
         "Complete a review session and diagnostic quiz on 'Variables, Data Types & Operators' before re-attempting 'Control Flow & Loops'."),
        (1, t2_id, "revisit_concept", "Targeted Concept Revisit: Control Flow & Loops",
         "Adaptive Remediation Agent flagged repeated struggle on loop termination and boundary iteration mechanics (Score: 33.3%).",
         "Use Socratic AI Tutor to break down iteration edge cases and review curated video tutorials."),
        (1, t1_id, "increase_difficulty", "Advance to Hard Challenges: Variables, Data Types & Operators",
         "Curriculum Architect Agent verified 100% mastery. Ready for advanced bitwise, immutability, and memory complexity challenges.",
         "Take the Hard difficulty quiz or advance to subsequent dependent concepts.")
    ]
    cursor.executemany('''
        INSERT INTO adaptive_recommendations (user_id, topic_id, recommendation_type, title, reason, suggested_action)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', recommendations)

    # 4. Generate Learning Path with topological sequencing
    from services.roadmap_engine import LearningPathEngine
    try:
        LearningPathEngine.generate_or_update_roadmap(conn, 1, py_id)
    except Exception as e:
        print(f"Notice during demo roadmap setup: {e}")

    conn.commit()

if __name__ == "__main__":
    init_db()
    print("Database initialized and seeded successfully.")

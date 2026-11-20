"""
Curriculum and Demo Student Seeding Module.
Populates initial STEM subjects, prerequisite topic DAGs, and a demo student profile.
"""
import datetime
import json
import logging

from werkzeug.security import generate_password_hash

logger = logging.getLogger(__name__)


def seed_initial_data(conn) -> None:
    """Seeds core academic subjects and prerequisite-chained topics if database is empty."""
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM subjects;")
    if cursor.fetchone()[0] > 0:
        return

    subjects = [
        (
            "Python Programming",
            "Master Python from fundamental syntax to object-oriented patterns and data structures.",
            "Code",
        ),
        (
            "Data Structures & Algorithms",
            "Core computer science fundamentals: lists, trees, graphs, sorting, and dynamic programming.",
            "Binary",
        ),
        (
            "Machine Learning Foundations",
            "Statistical learning, regression, classification, clustering, and neural network basics.",
            "Cpu",
        ),
        (
            "Web Development",
            "Modern web technologies: HTML5/CSS3, JavaScript ES6+, React, REST APIs, and database fundamentals.",
            "Globe",
        ),
    ]
    cursor.executemany(
        "INSERT INTO subjects (name, description, icon) VALUES (?, ?, ?);", subjects
    )

    cursor.execute("SELECT id, name FROM subjects;")
    subject_map = {name: subj_id for subj_id, name in cursor.fetchall()}

    py_id = subject_map["Python Programming"]
    py_topics = [
        (py_id, "Variables, Data Types & Operators", "Core numeric, boolean, and string primitives and arithmetic operations.", "Beginner", None, 30, 1),
        (py_id, "Control Flow & Loops", "Conditional statements (if/elif/else), while loops, for loops, and iteration patterns.", "Beginner", "Variables, Data Types & Operators", 45, 2),
        (py_id, "Functions & Scope", "Defining functions, parameters, return values, variable scope, and lambda expressions.", "Beginner", "Control Flow & Loops", 45, 3),
        (py_id, "Data Structures: Lists, Tuples & Dicts", "In-depth collection manipulation, list comprehensions, slicing, and dictionary methods.", "Intermediate", "Functions & Scope", 60, 4),
        (py_id, "Object-Oriented Programming (OOP)", "Classes, objects, inheritance, polymorphism, encapsulation, and dunder methods.", "Intermediate", "Data Structures: Lists, Tuples & Dicts", 75, 5),
        (py_id, "File I/O & Exception Handling", "Reading and writing files, context managers (with statements), try-except-finally blocks.", "Intermediate", "Object-Oriented Programming (OOP)", 45, 6),
        (py_id, "Generators, Iterators & Decorators", "Advanced Python metaprogramming, yield keyword, closures, and custom decorators.", "Advanced", "File I/O & Exception Handling", 60, 7),
    ]

    dsa_id = subject_map["Data Structures & Algorithms"]
    dsa_topics = [
        (dsa_id, "Time & Space Complexity (Big-O)", "Analyzing algorithm asymptotic bounds: O(1), O(log n), O(n), O(n log n), O(n^2).", "Beginner", None, 45, 1),
        (dsa_id, "Arrays & Strings", "Two-pointer techniques, sliding window patterns, prefix sums, and in-place manipulations.", "Beginner", "Time & Space Complexity (Big-O)", 60, 2),
        (dsa_id, "Linked Lists (Singly & Doubly)", "Pointers, node traversals, list reversals, cycle detection (Floyd's algorithm).", "Beginner", "Arrays & Strings", 60, 3),
        (dsa_id, "Stacks & Queues", "LIFO and FIFO mechanics, monotonic stacks, bracket matching, and queue applications.", "Intermediate", "Linked Lists (Singly & Doubly)", 50, 4),
        (dsa_id, "Binary Trees & BST", "Tree traversals (in-order, pre-order, post-order, level-order), search trees, and recursion.", "Intermediate", "Stacks & Queues", 75, 5),
        (dsa_id, "Graphs & Graph Algorithms", "Adjacency lists/matrices, BFS, DFS, Dijkstra's shortest path, and topological sort.", "Advanced", "Binary Trees & BST", 90, 6),
        (dsa_id, "Dynamic Programming Basics", "Memoization, tabulation, subproblem breakdowns, knapsack problem, and coin change.", "Advanced", "Graphs & Graph Algorithms", 90, 7),
    ]

    ml_id = subject_map["Machine Learning Foundations"]
    ml_topics = [
        (ml_id, "Linear Algebra & Probability Basics", "Vectors, matrices, dot products, Bayes theorem, distributions, and variance.", "Beginner", None, 60, 1),
        (ml_id, "Data Preprocessing & Feature Engineering", "Handling missing values, scaling, normalization, encoding categorical variables, and train-test splits.", "Beginner", "Linear Algebra & Probability Basics", 50, 2),
        (ml_id, "Supervised Learning: Regression", "Simple & multiple linear regression, cost functions, gradient descent, MSE, and R2 score.", "Beginner", "Data Preprocessing & Feature Engineering", 60, 3),
        (ml_id, "Supervised Learning: Classification", "Logistic regression, decision trees, random forests, precision, recall, and ROC-AUC.", "Intermediate", "Supervised Learning: Regression", 75, 4),
        (ml_id, "Unsupervised Learning: Clustering", "K-Means, hierarchical clustering, PCA dimensionality reduction, and elbow method.", "Intermediate", "Supervised Learning: Classification", 60, 5),
        (ml_id, "Model Evaluation & Overfitting", "Bias-variance tradeoff, cross-validation, regularization (L1 Lasso, L2 Ridge).", "Intermediate", "Unsupervised Learning: Clustering", 60, 6),
        (ml_id, "Neural Networks & Deep Learning Intro", "Perceptrons, multi-layer perceptrons, activation functions (ReLU, Sigmoid), backpropagation.", "Advanced", "Model Evaluation & Overfitting", 90, 7),
    ]

    web_id = subject_map["Web Development"]
    web_topics = [
        (web_id, "HTML5 Semantic Structure & Forms", "Modern semantic tags, accessible forms, inputs, validations, and page architecture.", "Beginner", None, 40, 1),
        (web_id, "CSS3 Styling, Flexbox & Grid", "Box model, responsive layouts, Flexbox alignment, CSS Grid systems, and media queries.", "Beginner", "HTML5 Semantic Structure & Forms", 60, 2),
        (web_id, "JavaScript Fundamentals & DOM", "Data types, closures, DOM selection/manipulation, event listeners, and bubbling.", "Beginner", "CSS3 Styling, Flexbox & Grid", 60, 3),
        (web_id, "Asynchronous JavaScript & APIs", "Promises, async/await, fetch API, handling JSON responses, and error states.", "Intermediate", "JavaScript Fundamentals & DOM", 60, 4),
        (web_id, "React Fundamentals: Components & Props", "JSX syntax, functional components, props passing, conditional rendering, and lists.", "Intermediate", "Asynchronous JavaScript & APIs", 75, 5),
        (web_id, "React State Management & Hooks", "useState, useEffect, custom hooks, and lifting state up for reactive interfaces.", "Intermediate", "React Fundamentals: Components & Props", 75, 6),
        (web_id, "Backend Integration & RESTful APIs", "Connecting React client to Flask/Express backend, request headers, CORS, and auth tokens.", "Advanced", "React State Management & Hooks", 75, 7),
    ]

    all_topics = py_topics + dsa_topics + ml_topics + web_topics
    topic_name_to_id = {}

    for sub_id, name, desc, diff, prereq_name, minutes, order in all_topics:
        prereq_id = topic_name_to_id.get(prereq_name) if prereq_name else None
        cursor.execute(
            """
            INSERT INTO topics (
                subject_id, name, description, difficulty_level,
                prerequisite_topic_id, estimated_minutes, order_index
            ) VALUES (?, ?, ?, ?, ?, ?, ?);
            """,
            (sub_id, name, desc, diff, prereq_id, minutes, order),
        )
        topic_name_to_id[name] = cursor.lastrowid

    conn.commit()


def seed_demo_student(conn) -> None:
    """
    Pre-populates a demo student profile (User ID 1) with historical assessments,
    topic proficiencies, adaptive recommendations, and an active learning roadmap.
    """
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM users WHERE id = 1;")
    if cursor.fetchone():
        return

    cursor.execute(
        """
        INSERT INTO users (id, name, email, password_hash, education_level, interests, learning_goals)
        VALUES (1, 'Sneha Sharma (Demo Student)', 'demo@learnpath.ai', ?, 'Undergraduate', ?, ?)
        """,
        (
            generate_password_hash("password123"),
            json.dumps(["Python Programming", "Data Structures & Algorithms"]),
            "Eliminate conceptual knowledge gaps and master CS algorithms for technical interviews.",
        ),
    )

    cursor.execute("SELECT id FROM subjects WHERE name = 'Python Programming';")
    subj_row = cursor.fetchone()
    if not subj_row:
        conn.commit()
        return
    py_id = subj_row["id"]

    cursor.execute(
        "SELECT id, name FROM topics WHERE subject_id = ? ORDER BY order_index ASC;",
        (py_id,),
    )
    topic_map = {t["name"]: t["id"] for t in cursor.fetchall()}

    t1_id = topic_map.get("Variables, Data Types & Operators")
    t2_id = topic_map.get("Control Flow & Loops")
    t3_id = topic_map.get("Functions & Scope")

    now = datetime.datetime.now()
    d1 = (now - datetime.timedelta(days=3)).strftime("%Y-%m-%d %H:%M:%S")
    d2 = (now - datetime.timedelta(days=2)).strftime("%Y-%m-%d %H:%M:%S")
    d3 = (now - datetime.timedelta(days=1)).strftime("%Y-%m-%d %H:%M:%S")

    if t1_id:
        cursor.execute(
            """
            INSERT INTO assessments (
                user_id, subject_id, topic_id, title, assessment_type, status,
                total_questions, correct_answers, score_percentage, knowledge_gap_level, completed_at
            ) VALUES (1, ?, ?, 'Diagnostic: Variables, Data Types & Operators', 'diagnostic', 'completed', 3, 3, 100.0, 'Strong', ?)
            """,
            (py_id, t1_id, d1),
        )
        cursor.execute(
            """
            INSERT INTO topic_proficiency (user_id, topic_id, proficiency_level, score_percentage, total_attempts, last_assessed_at)
            VALUES (1, ?, 'Strong', 100.0, 1, ?)
            """,
            (t1_id, d1),
        )

    if t2_id:
        cursor.execute(
            """
            INSERT INTO assessments (
                user_id, subject_id, topic_id, title, assessment_type, status,
                total_questions, correct_answers, score_percentage, knowledge_gap_level, completed_at
            ) VALUES (1, ?, ?, 'Quiz: Control Flow & Loops', 'quiz', 'completed', 3, 1, 33.3, 'Weak', ?)
            """,
            (py_id, t2_id, d2),
        )
        cursor.execute(
            """
            INSERT INTO topic_proficiency (user_id, topic_id, proficiency_level, score_percentage, total_attempts, last_assessed_at)
            VALUES (1, ?, 'Weak', 33.3, 2, ?)
            """,
            (t2_id, d2),
        )

    if t3_id:
        cursor.execute(
            """
            INSERT INTO assessments (
                user_id, subject_id, topic_id, title, assessment_type, status,
                total_questions, correct_answers, score_percentage, knowledge_gap_level, completed_at
            ) VALUES (1, ?, ?, 'Quiz: Functions & Scope', 'quiz', 'completed', 3, 2, 66.7, 'Moderate', ?)
            """,
            (py_id, t3_id, d3),
        )
        cursor.execute(
            """
            INSERT INTO topic_proficiency (user_id, topic_id, proficiency_level, score_percentage, total_attempts, last_assessed_at)
            VALUES (1, ?, 'Moderate', 66.7, 1, ?)
            """,
            (t3_id, d3),
        )

    recommendations = [
        (
            1,
            t1_id,
            "prerequisite_first",
            "Review Prerequisite: Variables, Data Types & Operators",
            "Diagnostic Agent detected score of 33.3% in 'Control Flow & Loops', indicating foundational hurdles in prerequisite 'Variables, Data Types & Operators'.",
            "Complete a review session and diagnostic quiz on 'Variables, Data Types & Operators' before re-attempting 'Control Flow & Loops'.",
        ),
        (
            1,
            t2_id,
            "revisit_concept",
            "Targeted Concept Revisit: Control Flow & Loops",
            "Adaptive Remediation Agent flagged repeated struggle on loop termination and boundary iteration mechanics (Score: 33.3%).",
            "Use Socratic AI Tutor to break down iteration edge cases and review curated video tutorials.",
        ),
        (
            1,
            t1_id,
            "increase_difficulty",
            "Advance to Hard Challenges: Variables, Data Types & Operators",
            "Curriculum Architect Agent verified 100% mastery. Ready for advanced bitwise, immutability, and memory complexity challenges.",
            "Take the Hard difficulty quiz or advance to subsequent dependent concepts.",
        ),
    ]
    cursor.executemany(
        """
        INSERT INTO adaptive_recommendations (
            user_id, topic_id, recommendation_type, title, reason, suggested_action
        ) VALUES (?, ?, ?, ?, ?, ?)
        """,
        recommendations,
    )

    from services.roadmap_engine import LearningPathEngine

    try:
        LearningPathEngine.generate_or_update_roadmap(conn, 1, py_id)
    except Exception as exc:
        logger.warning("Notice during demo roadmap setup: %s", exc)

    conn.commit()

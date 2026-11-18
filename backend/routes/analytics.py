from flask import Blueprint, jsonify
import pandas as pd
from database.db import get_db_connection
from routes.auth import get_current_user_id
from services.recommendation import AdaptiveRecommendationEngine

analytics_bp = Blueprint('analytics', __name__, url_prefix='/api/analytics')

@analytics_bp.route('/dashboard', methods=['GET'])
def get_dashboard_analytics():
    user_id = get_current_user_id()
    conn = get_db_connection()

    # 1. Fetch completed assessments using Pandas
    assessments_df = pd.read_sql_query('''
        SELECT a.id, a.subject_id, a.topic_id, a.title, a.assessment_type, a.correct_answers,
               a.total_questions, a.score_percentage, a.knowledge_gap_level, a.completed_at,
               s.name as subject_name, COALESCE(t.name, 'Subject Diagnostic') as topic_name
        FROM assessments a
        JOIN subjects s ON a.subject_id = s.id
        LEFT JOIN topics t ON a.topic_id = t.id
        WHERE a.user_id = ? AND a.status = 'completed'
        ORDER BY a.completed_at ASC
    ''', conn, params=(user_id,))

    # 2. Fetch topic proficiencies
    prof_df = pd.read_sql_query('''
        SELECT tp.*, t.name as topic_name, s.name as subject_name
        FROM topic_proficiency tp
        JOIN topics t ON tp.topic_id = t.id
        JOIN subjects s ON t.subject_id = s.id
        WHERE tp.user_id = ?
    ''', conn, params=(user_id,))

    # 3. Fetch learning tasks stats
    tasks_df = pd.read_sql_query('''
        SELECT lpt.id, lpt.status, lpt.priority, lp.subject_id, s.name as subject_name
        FROM learning_path_tasks lpt
        JOIN learning_paths lp ON lpt.learning_path_id = lp.id
        JOIN subjects s ON lp.subject_id = s.id
        WHERE lp.user_id = ?
    ''', conn, params=(user_id,))

    # Overall Summary
    total_assessments = len(assessments_df)
    avg_score = round(float(assessments_df['score_percentage'].mean()), 1) if not assessments_df.empty else 0.0

    total_tasks = len(tasks_df)
    completed_tasks = int((tasks_df['status'] == 'completed').sum()) if not tasks_df.empty else 0
    overall_progress = round((completed_tasks / total_tasks * 100), 1) if total_tasks > 0 else 0.0

    # Proficiency Breakdown
    weak_count = int((prof_df['proficiency_level'] == 'Weak').sum()) if not prof_df.empty else 0
    moderate_count = int((prof_df['proficiency_level'] == 'Moderate').sum()) if not prof_df.empty else 0
    strong_count = int((prof_df['proficiency_level'] == 'Strong').sum()) if not prof_df.empty else 0

    # Scores over time for Recharts
    score_timeline = []
    if not assessments_df.empty:
        for idx, row in assessments_df.iterrows():
            score_timeline.append({
                'attempt': idx + 1,
                'title': row['topic_name'],
                'subject': row['subject_name'],
                'score': float(row['score_percentage']),
                'type': row['assessment_type'],
                'date': str(row['completed_at'])[:10]
            })

    # Subject-wise comparison
    subject_stats = []
    if not assessments_df.empty:
        grouped = assessments_df.groupby('subject_name')
        for subject_name, group in grouped:
            subject_stats.append({
                'subject': subject_name,
                'average_score': round(float(group['score_percentage'].mean()), 1),
                'assessments_taken': len(group),
                'highest_score': float(group['score_percentage'].max())
            })

    # Active recommendations
    recommendations = AdaptiveRecommendationEngine.get_active_recommendations(conn, user_id, limit=5)

    conn.close()

    return jsonify({
        'summary': {
            'total_assessments': total_assessments,
            'average_score': avg_score,
            'overall_progress': overall_progress,
            'completed_tasks': completed_tasks,
            'total_tasks': total_tasks,
            'weak_gaps': weak_count,
            'moderate_gaps': moderate_count,
            'strong_mastery': strong_count
        },
        'score_timeline': score_timeline,
        'subject_stats': subject_stats,
        'recent_recommendations': recommendations
    })

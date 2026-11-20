"""Learning Analytics and Student Progress Dashboard Blueprint."""
from database.db import db_session
from flask import Blueprint, jsonify
from routes.auth import get_current_user_id
from services.recommendation import AdaptiveRecommendationEngine

analytics_bp = Blueprint('analytics', __name__, url_prefix='/api/analytics')


@analytics_bp.route('/dashboard', methods=['GET'])
def get_dashboard_analytics():
    """Aggregates student performance timeline, mastery distribution, and subject metrics via SQL."""
    user_id = get_current_user_id()
    with db_session() as conn:
        # 1. Fetch completed assessments via indexed SQL query
        assessments_rows = conn.execute('''
            SELECT a.id, a.subject_id, a.topic_id, a.title, a.assessment_type, a.correct_answers,
                   a.total_questions, a.score_percentage, a.knowledge_gap_level, a.completed_at,
                   s.name as subject_name, COALESCE(t.name, 'Subject Diagnostic') as topic_name
            FROM assessments a
            JOIN subjects s ON a.subject_id = s.id
            LEFT JOIN topics t ON a.topic_id = t.id
            WHERE a.user_id = ? AND a.status = 'completed'
            ORDER BY a.completed_at ASC
        ''', (user_id,)).fetchall()

        # 2. Aggregate topic proficiencies directly in SQL
        prof_rows = conn.execute('''
            SELECT proficiency_level, COUNT(*) as cnt
            FROM topic_proficiency
            WHERE user_id = ?
            GROUP BY proficiency_level
        ''', (user_id,)).fetchall()
        prof_counts = {r['proficiency_level']: r['cnt'] for r in prof_rows}

        # 3. Aggregate learning tasks stats directly in SQL
        task_stats = conn.execute('''
            SELECT COUNT(*) as total_tasks,
                   SUM(CASE WHEN lpt.status = 'completed' THEN 1 ELSE 0 END) as completed_tasks
            FROM learning_path_tasks lpt
            JOIN learning_paths lp ON lpt.learning_path_id = lp.id
            WHERE lp.user_id = ?
        ''', (user_id,)).fetchone()

        recommendations = AdaptiveRecommendationEngine.get_active_recommendations(conn, user_id, limit=5)

    total_assessments = len(assessments_rows)
    avg_score = round(
        sum(float(r['score_percentage']) for r in assessments_rows) / total_assessments, 1
    ) if total_assessments > 0 else 0.0

    total_tasks = int(task_stats['total_tasks'] or 0) if task_stats else 0
    completed_tasks = int(task_stats['completed_tasks'] or 0) if task_stats else 0
    overall_progress = round((completed_tasks / total_tasks * 100), 1) if total_tasks > 0 else 0.0

    weak_count = int(prof_counts.get('Weak', 0))
    moderate_count = int(prof_counts.get('Moderate', 0))
    strong_count = int(prof_counts.get('Strong', 0))

    score_timeline = []
    subject_groups = {}
    for idx, row in enumerate(assessments_rows, start=1):
        score_val = float(row['score_percentage'])
        subj_name = row['subject_name']
        score_timeline.append({
            'attempt': idx,
            'title': row['topic_name'],
            'subject': subj_name,
            'score': score_val,
            'type': row['assessment_type'],
            'date': str(row['completed_at'])[:10]
        })
        subject_groups.setdefault(subj_name, []).append(score_val)

    subject_stats = [
        {
            'subject': subj_name,
            'average_score': round(sum(scores) / len(scores), 1),
            'assessments_taken': len(scores),
            'highest_score': max(scores)
        }
        for subj_name, scores in subject_groups.items()
    ]

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

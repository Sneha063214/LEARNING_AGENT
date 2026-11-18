from flask import Blueprint, request, jsonify
from database.db import get_db_connection
from routes.auth import get_current_user_id
from services.gap_engine import KnowledgeGapEngine

gap_bp = Blueprint('gap', __name__, url_prefix='/api/gap-analysis')

@gap_bp.route('', methods=['GET'])
def get_gap_analysis():
    user_id = get_current_user_id()
    subject_id = request.args.get('subject_id', type=int)

    conn = get_db_connection()
    all_gaps = KnowledgeGapEngine.aggregate_student_gaps(conn, user_id, subject_id)

    weak_topics = [g for g in all_gaps if g['proficiency_level'] == 'Weak']
    moderate_topics = [g for g in all_gaps if g['proficiency_level'] == 'Moderate']
    strong_topics = [g for g in all_gaps if g['proficiency_level'] == 'Strong']

    # Total concepts assessed
    total_assessed = len(all_gaps)
    average_score = round(sum(g['score_percentage'] for g in all_gaps) / total_assessed, 1) if total_assessed > 0 else 0.0

    conn.close()

    return jsonify({
        'total_assessed': total_assessed,
        'average_score': average_score,
        'counts': {
            'weak': len(weak_topics),
            'moderate': len(moderate_topics),
            'strong': len(strong_topics)
        },
        'weak_concepts': weak_topics,
        'moderate_concepts': moderate_topics,
        'strong_concepts': strong_topics,
        'all_evaluated_topics': all_gaps
    })

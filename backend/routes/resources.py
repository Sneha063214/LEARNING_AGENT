from flask import Blueprint, request, jsonify
from database.db import get_db_connection
from routes.auth import get_current_user_id
from services.search_service import SearchService

resources_bp = Blueprint('resources', __name__, url_prefix='/api/resources')

@resources_bp.route('', methods=['GET'])
def get_resources():
    user_id = get_current_user_id()
    topic_id = request.args.get('topic_id', type=int)

    conn = get_db_connection()

    topic_name = "Python Programming Fundamentals"
    subject_name = "Computer Science"
    weak_reason = ""

    if topic_id:
        t_row = conn.execute('''
            SELECT t.name as topic_name, s.name as subject_name
            FROM topics t
            JOIN subjects s ON t.subject_id = s.id
            WHERE t.id = ?
        ''', (topic_id,)).fetchone()
        if t_row:
            topic_name = t_row['topic_name']
            subject_name = t_row['subject_name']
    else:
        # Check if the user has any weak topics
        weak_topic = conn.execute('''
            SELECT t.id, t.name as topic_name, s.name as subject_name, tp.score_percentage
            FROM topic_proficiency tp
            JOIN topics t ON tp.topic_id = t.id
            JOIN subjects s ON t.subject_id = s.id
            WHERE tp.user_id = ? AND tp.proficiency_level = 'Weak'
            ORDER BY tp.score_percentage ASC LIMIT 1
        ''', (user_id,)).fetchone()

        if weak_topic:
            topic_name = weak_topic['topic_name']
            subject_name = weak_topic['subject_name']
            weak_reason = f"Recommended to address knowledge gap in {topic_name} (Current Score: {weak_topic['score_percentage']}%)."

    conn.close()

    resources = SearchService.get_learning_resources_for_topic(
        topic_name=topic_name,
        subject_name=subject_name,
        weak_reason=weak_reason
    )

    return jsonify({
        'target_topic': topic_name,
        'subject_name': subject_name,
        'weak_reason': weak_reason,
        'resources': resources
    })

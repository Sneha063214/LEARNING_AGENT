from flask import Blueprint, jsonify
from database.db import get_db_connection

subjects_bp = Blueprint('subjects', __name__, url_prefix='/api/subjects')

@subjects_bp.route('', methods=['GET'])
def get_subjects():
    conn = get_db_connection()
    subjects = conn.execute('''
        SELECT s.*, COUNT(t.id) as topic_count
        FROM subjects s
        LEFT JOIN topics t ON s.id = t.subject_id
        GROUP BY s.id
        ORDER BY s.id ASC
    ''').fetchall()
    
    result = []
    for s in subjects:
        result.append({
            'id': s['id'],
            'name': s['name'],
            'description': s['description'],
            'icon': s['icon'],
            'topic_count': s['topic_count']
        })
    conn.close()
    return jsonify(result)

@subjects_bp.route('/<int:subject_id>/topics', methods=['GET'])
def get_subject_topics(subject_id):
    conn = get_db_connection()
    topics = conn.execute('''
        SELECT t.*, pt.name as prerequisite_name
        FROM topics t
        LEFT JOIN topics pt ON t.prerequisite_topic_id = pt.id
        WHERE t.subject_id = ?
        ORDER BY t.order_index ASC
    ''', (subject_id,)).fetchall()
    
    result = [dict(t) for t in topics]
    conn.close()
    return jsonify(result)

"""Socratic AI Tutor and Concept Deep-Dive Blueprint."""
from database.db import db_session
from flask import Blueprint, jsonify, request
from routes.auth import get_current_user_id
from services.ai_service import AIService

tutor_bp = Blueprint('tutor', __name__, url_prefix='/api/tutor')


@tutor_bp.route('/chat', methods=['POST'])
def tutor_chat():
    """Provides conversational Socratic tutoring adapting to the student's background and chat context."""
    user_id = get_current_user_id()
    data = request.get_json() or {}
    raw_message = data.get('message', '').strip()
    topic_id = data.get('topic_id')

    if not raw_message:
        return jsonify({'error': 'Message content is required'}), 400

    message = AIService.sanitize_user_input(raw_message, max_length=1000)

    with db_session() as conn:
        cursor = conn.cursor()

        # Get student education level and topic info
        user = cursor.execute('SELECT education_level FROM users WHERE id = ?', (user_id,)).fetchone()
        student_level = user['education_level'] if user else 'Beginner'

        topic_name = "General STEM & Programming Concepts"
        if topic_id:
            topic = cursor.execute('SELECT name FROM topics WHERE id = ?', (topic_id,)).fetchone()
            if topic:
                topic_name = topic['name']

        # Save user message
        cursor.execute('''
            INSERT INTO chat_messages (user_id, topic_id, sender, message)
            VALUES (?, ?, 'user', ?)
        ''', (user_id, topic_id, message))

        # Fetch recent context
        recent_messages = cursor.execute('''
            SELECT sender, message FROM chat_messages
            WHERE user_id = ? AND (topic_id = ? OR topic_id IS NULL)
            ORDER BY created_at DESC LIMIT 6
        ''', (user_id, topic_id)).fetchall()

        formatted_history = []
        for m in reversed(recent_messages):
            role = 'user' if m['sender'] == 'user' else 'assistant'
            formatted_history.append({'role': role, 'content': m['message']})

        # Call AI Tutor
        reply = AIService.tutor_chat(
            messages=formatted_history,
            topic_name=topic_name,
            student_level=student_level
        )

        # Save assistant reply
        cursor.execute('''
            INSERT INTO chat_messages (user_id, topic_id, sender, message)
            VALUES (?, ?, 'assistant', ?)
        ''', (user_id, topic_id, reply))

        conn.commit()

    return jsonify({
        'reply': reply,
        'topic_name': topic_name,
        'student_level': student_level
    })


@tutor_bp.route('/history', methods=['GET'])
def get_chat_history():
    """Retrieves chronological chat conversation history for a student and topic."""
    user_id = get_current_user_id()
    topic_id = request.args.get('topic_id', type=int)

    with db_session() as conn:
        query = '''
            SELECT cm.*, t.name as topic_name
            FROM chat_messages cm
            LEFT JOIN topics t ON cm.topic_id = t.id
            WHERE cm.user_id = ?
        '''
        params = [user_id]
        if topic_id:
            query += ' AND cm.topic_id = ?'
            params.append(topic_id)
        query += ' ORDER BY cm.created_at ASC LIMIT 50'

        messages = conn.execute(query, params).fetchall()
        result = [dict(m) for m in messages]

    return jsonify(result)


@tutor_bp.route('/explain', methods=['POST'])
def explain_concept():
    """Generates structured pedagogical breakdown: definition, analogy, code examples, and practice question."""
    user_id = get_current_user_id()
    data = request.get_json() or {}
    topic_id = data.get('topic_id')

    with db_session() as conn:
        user = conn.execute('SELECT education_level FROM users WHERE id = ?', (user_id,)).fetchone()
        student_level = user['education_level'] if user else 'Beginner'

        topic_name = "Core Concept"
        subject_name = "Computer Science"
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

    explanation = AIService.explain_concept(
        topic_name=topic_name,
        subject_name=subject_name,
        student_level=student_level
    )
    return jsonify(explanation)

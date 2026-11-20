"""Diagnostic and Quiz Assessment Blueprint."""
import json

from database.db import db_session
from flask import Blueprint, jsonify, request
from routes.auth import get_current_user_id
from services.ai_service import AIService
from services.gap_engine import KnowledgeGapEngine
from services.recommendation import AdaptiveRecommendationEngine

assessment_bp = Blueprint('assessment', __name__, url_prefix='/api/assessment')


@assessment_bp.route('/generate', methods=['POST'])
def generate_assessment():
    """Generates a dynamic diagnostic test or quiz via AI with offline question bank fallback."""
    user_id = get_current_user_id()
    data = request.get_json() or {}

    subject_id = data.get('subject_id')
    topic_id = data.get('topic_id')
    assessment_type = data.get('assessment_type', 'diagnostic')
    difficulty = data.get('difficulty', 'Medium')
    count = int(data.get('count', 5))

    if not subject_id:
        return jsonify({'error': 'subject_id is required'}), 400

    with db_session() as conn:
        cursor = conn.cursor()

        subject = cursor.execute('SELECT name FROM subjects WHERE id = ?', (subject_id,)).fetchone()
        if not subject:
            return jsonify({'error': 'Subject not found'}), 404

        topic_name = "Subject Diagnostic Overview"
        if topic_id:
            topic = cursor.execute('SELECT name FROM topics WHERE id = ?', (topic_id,)).fetchone()
            if topic:
                topic_name = topic['name']

        # Generate questions via AIService
        ai_result = AIService.generate_assessment_questions(
            topic_name=topic_name,
            subject_name=subject['name'],
            count=count,
            difficulty=difficulty
        )

        questions_data = ai_result.get('questions', [])
        if not questions_data:
            return jsonify({'error': 'Unable to generate questions at this time.'}), 500

        title = f"{'Diagnostic Assessment' if assessment_type == 'diagnostic' else 'Quiz'}: {topic_name}"

        # Create assessment in database
        cursor.execute('''
            INSERT INTO assessments (
                user_id, subject_id, topic_id, title, assessment_type,
                status, total_questions, correct_answers, score_percentage
            ) VALUES (?, ?, ?, ?, ?, 'pending', ?, 0, 0.0)
        ''', (user_id, subject_id, topic_id, title, assessment_type, len(questions_data)))
        assessment_id = cursor.lastrowid

        saved_questions = []
        for q in questions_data:
            cursor.execute('''
                INSERT INTO questions (
                    assessment_id, topic_id, question_text, question_type,
                    options_json, correct_answer, explanation, difficulty
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                assessment_id, topic_id, q['question_text'], q.get('question_type', 'mcq'),
                json.dumps(q.get('options', [])), q['correct_answer'], q['explanation'], q.get('difficulty', difficulty)
            ))
            q_id = cursor.lastrowid
            saved_questions.append({
                'id': q_id,
                'question_text': q['question_text'],
                'question_type': q.get('question_type', 'mcq'),
                'options': q.get('options', []),
                'difficulty': q.get('difficulty', difficulty)
            })

        conn.commit()

    return jsonify({
        'assessment_id': assessment_id,
        'title': title,
        'subject_id': subject_id,
        'subject_name': subject['name'],
        'topic_id': topic_id,
        'topic_name': topic_name,
        'assessment_type': assessment_type,
        'difficulty': difficulty,
        'total_questions': len(saved_questions),
        'source': ai_result.get('source'),
        'questions': saved_questions
    })


@assessment_bp.route('/submit', methods=['POST'])
def submit_assessment():
    """Evaluates student answers, records proficiency, and triggers adaptive remediation."""
    user_id = get_current_user_id()
    data = request.get_json() or {}
    assessment_id = data.get('assessment_id')
    user_answers = data.get('answers', [])

    if not assessment_id:
        return jsonify({'error': 'assessment_id is required'}), 400

    with db_session() as conn:
        cursor = conn.cursor()

        assessment = cursor.execute('SELECT * FROM assessments WHERE id = ?', (assessment_id,)).fetchone()
        if not assessment:
            return jsonify({'error': 'Assessment not found'}), 404

        # Fetch all questions for this assessment
        questions_rows = cursor.execute('''
            SELECT * FROM questions WHERE assessment_id = ?
        ''', (assessment_id,)).fetchall()

        questions_map = {q['id']: dict(q) for q in questions_rows}
        answers_map = {a.get('question_id'): a.get('selected_answer', '').strip() for a in user_answers}

        correct_count = 0
        total_questions = len(questions_map)
        detailed_results = []
        incorrect_questions = []

        for q_id, q in questions_map.items():
            user_sel = answers_map.get(q_id, '')
            correct_ans = q['correct_answer'].strip()
            is_correct = (user_sel.lower() == correct_ans.lower())

            if is_correct:
                correct_count += 1
            else:
                incorrect_questions.append(q)

            cursor.execute('''
                INSERT INTO student_answers (assessment_id, question_id, user_id, selected_answer, is_correct, feedback)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (assessment_id, q_id, user_id, user_sel, 1 if is_correct else 0, q['explanation']))

            detailed_results.append({
                'question_id': q_id,
                'question_text': q['question_text'],
                'options': json.loads(q['options_json']),
                'selected_answer': user_sel,
                'correct_answer': correct_ans,
                'is_correct': is_correct,
                'explanation': q['explanation'],
                'difficulty': q['difficulty']
            })

        score_pct = round((correct_count / total_questions * 100), 1) if total_questions > 0 else 0.0
        gap_level = KnowledgeGapEngine.classify_proficiency(score_pct)

        # Update assessment
        cursor.execute('''
            UPDATE assessments
            SET status = 'completed',
                correct_answers = ?,
                score_percentage = ?,
                knowledge_gap_level = ?,
                completed_at = CURRENT_TIMESTAMP
            WHERE id = ?
        ''', (correct_count, score_pct, gap_level, assessment_id))
        conn.commit()

        # Run Knowledge Gap Analysis
        topic_name = "Subject Knowledge"
        if assessment['topic_id']:
            t_row = cursor.execute('SELECT name FROM topics WHERE id = ?', (assessment['topic_id'],)).fetchone()
            if t_row:
                topic_name = t_row['name']

        gap_report = KnowledgeGapEngine.analyze_assessment(
            total_questions=total_questions,
            correct_count=correct_count,
            topic_name=topic_name,
            incorrect_questions=incorrect_questions
        )

        # Trigger Adaptive Recommendation Engine (which also adapts the roadmap!)
        recommendations = AdaptiveRecommendationEngine.evaluate_and_adapt(conn, user_id, assessment_id)

    return jsonify({
        'assessment_id': assessment_id,
        'score_percentage': score_pct,
        'correct_answers': correct_count,
        'total_questions': total_questions,
        'proficiency_level': gap_level,
        'gap_report': gap_report,
        'adaptive_recommendations': recommendations,
        'detailed_results': detailed_results
    })


@assessment_bp.route('/history', methods=['GET'])
def get_history():
    """Retrieves student's completed assessment attempt history."""
    user_id = get_current_user_id()
    with db_session() as conn:
        history = conn.execute('''
            SELECT a.*, s.name as subject_name, t.name as topic_name
            FROM assessments a
            JOIN subjects s ON a.subject_id = s.id
            LEFT JOIN topics t ON a.topic_id = t.id
            WHERE a.user_id = ? AND a.status = 'completed'
            ORDER BY a.completed_at DESC
        ''', (user_id,)).fetchall()
        result = [dict(h) for h in history]

    return jsonify(result)


@assessment_bp.route('/<int:assessment_id>', methods=['GET'])
def get_assessment_detail(assessment_id):
    """Retrieves detailed question-by-question review of a specific assessment."""
    user_id = get_current_user_id()
    with db_session() as conn:
        assessment = conn.execute('''
            SELECT a.*, s.name as subject_name, t.name as topic_name
            FROM assessments a
            JOIN subjects s ON a.subject_id = s.id
            LEFT JOIN topics t ON a.topic_id = t.id
            WHERE a.id = ? AND a.user_id = ?
        ''', (assessment_id, user_id)).fetchone()

        if not assessment:
            return jsonify({'error': 'Assessment not found'}), 404

        answers = conn.execute('''
            SELECT q.id as question_id, q.question_text, q.options_json, q.correct_answer, q.explanation, q.difficulty,
                   sa.selected_answer, sa.is_correct
            FROM questions q
            LEFT JOIN student_answers sa ON q.id = sa.question_id AND sa.assessment_id = ?
            WHERE q.assessment_id = ?
        ''', (assessment_id, assessment_id)).fetchall()

        results = []
        for a in answers:
            results.append({
                'question_id': a['question_id'],
                'question_text': a['question_text'],
                'options': json.loads(a['options_json']),
                'selected_answer': a['selected_answer'],
                'correct_answer': a['correct_answer'],
                'is_correct': bool(a['is_correct']),
                'explanation': a['explanation'],
                'difficulty': a['difficulty']
            })

    return jsonify({
        'assessment': dict(assessment),
        'questions': results
    })

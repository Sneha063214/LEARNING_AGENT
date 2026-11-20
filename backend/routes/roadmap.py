"""Personalized Learning Roadmap Blueprint."""
import datetime

from database.db import db_session
from flask import Blueprint, jsonify, make_response
from routes.auth import get_current_user_id
from services.gap_engine import KnowledgeGapEngine
from services.pdf_service import PDFService
from services.roadmap_engine import LearningPathEngine

roadmap_bp = Blueprint('roadmap', __name__, url_prefix='/api/roadmap')


@roadmap_bp.route('/<int:subject_id>', methods=['GET'])
def get_or_create_roadmap(subject_id):
    """Retrieves an existing active learning roadmap or generates a new one based on prerequisite DAG."""
    user_id = get_current_user_id()
    with db_session() as conn:
        path = conn.execute('''
            SELECT id FROM learning_paths
            WHERE user_id = ? AND subject_id = ? AND current_status = 'active'
        ''', (user_id, subject_id)).fetchone()

        if path:
            roadmap = LearningPathEngine.get_roadmap_details(conn, path['id'])
        else:
            roadmap = LearningPathEngine.generate_or_update_roadmap(conn, user_id, subject_id)

    return jsonify(roadmap)


@roadmap_bp.route('/regenerate/<int:subject_id>', methods=['POST'])
def regenerate_roadmap(subject_id):
    """Rebuilds the student's learning roadmap recalculating topological sequence and target days."""
    user_id = get_current_user_id()
    with db_session() as conn:
        roadmap = LearningPathEngine.generate_or_update_roadmap(conn, user_id, subject_id)
    return jsonify(roadmap)


@roadmap_bp.route('/task/<int:task_id>/toggle', methods=['POST'])
def toggle_task(task_id):
    """Toggles task status between completed and pending with completion timestamping."""
    user_id = get_current_user_id()
    with db_session() as conn:
        cursor = conn.cursor()

        task = cursor.execute('''
            SELECT lpt.*, lp.user_id, lp.id as path_id
            FROM learning_path_tasks lpt
            JOIN learning_paths lp ON lpt.learning_path_id = lp.id
            WHERE lpt.id = ? AND lp.user_id = ?
        ''', (task_id, user_id)).fetchone()

        if not task:
            return jsonify({'error': 'Task not found or unauthorized'}), 404

        new_status = 'completed' if task['status'] != 'completed' else 'pending'
        completed_at = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S") if new_status == 'completed' else None

        cursor.execute('''
            UPDATE learning_path_tasks
            SET status = ?, completed_at = ?
            WHERE id = ?
        ''', (new_status, completed_at, task_id))
        conn.commit()

        updated_roadmap = LearningPathEngine.get_roadmap_details(conn, task['path_id'])

    return jsonify({
        'task_id': task_id,
        'new_status': new_status,
        'roadmap': updated_roadmap
    })


@roadmap_bp.route('/<int:path_id>/download-pdf', methods=['GET'])
def download_pdf(path_id):
    """Generates and streams a high-resolution PDF report of the student roadmap and knowledge gaps."""
    user_id = get_current_user_id()
    with db_session() as conn:
        roadmap = LearningPathEngine.get_roadmap_details(conn, path_id)
        if not roadmap or roadmap['user_id'] != user_id:
            return jsonify({'error': 'Roadmap not found'}), 404

        user = conn.execute('SELECT * FROM users WHERE id = ?', (user_id,)).fetchone()
        gaps = KnowledgeGapEngine.aggregate_student_gaps(conn, user_id, roadmap['subject_id'])

    pdf_bytes = PDFService.generate_roadmap_pdf(
        student_data=dict(user) if user else {'name': 'Student'},
        roadmap_data=roadmap,
        gaps_data=gaps
    )

    response = make_response(pdf_bytes)
    response.headers['Content-Type'] = 'application/pdf'
    response.headers['Content-Disposition'] = f'attachment; filename=LearnPath_Roadmap_{roadmap["subject_name"].replace(" ", "_")}.pdf'
    return response

from flask import Blueprint, request, jsonify, make_response
from database.db import get_db_connection
from routes.auth import get_current_user_id
from services.roadmap_engine import LearningPathEngine
from services.gap_engine import KnowledgeGapEngine
from services.pdf_service import PDFService
import datetime

roadmap_bp = Blueprint('roadmap', __name__, url_prefix='/api/roadmap')

@roadmap_bp.route('/<int:subject_id>', methods=['GET'])
def get_or_create_roadmap(subject_id):
    user_id = get_current_user_id()
    conn = get_db_connection()
    
    # Check if active path exists
    path = conn.execute('''
        SELECT id FROM learning_paths
        WHERE user_id = ? AND subject_id = ? AND current_status = 'active'
    ''', (user_id, subject_id)).fetchone()

    if path:
        roadmap = LearningPathEngine.get_roadmap_details(conn, path['id'])
    else:
        roadmap = LearningPathEngine.generate_or_update_roadmap(conn, user_id, subject_id)

    conn.close()
    return jsonify(roadmap)

@roadmap_bp.route('/regenerate/<int:subject_id>', methods=['POST'])
def regenerate_roadmap(subject_id):
    user_id = get_current_user_id()
    conn = get_db_connection()
    roadmap = LearningPathEngine.generate_or_update_roadmap(conn, user_id, subject_id)
    conn.close()
    return jsonify(roadmap)

@roadmap_bp.route('/task/<int:task_id>/toggle', methods=['POST'])
def toggle_task(task_id):
    user_id = get_current_user_id()
    conn = get_db_connection()
    cursor = conn.cursor()

    task = cursor.execute('''
        SELECT lpt.*, lp.user_id, lp.id as path_id
        FROM learning_path_tasks lpt
        JOIN learning_paths lp ON lpt.learning_path_id = lp.id
        WHERE lpt.id = ? AND lp.user_id = ?
    ''', (task_id, user_id)).fetchone()

    if not task:
        conn.close()
        return jsonify({'error': 'Task not found or unauthorized'}), 404

    new_status = 'completed' if task['status'] != 'completed' else 'pending'
    completed_at = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S") if new_status == 'completed' else None

    cursor.execute('''
        UPDATE learning_path_tasks
        SET status = ?, completed_at = ?
        WHERE id = ?
    ''', (new_status, completed_at, task_id))
    conn.commit()

    # Recalculate roadmap summary
    updated_roadmap = LearningPathEngine.get_roadmap_details(conn, task['path_id'])
    conn.close()

    return jsonify({
        'task_id': task_id,
        'new_status': new_status,
        'roadmap': updated_roadmap
    })

@roadmap_bp.route('/<int:path_id>/download-pdf', methods=['GET'])
def download_pdf(path_id):
    user_id = get_current_user_id()
    conn = get_db_connection()

    roadmap = LearningPathEngine.get_roadmap_details(conn, path_id)
    if not roadmap or roadmap['user_id'] != user_id:
        conn.close()
        return jsonify({'error': 'Roadmap not found'}), 404

    user = conn.execute('SELECT * FROM users WHERE id = ?', (user_id,)).fetchone()
    gaps = KnowledgeGapEngine.aggregate_student_gaps(conn, user_id, roadmap['subject_id'])
    conn.close()

    pdf_bytes = PDFService.generate_roadmap_pdf(
        student_data=dict(user) if user else {'name': 'Student'},
        roadmap_data=roadmap,
        gaps_data=gaps
    )

    response = make_response(pdf_bytes)
    response.headers['Content-Type'] = 'application/pdf'
    response.headers['Content-Disposition'] = f'attachment; filename=LearnPath_Roadmap_{roadmap["subject_name"].replace(" ", "_")}.pdf'
    return response

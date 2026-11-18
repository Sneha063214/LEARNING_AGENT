import sys
import os
import json
import pytest
from pathlib import Path

# Add backend directory to path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app import create_app
from database.db import get_db_connection, init_db
from services.gap_engine import KnowledgeGapEngine
from services.roadmap_engine import LearningPathEngine
from services.recommendation import AdaptiveRecommendationEngine
from services.pdf_service import PDFService

@pytest.fixture
def client():
    # Use temporary or test database config
    app = create_app()
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_health_check(client):
    response = client.get('/api/health')
    assert response.status_code == 200
    data = response.get_json()
    assert data['status'] == 'healthy'
    assert data['database'] == 'connected'

def test_get_subjects(client):
    response = client.get('/api/subjects')
    assert response.status_code == 200
    data = response.get_json()
    assert len(data) >= 4
    subject_names = [s['name'] for s in data]
    assert 'Python Programming' in subject_names
    assert 'Data Structures & Algorithms' in subject_names

def test_knowledge_gap_classification():
    assert KnowledgeGapEngine.classify_proficiency(85.0) == "Strong"
    assert KnowledgeGapEngine.classify_proficiency(72.0) == "Moderate"
    assert KnowledgeGapEngine.classify_proficiency(50.0) == "Weak"
    assert KnowledgeGapEngine.classify_proficiency(59.9) == "Weak"

def test_user_auth_flow(client):
    unique_email = f"student_test_{os.urandom(4).hex()}@example.com"
    # Register
    reg_resp = client.post('/api/auth/register', json={
        'name': 'Test Student',
        'email': unique_email,
        'password': 'password123',
        'education_level': 'Undergraduate',
        'interests': ['Python Programming']
    })
    assert reg_resp.status_code == 201
    token = reg_resp.get_json()['token']

    # Login
    login_resp = client.post('/api/auth/login', json={
        'email': unique_email,
        'password': 'password123'
    })
    assert login_resp.status_code == 200
    assert login_resp.get_json()['token'] == token

def test_assessment_flow_and_gap_adaptation(client):
    # 1. Generate assessment
    gen_resp = client.post('/api/assessment/generate', json={
        'subject_id': 1,
        'assessment_type': 'diagnostic',
        'difficulty': 'Medium',
        'count': 3
    }, headers={'Authorization': 'Bearer 1'})
    assert gen_resp.status_code == 200
    gen_data = gen_resp.get_json()
    assessment_id = gen_data['assessment_id']
    questions = gen_data['questions']
    assert len(questions) > 0

    # 2. Submit intentional wrong answers to test weak gap detection
    submission_answers = [{'question_id': q['id'], 'selected_answer': 'DefinitelyWrongAnswer'} for q in questions]
    sub_resp = client.post('/api/assessment/submit', json={
        'assessment_id': assessment_id,
        'answers': submission_answers
    }, headers={'Authorization': 'Bearer 1'})
    assert sub_resp.status_code == 200
    sub_data = sub_resp.get_json()
    assert sub_data['proficiency_level'] == 'Weak'
    assert sub_data['score_percentage'] == 0.0
    assert sub_data['gap_report']['is_gap'] is True

def test_roadmap_and_pdf_generation(client):
    # Generate roadmap for subject 1
    rm_resp = client.get('/api/roadmap/1', headers={'Authorization': 'Bearer 1'})
    assert rm_resp.status_code == 200
    roadmap_data = rm_resp.get_json()
    assert 'tasks' in roadmap_data
    assert len(roadmap_data['tasks']) > 0
    path_id = roadmap_data['id']

    # Toggle first task
    first_task = roadmap_data['tasks'][0]
    toggle_resp = client.post(f'/api/roadmap/task/{first_task["id"]}/toggle', headers={'Authorization': 'Bearer 1'})
    assert toggle_resp.status_code == 200
    assert toggle_resp.get_json()['new_status'] == 'completed'

    # Download PDF
    pdf_resp = client.get(f'/api/roadmap/{path_id}/download-pdf', headers={'Authorization': 'Bearer 1'})
    assert pdf_resp.status_code == 200
    assert pdf_resp.headers['Content-Type'] == 'application/pdf'
    assert len(pdf_resp.data) > 100

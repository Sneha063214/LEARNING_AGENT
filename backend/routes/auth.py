from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
import json
from database.db import get_db_connection

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

def get_current_user_id():
    auth_header = request.headers.get('Authorization', '')
    if auth_header.startswith('Bearer '):
        token = auth_header.split(' ')[1]
        try:
            return int(token)
        except ValueError:
            pass
    x_user_id = request.headers.get('X-User-Id')
    if x_user_id:
        try:
            return int(x_user_id)
        except ValueError:
            pass
    # Default to student user ID 1 for seamless development/testing
    return 1

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    name = data.get('name', '').strip()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '').strip()
    education_level = data.get('education_level', 'Undergraduate')
    interests = json.dumps(data.get('interests', []))
    learning_goals = data.get('learning_goals', '').strip()

    if not name or not email or not password:
        return jsonify({'error': 'Name, email, and password are required.'}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    existing = cursor.execute('SELECT id FROM users WHERE email = ?', (email,)).fetchone()
    if existing:
        conn.close()
        return jsonify({'error': 'An account with this email already exists.'}), 409

    pwd_hash = generate_password_hash(password)
    cursor.execute('''
        INSERT INTO users (name, email, password_hash, education_level, interests, learning_goals)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', (name, email, pwd_hash, education_level, interests, learning_goals))
    user_id = cursor.lastrowid
    conn.commit()
    conn.close()

    return jsonify({
        'message': 'Registration successful',
        'token': str(user_id),
        'user': {
            'id': user_id,
            'name': name,
            'email': email,
            'education_level': education_level,
            'interests': data.get('interests', []),
            'learning_goals': learning_goals
        }
    }), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()
    password = data.get('password', '').strip()

    if not email or not password:
        return jsonify({'error': 'Email and password are required.'}), 400

    conn = get_db_connection()
    user = conn.execute('SELECT * FROM users WHERE email = ?', (email,)).fetchone()
    conn.close()

    if not user or not check_password_hash(user['password_hash'], password):
        return jsonify({'error': 'Invalid email or password.'}), 401

    interests = []
    try:
        interests = json.loads(user['interests'])
    except Exception:
        pass

    return jsonify({
        'message': 'Login successful',
        'token': str(user['id']),
        'user': {
            'id': user['id'],
            'name': user['name'],
            'email': user['email'],
            'education_level': user['education_level'],
            'interests': interests,
            'learning_goals': user['learning_goals']
        }
    }), 200

@auth_bp.route('/profile', methods=['GET', 'PUT'])
def profile():
    user_id = get_current_user_id()
    conn = get_db_connection()
    cursor = conn.cursor()

    if request.method == 'PUT':
        data = request.get_json() or {}
        name = data.get('name')
        education_level = data.get('education_level')
        interests = json.dumps(data.get('interests', [])) if 'interests' in data else None
        learning_goals = data.get('learning_goals')

        cursor.execute('''
            UPDATE users
            SET name = COALESCE(?, name),
                education_level = COALESCE(?, education_level),
                interests = COALESCE(?, interests),
                learning_goals = COALESCE(?, learning_goals)
            WHERE id = ?
        ''', (name, education_level, interests, learning_goals, user_id))
        conn.commit()

    user = cursor.execute('SELECT * FROM users WHERE id = ?', (user_id,)).fetchone()
    
    # If no user exists yet, seed a default demo student
    if not user:
        cursor.execute('''
            INSERT INTO users (name, email, password_hash, education_level, interests, learning_goals)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', ('Sneha Sharma', 'sneha@learningagent.ai', generate_password_hash('password123'),
              'Undergraduate', json.dumps(['Python Programming', 'Machine Learning Foundations']),
              'Master AI/ML architectures and pass technical assessments.'))
        conn.commit()
        user = cursor.execute('SELECT * FROM users WHERE id = ?', (user_id,)).fetchone()

    conn.close()

    interests = []
    try:
        interests = json.loads(user['interests'])
    except Exception:
        pass

    return jsonify({
        'id': user['id'],
        'name': user['name'],
        'email': user['email'],
        'education_level': user['education_level'],
        'interests': interests,
        'learning_goals': user['learning_goals'],
        'created_at': user['created_at']
    })

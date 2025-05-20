"""
API routes for the Cricket Image Chatbot
"""

from flask import Blueprint, request, jsonify, session
import json
from typing import List, Tuple, Dict, Any
from langchain.docstore.document import Document

from llm_service import query_images
from auth import register_user, login_user, save_user_query, get_user_queries

# Create a Blueprint for the API routes
api = Blueprint('api', __name__)

@api.route('/api/login', methods=['POST'])
def login():
    """
    Login a user
    """
    data = request.json
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return jsonify({'success': False, 'message': 'Please fill in all fields'})
    
    success, message, user_data = login_user(email, password)
    
    if success:
        session['user'] = user_data
        session['is_authenticated'] = True
        return jsonify({'success': True, 'message': message, 'user': user_data})
    else:
        return jsonify({'success': False, 'message': message})

@api.route('/api/signup', methods=['POST'])
def signup():
    """
    Register a new user
    """
    data = request.json
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    
    if not name or not email or not password:
        return jsonify({'success': False, 'message': 'Please fill in all fields'})
    
    success, message = register_user(name, email, password)
    
    return jsonify({'success': success, 'message': message})

@api.route('/api/logout', methods=['POST'])
def logout():
    """
    Logout a user
    """
    session.pop('user', None)
    session.pop('is_authenticated', None)
    return jsonify({'success': True, 'message': 'Logged out successfully'})

@api.route('/api/query', methods=['POST'])
def process_query():
    """
    Process a query and return results
    """
    if not session.get('is_authenticated'):
        return jsonify({'success': False, 'message': 'Please log in to continue'})
    
    data = request.json
    query = data.get('query')
    force_similarity = data.get('force_similarity', False)
    
    if not query:
        return jsonify({'success': False, 'message': 'Please provide a query'})
    
    # Save the query to the user's history
    user_id = session['user']['id']
    save_user_query(user_id, query)
    
    # Process the query
    response_text, similar_images, used_similarity = query_images(query, force_similarity)
    
    # Convert documents to serializable format
    serializable_images = []
    for doc, score in similar_images:
        # Convert document to dict
        doc_dict = {
            'page_content': doc.page_content,
            'metadata': doc.metadata,
            'similarity_score': 1.0 - score  # Convert distance to similarity
        }
        serializable_images.append(doc_dict)
    
    return jsonify({
        'success': True,
        'response_text': response_text,
        'similar_images': serializable_images,
        'used_similarity': used_similarity
    })

@api.route('/api/user_queries', methods=['GET'])
def get_user_query_history():
    """
    Get a user's query history
    """
    if not session.get('is_authenticated'):
        return jsonify({'success': False, 'message': 'Please log in to continue'})
    
    user_id = session['user']['id']
    queries = get_user_queries(user_id)
    
    # Convert queries to serializable format
    serializable_queries = []
    for query, timestamp in queries:
        serializable_queries.append({
            'query': query,
            'timestamp': timestamp.strftime("%Y-%m-%d %H:%M")
        })
    
    return jsonify({
        'success': True,
        'queries': serializable_queries
    })

@api.route('/api/feedback', methods=['POST'])
def handle_feedback():
    """
    Handle user feedback on image relevance
    """
    if not session.get('is_authenticated'):
        return jsonify({'success': False, 'message': 'Please log in to continue'})
    
    data = request.json
    doc_id = data.get('doc_id')
    image_url = data.get('image_url')
    rating = data.get('rating')  # 1 for positive, -1 for negative
    query = data.get('query')
    
    if not doc_id or not image_url or not rating or not query:
        return jsonify({'success': False, 'message': 'Missing required parameters'})
    
    # Import here to avoid circular imports
    import db_store
    success = db_store.store_feedback(doc_id, query, image_url, rating)
    
    if success:
        return jsonify({'success': True, 'message': 'Feedback recorded successfully'})
    else:
        return jsonify({'success': False, 'message': 'Failed to record feedback'})

@api.route('/api/user', methods=['GET'])
def get_user():
    """
    Get the current user
    """
    if not session.get('is_authenticated'):
        return jsonify({'success': False, 'message': 'Not authenticated'})
    
    return jsonify({
        'success': True,
        'user': session['user']
    })

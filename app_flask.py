"""
Flask app for the Cricket Image Chatbot
"""

import os
from flask import Flask, render_template, redirect, url_for, session, request
from flask_session import Session
import nltk

import config
from vector_store import get_or_create_vector_store
from api.routes import api
from auth import initialize_auth_session_state

def ensure_nltk_resources():
    """Ensure all required NLTK resources are downloaded"""
    # List of required resources
    resources = [
        'punkt',
        'wordnet',
        'omw-1.4',  # Open Multilingual WordNet
        'averaged_perceptron_tagger'
    ]

    for resource in resources:
        try:
            # Check if resource exists
            if resource == 'punkt':
                nltk.data.find(f'tokenizers/{resource}')
            elif resource == 'wordnet' or resource == 'omw-1.4':
                nltk.data.find(f'corpora/{resource}')
            else:
                nltk.data.find(f'taggers/{resource}')
            print(f"NLTK resource '{resource}' is already available.")
        except LookupError:
            # Download if not found
            print(f"Downloading NLTK resource '{resource}'...")
            nltk.download(resource)
            print(f"Downloaded NLTK resource '{resource}'.")

def create_app():
    """Create and configure the Flask app"""
    app = Flask(__name__,
                static_folder='static',
                template_folder='templates')

    # Configure the app
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev_key_for_testing')
    app.config['SESSION_TYPE'] = 'filesystem'
    app.config['SESSION_PERMANENT'] = True

    # Initialize Flask-Session
    Session(app)

    # Register the API blueprint
    app.register_blueprint(api)

    # Initialize vector store
    get_or_create_vector_store()

    # Initialize session state before each request
    @app.before_request
    def before_request():
        # Initialize session state
        initialize_auth_session_state(session)

        # Clear session for login and signup routes
        if request.endpoint in ['login', 'signup']:
            session.clear()
            session['is_authenticated'] = False
            session['user'] = None

        # Protect dashboard route
        if request.endpoint == 'dashboard' and not session.get('is_authenticated'):
            return redirect(url_for('login'))

    # Define routes
    @app.route('/')
    def index():
        """Home page route"""
        # Always redirect to login page first
        return redirect(url_for('login'))

    @app.route('/login')
    def login():
        """Login page route"""
        if session.get('is_authenticated'):
            return redirect(url_for('dashboard'))
        return render_template('login.html')

    @app.route('/dashboard')
    def dashboard():
        """Dashboard page route"""
        if not session.get('is_authenticated'):
            return redirect(url_for('login'))
        return render_template('dashboard.html',
                              title=config.STREAMLIT_TITLE,
                              description=config.STREAMLIT_DESCRIPTION,
                              user=session.get('user'))

    @app.route('/signup')
    def signup():
        """Signup page route"""
        if session.get('is_authenticated'):
            return redirect(url_for('dashboard'))
        return render_template('login.html')

    return app

if __name__ == '__main__':
    # Ensure NLTK resources are available
    ensure_nltk_resources()

    # Create and run the app
    app = create_app()
    app.run(debug=True, port=8000)

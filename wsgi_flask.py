"""
WSGI entry point for the Flask app
"""

from app_flask import create_app, ensure_nltk_resources

# Ensure NLTK resources are available
ensure_nltk_resources()

# Create the Flask app
app = create_app()

if __name__ == "__main__":
    app.run()

"""
Simple app.py file to import and re-export the Flask app from wsgi_flask.py
This is needed because Render seems to be looking for app.py by default
"""

from app_flask import create_app, ensure_nltk_resources

# Ensure NLTK resources are available
ensure_nltk_resources()

# Create the Flask app
app = create_app()

# This is the application object that Gunicorn will use
if __name__ == "__main__":
    app.run()

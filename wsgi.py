"""
WSGI wrapper for Streamlit app on Render
"""

import os
import sys
import subprocess
import threading
import time
from wsgiref.simple_server import make_server

# Define the Flask app for Gunicorn to use
def simple_app(environ, start_response):
    """
    Simple WSGI app that returns a message about using Streamlit
    """
    status = '200 OK'
    headers = [('Content-type', 'text/plain; charset=utf-8')]
    start_response(status, headers)
    return [b"This is a Streamlit app, not a WSGI app. Please use 'streamlit run app.py' to run it."]

# Create a proper WSGI application object
app = simple_app

def run_streamlit():
    """Run the Streamlit app in a separate thread"""
    # First run the database setup script
    try:
        subprocess.run(["python", "scripts/setup_db_render.py"])
    except Exception as e:
        print(f"Error running database setup: {e}")

    # Download NLTK resources
    import nltk
    for resource in ['punkt', 'wordnet', 'omw-1.4', 'averaged_perceptron_tagger']:
        try:
            nltk.download(resource)
        except Exception as e:
            print(f"Error downloading NLTK resource {resource}: {e}")

    # Then run the Streamlit app
    port = int(os.environ.get("PORT", 8501))
    try:
        subprocess.run([
            "streamlit", "run", "app.py",
            "--server.port", str(port),
            "--server.address", "0.0.0.0",
            "--server.enableCORS", "false",
            "--server.enableXsrfProtection", "false"
        ])
    except Exception as e:
        print(f"Error running Streamlit: {e}")

# Start Streamlit in a separate thread when this module is imported
streamlit_thread = threading.Thread(target=run_streamlit)
streamlit_thread.daemon = True
streamlit_thread.start()

if __name__ == "__main__":
    # If this script is run directly, start the Streamlit app
    run_streamlit()

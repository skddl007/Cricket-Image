"""
WSGI wrapper for Streamlit app on Render
"""

import os
import sys
import subprocess

# Define the Flask app for Gunicorn to use
def app(environ, start_response):
    """
    Simple WSGI app that returns a message about using Streamlit
    """
    # This function won't actually be used because we'll redirect to Streamlit
    status = '200 OK'
    headers = [('Content-type', 'text/plain; charset=utf-8')]
    start_response(status, headers)
    return [b"This is a Streamlit app, not a WSGI app. Please use 'streamlit run app.py' to run it."]

if __name__ == "__main__":
    # If this script is run directly, start the Streamlit app
    # First run the database setup script
    subprocess.run(["python", "scripts/setup_db_render.py"])
    
    # Then run the Streamlit app
    # Get the port from the environment or use 8501 as default
    port = int(os.environ.get("PORT", 8501))
    subprocess.run(["streamlit", "run", "app.py", "--server.port", str(port), "--server.address", "0.0.0.0"])

"""
WSGI application for Gunicorn to use when deploying on Render
"""

# Define a simple WSGI application
def app(environ, start_response):
    """
    Simple WSGI app that returns a message about using Streamlit
    """
    status = '200 OK'
    headers = [('Content-type', 'text/plain; charset=utf-8')]
    start_response(status, headers)
    return [b"This is a Streamlit app running through Gunicorn. The Streamlit interface should be available soon."]

# This is the application object that Gunicorn will use
app = app

# Import the wsgi module to start Streamlit in a separate thread
import wsgi

# Deployment Guide for Cricket Image Chatbot

This guide explains how to deploy the Cricket Image Chatbot on Render.

## Deployment Architecture

The application uses a special deployment configuration for Render:

1. `app_gunicorn.py` - Contains the WSGI application object that Gunicorn uses
2. `wsgi.py` - Starts Streamlit in a separate thread
3. `scripts/setup_db_render.py` - Initializes the database and downloads NLTK resources

## Deployment Steps

1. Create a web service on Render:
   - Select Web Service as the service type
   - Connect your GitHub repository
   - Set the environment to Python
   - Set the build command to:
     ```
     pip install -r requirements.txt && python -m nltk.downloader punkt wordnet omw-1.4 averaged_perceptron_tagger
     ```
   - Set the start command to:
     ```
     gunicorn app_gunicorn:app --timeout 180 --log-level debug
     ```
   - Set the following environment variables:
     - `DB_NAME`: [your Aiven database name]
     - `DB_USER`: [your Aiven username]
     - `DB_PASSWORD`: [your Aiven password]
     - `DB_HOST`: [your Aiven host]
     - `DB_PORT`: [your Aiven port]
     - `GROQ_API_KEY`: [your Groq API key]
     - `PORT`: 10000

2. Wait for the deployment to complete and access your application

## Troubleshooting

### Gunicorn Can't Find App

If you see an error like `Failed to find attribute 'app' in 'app'`:

1. Make sure the `app_gunicorn.py` file correctly defines an `app` object
2. Verify that the Procfile contains the correct command: `web: gunicorn app_gunicorn:app --timeout 180 --log-level debug`
3. Check that the `PORT` environment variable is set to `10000` for Streamlit to work with Gunicorn

### Streamlit Not Starting

If Streamlit doesn't start properly:

1. Check the logs for any errors related to Streamlit
2. Verify that the `wsgi.py` file is correctly starting Streamlit in a separate thread
3. Make sure all NLTK resources are downloaded during the build process
4. Try increasing the Gunicorn timeout in the Procfile (e.g., `--timeout 240`)

### Database Connection Issues

If there are database connection issues:

1. Verify that the database credentials are correct in the environment variables
2. Check that the database is accessible from the Render service
3. Look for any errors in the logs related to database connections

## Deployment Files

The following files are used for deployment:

- `app_gunicorn.py` - WSGI application for Gunicorn
- `wsgi.py` - Starts Streamlit in a separate thread
- `Procfile` - Specifies the command to run on Render
- `render.yaml` - Configuration for Render deployment
- `scripts/setup_db_render.py` - Database setup script for Render

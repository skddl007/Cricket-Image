# Deploying the Cricket Image Chatbot on Render with Aiven PostgreSQL

This guide provides step-by-step instructions for deploying the Cricket Image Chatbot on Render using Aiven PostgreSQL as the database.

## Prerequisites

1. A Render account (https://render.com)
2. An Aiven account with a PostgreSQL database (https://aiven.io)
3. A Groq API key for the LLM service

## Setting Up Aiven PostgreSQL

1. Log in to your Aiven account
2. Create a new PostgreSQL service:
   - Choose a service name (e.g., `cricket-image-db`)
   - Select a cloud provider and region (preferably close to your Render region)
   - Choose a plan that fits your needs
   - Click "Create Service"

3. Once the service is created, go to the "Overview" tab and note down the following connection details:
   - Host
   - Port
   - Database name
   - Username
   - Password

4. Enable the pgvector extension:
   - Go to the "Databases" tab
   - Click on your database (usually "defaultdb")
   - Go to the "Extensions" tab
   - Find "vector" in the list and click "Enable"

## Deploying to Render

### Option 1: Using render.yaml (Recommended)

1. Fork or clone the repository to your GitHub account
2. Update the `render.yaml` file with your Aiven PostgreSQL credentials:
   ```yaml
   envVars:
     - key: DB_NAME
       value: your_database_name
     - key: DB_USER
       value: your_username
     - key: DB_PASSWORD
       value: your_password
     - key: DB_HOST
       value: your_host
     - key: DB_PORT
       value: your_port
   ```

3. Log in to Render and go to the Dashboard
4. Click "New" and select "Blueprint"
5. Connect your GitHub repository
6. Render will automatically detect the `render.yaml` file and set up the service
7. Click "Apply" to deploy the service

### Option 2: Manual Setup

1. Log in to Render and go to the Dashboard
2. Click "New" and select "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - Name: `cricket-image-chatbot`
   - Environment: `Python`
   - Region: Choose a region close to your Aiven PostgreSQL database
   - Branch: `main` (or your preferred branch)
   - Build Command: `pip install -r requirements.txt && python -m nltk.downloader punkt wordnet omw-1.4 averaged_perceptron_tagger`
   - Start Command: `python scripts/setup_db_render.py && streamlit run app.py`

5. Add the following environment variables:
   - `DB_NAME`: Your Aiven database name
   - `DB_USER`: Your Aiven username
   - `DB_PASSWORD`: Your Aiven password
   - `DB_HOST`: Your Aiven host
   - `DB_PORT`: Your Aiven port
   - `GROQ_API_KEY`: Your Groq API key
   - `PYTHONUNBUFFERED`: `true`

6. Click "Create Web Service" to deploy

## Verifying the Deployment

1. Once the deployment is complete, Render will provide a URL for your application
2. Open the URL in your browser
3. You should see the login page of the Cricket Image Chatbot
4. Create a new account or log in with an existing account
5. Test the chatbot by asking questions about cricket images

## Troubleshooting

### Database Connection Issues

If you encounter database connection issues:

1. Check the logs in Render to see the specific error message
2. Verify that your Aiven PostgreSQL credentials are correct
3. Ensure that the pgvector extension is enabled in your Aiven database
4. Check if your Aiven PostgreSQL service has IP allow-listing enabled, and if so, add Render's IP addresses to the allowed list

### Application Errors

If the application fails to start or encounters errors:

1. Check the logs in Render for error messages
2. Verify that all required environment variables are set correctly
3. Try redeploying the application

## Data Migration

If you need to migrate data from a local database to Aiven PostgreSQL:

1. Set up a local environment with the required dependencies
2. Update the `.env` file with your Aiven PostgreSQL credentials
3. Run the migration script:
   ```
   python scripts/migrate_to_aiven.py
   ```

## Maintenance

### Updating the Application

To update the application:

1. Push changes to your GitHub repository
2. Render will automatically detect the changes and redeploy the application

### Database Backups

Aiven PostgreSQL provides automatic backups. To create a manual backup:

1. Log in to your Aiven account
2. Go to your PostgreSQL service
3. Click on the "Backups" tab
4. Click "Create Backup"

## Support

If you encounter any issues with the deployment, please:

1. Check the documentation in the repository
2. Review the logs in Render and Aiven
3. Open an issue on the GitHub repository with detailed information about the problem

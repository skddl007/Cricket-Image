# Cricket Image Chatbot

A chatbot that allows users to search for cricket images based on natural language queries.

## Architecture

- **LangChain**: Framework for building the QA system
- **PostgreSQL**: Database for storing all data and vector embeddings
- **Groq API**: LLM backend for natural language understanding
- **HuggingFace Embeddings**: For converting text to vector embeddings
- **Flask**: Web framework for the backend API and frontend interface

## Project Structure

```
CSK/
├── api/                  # API routes
│   └── routes.py         # Flask API endpoints
├── static/               # Static files for Flask
│   ├── css/              # CSS stylesheets
│   └── js/               # JavaScript files
├── templates/            # HTML templates for Flask
│   ├── dashboard.html    # Dashboard template
│   └── login.html        # Login template
├── app_flask.py          # Flask application
├── auth.py               # Authentication system
├── build.sh              # Build script for Render deployment
├── config.py             # Configuration settings
├── data_processor.py     # CSV data processing (legacy)
├── db_store.py           # PostgreSQL database operations
├── groq_service.py       # Groq API integration
├── init_auth_tables.py   # Authentication tables initialization
├── init_db.py            # Database initialization script
├── llm_service.py        # LLM service integration
├── Procfile              # Procfile for Render deployment
├── query_refinement.py   # Query refinement for better search results
├── render.yaml           # Render deployment configuration
├── requirements.txt      # Python dependencies
├── runtime.txt           # Python version specification
├── vector_store.py       # Vector store management (PostgreSQL)
├── wsgi_flask.py         # WSGI entry point for Flask
├── data/                 # Directory for CSV data
│   ├── Action.csv        # Action reference data
│   ├── Event.csv         # Event reference data
│   ├── Mood.csv          # Mood reference data
│   ├── Players.csv       # Players reference data
│   ├── Sublocation.csv   # Sublocation reference data
│   └── finalTaggedData.csv  # Cricket image metadata
└── scripts/              # Utility scripts
    ├── init-pgvector.sql # SQL script to initialize pgvector
    └── setup_db_render.py # Database setup script for deployment
```

## Database Structure

The system uses PostgreSQL to store all data:

- **Reference Tables**:
  - `action`: Stores action types (bowling, batting, etc.)
  - `event`: Stores event types (practice, match, etc.)
  - `mood`: Stores mood types (casual, celebratory, etc.)
  - `players`: Stores player information
  - `sublocation`: Stores location types (practice nets, stadium, etc.)

- **Main Data Table**:
  - `cricket_data`: Stores all cricket image metadata with foreign keys to reference tables

- **Vector Store Tables**:
  - `documents`: Stores document content and metadata
  - `embeddings`: Stores vector embeddings for similarity search

## Vector Search Implementation

The system uses a sophisticated approach for vector similarity search:

1. **Rich Text Generation**: When creating embeddings, the system joins data from reference tables to create rich text descriptions that include human-readable names (e.g., "Player: Faf du Plessis" instead of just "player_id: p8").

2. **pgvector Extension**: The system attempts to use PostgreSQL's pgvector extension for efficient vector similarity search. If pgvector is not available, it falls back to standard array operations.

3. **Cosine Similarity**: Vector similarity is calculated using cosine similarity, which measures the cosine of the angle between two vectors, providing a measure of similarity regardless of vector magnitude.

## Local Setup

### Manual Setup

1. Ensure you have Python 3.9+ installed
2. Install the required packages:
   ```
   pip install -r requirements.txt
   ```
3. Set up PostgreSQL database:
   - Ensure PostgreSQL is installed and running
   - For optimal performance, install the pgvector extension:
     ```
     # Connect to PostgreSQL as superuser
     sudo -u postgres psql

     # Install the vector extension
     CREATE EXTENSION vector;

     # Exit PostgreSQL
     \q
     ```
   - Create a database named 'jsk1_data' (or update config.py with your database name)
   - Run the initialization script: `python init_db.py`
   - Initialize authentication tables: `python init_auth_tables.py`
4. Set your Groq API key as an environment variable:
   ```
   export GROQ_API_KEY=your_api_key_here
   ```
5. Run the application with:
   ```
   python wsgi_flask.py
   ```
   or
   ```
   flask run --app app_flask:create_app
   ```
6. Access the application at http://localhost:5000

## Deployment on Render with Aiven PostgreSQL

### Prerequisites

1. Create a [Render](https://render.com) account
2. Create an [Aiven](https://aiven.io) account for PostgreSQL database
3. Fork this repository to your GitHub account

### Setting Up Aiven PostgreSQL

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

### Blueprint Deployment (Recommended)

1. Update the `render.yaml` file with your Aiven PostgreSQL credentials:
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

2. Log in to your Render dashboard
3. Click "New" and select "Blueprint"
4. Connect your GitHub repository
5. Configure the environment variables:
   - `GROQ_API_KEY`: [your Groq API key]
   - `SECRET_KEY`: [a secure random string for Flask sessions]
6. Click "Apply" to deploy the application

The `render.yaml` file will automatically configure the web service running the Flask application.

### Manual Deployment

If you prefer to set up services manually on Render:

1. Create a web service:
   - Select Web Service as the service type
   - Connect your GitHub repository
   - Set the environment to Python
   - Set the build command to:
     ```
     ./build.sh
     ```
   - Set the start command to:
     ```
     gunicorn wsgi_flask:app --timeout 120 --log-level debug
     ```
   - Set the following environment variables:
     - `DB_NAME`: [your Aiven database name]
     - `DB_USER`: [your Aiven username]
     - `DB_PASSWORD`: [your Aiven password]
     - `DB_HOST`: [your Aiven host]
     - `DB_PORT`: [your Aiven port]
     - `GROQ_API_KEY`: [your Groq API key]
     - `SECRET_KEY`: [a secure random string for Flask sessions]
     - `PORT`: 10000

2. Wait for the deployment to complete and access your application

### Important Deployment Notes

The application uses a special deployment configuration for Render:

1. The `Procfile` specifies `gunicorn wsgi_flask:app --timeout 120` as the command to run
2. The `build.sh` script installs dependencies, downloads NLTK resources, and initializes the database
3. The `wsgi_flask.py` file contains a WSGI application that Flask uses
4. The `scripts/setup_db_render.py` script initializes the database and downloads NLTK resources

If you encounter deployment issues, check the following:

1. Make sure the `wsgi_flask.py` file correctly defines an `app` object that Gunicorn can use
2. Ensure all NLTK resources are downloaded during the build process
3. Verify that the database connection parameters are correct
4. Check the Render logs for any errors during startup

### Verifying the Deployment

After deployment, you can verify the database setup by running:

```
python verify_db.py
```

For more detailed deployment instructions, see [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md).

## API Usage

The Flask application provides the following endpoints:

### Web Routes
- `GET /`: Root endpoint (redirects to login)
- `GET /login`: Login page
- `GET /signup`: Signup page
- `GET /dashboard`: Main dashboard (requires authentication)

### API Endpoints
- `POST /api/login`: Login a user
- `POST /api/signup`: Register a new user
- `POST /api/logout`: Logout a user
- `POST /api/query`: Process a query and return results
- `GET /api/user_queries`: Get a user's query history
- `POST /api/feedback`: Handle user feedback on image relevance
- `GET /api/user`: Get the current user

## Example Queries

- "Show me images of players celebrating"
- "Find pictures of bowlers in action"
- "Show images from evening matches"
- "Find pictures with multiple players in the frame"
- "Show me close-up shots of batsmen"

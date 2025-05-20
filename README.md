# Cricket Image Chatbot

A chatbot that allows users to search for cricket images based on natural language queries.

## Architecture

- **LangChain**: Framework for building the QA system
- **PostgreSQL**: Database for storing all data and vector embeddings
- **Groq API**: LLM backend for natural language understanding
- **HuggingFace Embeddings**: For converting text to vector embeddings
- **Streamlit**: Web interface for the chatbot

## Project Structure

```
CSK/
├── app.py                # Streamlit web application
├── auth.py               # Authentication system
├── config.py             # Configuration settings
├── data_processor.py     # CSV data processing (legacy)
├── db_store.py           # PostgreSQL database operations
├── Dockerfile            # Docker configuration for web app
├── Dockerfile.postgres   # Docker configuration for PostgreSQL with pgvector
├── docker-compose.yml    # Docker Compose configuration for local development
├── groq_service.py       # Groq API integration
├── init_db.py            # Database initialization script
├── login.py              # Login page UI
├── query_refinement.py   # Query refinement for better search results
├── render.yaml           # Render deployment configuration
├── requirements.txt      # Python dependencies
├── runtime.txt           # Python version specification
├── vector_store.py       # Vector store management (PostgreSQL)
├── data/                 # Directory for CSV data
│   ├── Action.csv        # Action reference data
│   ├── Event.csv         # Event reference data
│   ├── Mood.csv          # Mood reference data
│   ├── Players.csv       # Players reference data
│   ├── Sublocation.csv   # Sublocation reference data
│   └── finalTaggedData.csv  # Cricket image metadata
├── scripts/              # Utility scripts
│   ├── init-pgvector.sql # SQL script to initialize pgvector
│   └── setup_db.py       # Database setup script for deployment
└── cache/                # Cache directory
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

### Option 1: Manual Setup

1. Ensure you have Python 3.12+ installed
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
4. Set your Groq API key as an environment variable:
   ```
   export GROQ_API_KEY=your_api_key_here
   ```
5. Run the application with:
   ```
   streamlit run app.py
   ```

### Option 2: Docker Setup (Recommended)

1. Ensure you have Docker and Docker Compose installed
2. Create a `.env` file based on `.env.sample` with your configuration
3. Build and start the containers:
   ```
   docker-compose up --build
   ```
4. Access the application at http://localhost:8501

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

### Option 1: Blueprint Deployment (Recommended)

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
6. Click "Apply" to deploy the application

The `render.yaml` file will automatically configure the web service running the Streamlit application.

### Option 2: Manual Deployment

If you prefer to set up services manually on Render:

1. Create a web service:
   - Select Web Service as the service type
   - Connect your GitHub repository
   - Set the environment to Python
   - Set the build command to:
     ```
     pip install -r requirements.txt && python -m nltk.downloader punkt wordnet omw-1.4 averaged_perceptron_tagger
     ```
   - Set the start command to:
     ```
     gunicorn wsgi:app --timeout 120 --log-level debug
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

### Important Deployment Notes

The application uses a special deployment configuration for Render:

1. The `Procfile` specifies `gunicorn wsgi:app --timeout 120` as the command to run
2. The `wsgi.py` file contains a WSGI application that starts Streamlit in a separate thread
3. The `scripts/setup_db_render.py` script initializes the database and downloads NLTK resources
4. The `start.py` script can be used to run the application locally in the same way it runs on Render

If you encounter deployment issues, check the following:

1. Make sure the `wsgi.py` file correctly defines an `app` object that Gunicorn can use
2. Ensure all NLTK resources are downloaded during the build process
3. Verify that the database connection parameters are correct
4. Check the Render logs for any errors during startup

### Verifying the Deployment

After deployment, you can verify the database setup by running:

```
python scripts/verify_aiven_db.py
```

For more detailed deployment instructions, see [RENDER_DEPLOYMENT.md](RENDER_DEPLOYMENT.md).

## Usage

1. Enter a natural language query about cricket images
2. The system will retrieve relevant images based on your query
3. Results will display image links along with descriptions

## Example Queries

- "Show me images of players celebrating"
- "Find pictures of bowlers in action"
- "Show images from evening matches"
- "Find pictures with multiple players in the frame"
- "Show me close-up shots of batsmen"

#!/bin/bash
set -e

echo "Starting build process for Flask backend..."

# Install system dependencies
echo "Installing system dependencies..."
apt-get update
apt-get install -y build-essential libpq-dev

# Install Python dependencies
echo "Installing Python dependencies..."
pip install --no-cache-dir -r requirements.txt

# Download NLTK data
echo "Downloading NLTK resources..."
python -c "import nltk; nltk.download('punkt'); nltk.download('wordnet'); nltk.download('omw-1.4'); nltk.download('averaged_perceptron_tagger')"

# Run database setup script if it exists
if [ -f "scripts/setup_db_render.py" ]; then
    echo "Setting up database..."
    python scripts/setup_db_render.py
fi

# Initialize auth tables
echo "Initializing authentication tables..."
python init_auth_tables.py

echo "Build process completed successfully!"

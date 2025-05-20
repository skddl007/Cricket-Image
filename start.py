"""
Entry point script for the Cricket Image Chatbot
"""

import os
import sys
import subprocess
import nltk

def download_nltk_resources():
    """Download required NLTK resources"""
    print("Downloading NLTK resources...")
    resources = [
        'punkt',
        'wordnet',
        'omw-1.4',
        'averaged_perceptron_tagger'
    ]
    
    for resource in resources:
        try:
            print(f"Downloading NLTK resource '{resource}'...")
            nltk.download(resource)
            print(f"Downloaded NLTK resource '{resource}'.")
        except Exception as e:
            print(f"Error downloading NLTK resource '{resource}': {e}")

def setup_database():
    """Set up the database"""
    try:
        print("Setting up database...")
        # Try to run the database setup script
        subprocess.run([sys.executable, "scripts/setup_db_render.py"])
        print("Database setup complete")
    except Exception as e:
        print(f"Error setting up database: {e}")
        print("Continuing anyway...")

def run_streamlit():
    """Run the Streamlit app"""
    print("Starting Streamlit app...")
    port = int(os.environ.get("PORT", 8501))
    subprocess.run([
        "streamlit", "run", "app.py", 
        "--server.port", str(port), 
        "--server.address", "0.0.0.0"
    ])

def main():
    """Main function"""
    # Download NLTK resources
    download_nltk_resources()
    
    # Set up the database
    setup_database()
    
    # Run the Streamlit app
    run_streamlit()

if __name__ == "__main__":
    main()

"""
Main script to run the Cricket Image Chatbot
"""

import os
import argparse
import subprocess
from pathlib import Path

def run_streamlit():
    """Run the Streamlit app"""
    subprocess.run(["streamlit", "run", "app.py"])

def setup_environment():
    """Set up the environment for the chatbot"""
    # Create cache directory if it doesn't exist
    cache_dir = Path("cache")
    os.makedirs(cache_dir, exist_ok=True)

    # Check if data directory exists
    data_dir = Path("data")
    if not data_dir.exists():
        print("Error: Data directory not found. Please create a 'data' directory with your CSV file.")
        return False

    # Check if CSV file exists
    csv_file = data_dir / "finalTaggedData.csv"
    if not csv_file.exists():
        print(f"Error: CSV file not found at {csv_file}. Please add your CSV file to the data directory.")
        return False

    return True

def initialize_database():
    """Initialize the PostgreSQL database"""
    print("Initializing PostgreSQL database...")
    try:
        # Import here to avoid circular imports
        import init_db
        init_db.main()

        # Create users table
        print("Creating users table...")
        import create_users_table
        create_users_table.create_users_table()

        return True
    except Exception as e:
        print(f"Error initializing database: {str(e)}")
        print("You may need to run 'python init_db.py' and 'python create_users_table.py' manually.")
        return False

def main():
    """Main function"""
    parser = argparse.ArgumentParser(description="Run the Cricket Image Chatbot")
    parser.add_argument("--setup-only", action="store_true", help="Only set up the environment, don't run the app")
    parser.add_argument("--init-db", action="store_true", help="Initialize the PostgreSQL database")
    args = parser.parse_args()

    # Set up the environment
    if not setup_environment():
        return

    # Initialize database if requested
    if args.init_db:
        if not initialize_database():
            return

    # Run the app if not setup-only
    if not args.setup_only:
        run_streamlit()

if __name__ == "__main__":
    main()

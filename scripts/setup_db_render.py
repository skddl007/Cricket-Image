"""
Script to initialize the database for Render deployment
"""

import os
import sys
import time
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

# Add parent directory to path to import modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import config
from init_db import create_database_if_not_exists, initialize_tables_and_data

def setup_pgvector():
    """
    Set up pgvector extension in the database
    """
    try:
        conn = psycopg2.connect(
            dbname=config.DB_NAME,
            user=config.DB_USER,
            password=config.DB_PASSWORD,
            host=config.DB_HOST,
            port=config.DB_PORT
        )
        cursor = conn.cursor()
        
        # Create pgvector extension
        cursor.execute("CREATE EXTENSION IF NOT EXISTS vector")
        
        conn.commit()
        cursor.close()
        conn.close()
        
        print("pgvector extension created successfully")
    except Exception as e:
        print(f"Error setting up pgvector: {e}")
        raise

def create_users_table():
    """
    Create the users and user_queries tables if they don't exist
    """
    try:
        conn = psycopg2.connect(
            dbname=config.DB_NAME,
            user=config.DB_USER,
            password=config.DB_PASSWORD,
            host=config.DB_HOST,
            port=config.DB_PORT
        )
        cursor = conn.cursor()
        
        # Create users table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            password VARCHAR(64) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """)
        
        # Create user_queries table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS user_queries (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            query TEXT NOT NULL,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """)
        
        conn.commit()
        cursor.close()
        conn.close()
        
        print("Users and user_queries tables created successfully")
    except Exception as e:
        print(f"Error creating users tables: {e}")
        raise

def main():
    """
    Main function to set up the database
    """
    print("Starting database setup for Render deployment...")
    
    # Set up pgvector extension
    setup_pgvector()
    
    # Initialize tables and data
    initialize_tables_and_data()
    
    # Create users tables
    create_users_table()
    
    print("Database setup for Render deployment complete!")

if __name__ == "__main__":
    main()

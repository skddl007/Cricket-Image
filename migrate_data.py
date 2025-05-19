"""
Script to migrate data to the new PostgreSQL database for the Cricket Image Chatbot
"""

import os
import time
import psycopg2
import pandas as pd
from typing import List

import config
import db_store
from vector_store import get_embeddings_model
from langchain.docstore.document import Document

def migrate_data():
    """
    Migrate data to the new database
    """
    print(f"Starting data migration to '{config.DB_NAME}'...")
    
    # Step 1: Create tables
    print("Creating database tables...")
    db_store.create_tables()
    print("Database tables created successfully.")
    
    # Step 2: Load reference data
    print("Loading reference data from CSV files...")
    try:
        db_store.load_all_reference_data()
        print("Reference data loaded successfully.")
    except Exception as e:
        print(f"Error loading reference data: {e}")
        raise
    
    # Step 3: Generate documents from database
    print("Generating documents from database...")
    try:
        documents = db_store.generate_documents_from_db()
        print(f"Generated {len(documents)} documents.")
    except Exception as e:
        print(f"Error generating documents: {e}")
        raise
    
    # Step 4: Generate embeddings and store in database
    print("Generating embeddings and storing in database...")
    try:
        # Get embeddings model
        embeddings_model = get_embeddings_model()
        
        # Generate embeddings for documents
        texts = [doc.page_content for doc in documents]
        print(f"Generating embeddings for {len(texts)} documents...")
        
        # Process in batches to avoid memory issues
        batch_size = 100
        all_embeddings = []
        
        for i in range(0, len(texts), batch_size):
            batch_texts = texts[i:i+batch_size]
            print(f"Processing batch {i//batch_size + 1}/{(len(texts) + batch_size - 1)//batch_size}...")
            batch_embeddings = embeddings_model.embed_documents(batch_texts)
            all_embeddings.extend(batch_embeddings)
            # Small delay to avoid overwhelming the system
            time.sleep(0.1)
        
        # Store documents and embeddings in database
        print("Storing documents and embeddings in database...")
        db_store.insert_documents(documents, all_embeddings)
        print("Documents and embeddings stored successfully.")
    except Exception as e:
        print(f"Error generating and storing embeddings: {e}")
        raise
    
    print("Data migration complete!")

def check_migration():
    """
    Check that the migration was successful
    """
    print("Checking migration results...")
    
    # Connect to the database
    conn = db_store.get_db_connection()
    cursor = conn.cursor()
    
    # Check tables and row counts
    tables = [
        "players",
        "action",
        "event",
        "mood",
        "sublocation",
        "cricket_data",
        "documents",
        "embeddings"
    ]
    
    for table in tables:
        cursor.execute(f"SELECT COUNT(*) FROM {table}")
        count = cursor.fetchone()[0]
        print(f"Table '{table}' has {count} rows.")
    
    # Close connection
    cursor.close()
    conn.close()
    
    print("Migration check complete.")

def main():
    """
    Main function
    """
    try:
        # Migrate data
        migrate_data()
        
        # Check migration
        check_migration()
        
        print("Migration completed successfully!")
    except Exception as e:
        print(f"Error during migration: {e}")
        print("Migration failed.")

if __name__ == "__main__":
    main()

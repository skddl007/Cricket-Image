"""
Configuration settings for the Cricket Image Chatbot
"""

import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from .env file if it exists
load_dotenv()

# Base paths
BASE_DIR = Path(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = BASE_DIR / "data"
CACHE_DIR = BASE_DIR / "cache"

# Data files
CSV_FILE = DATA_DIR / "finalTaggedData.csv"

# Embedding model
EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"

# PostgreSQL database settings
DB_NAME = os.environ.get("DB_NAME", "jsk1_data")
DB_USER = os.environ.get("DB_USER", "postgres")
DB_PASSWORD = os.environ.get("DB_PASSWORD", "Skd6397@@")
DB_HOST = os.environ.get("DB_HOST", "localhost")
DB_PORT = os.environ.get("DB_PORT", "5432")

# LLaMA API settings (deprecated)
LLAMA_API_URL = "https://api.llama-api.com"  # Base URL without version path
LLAMA_API_KEY = os.environ.get("LLAMA_API_KEY", "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")  # API key as fallback if not in environment

# Groq API settings
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"  # OpenAI-compatible endpoint
GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "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")  # API key as fallback if not in environment
GROQ_MODEL = "llama-3.3-70b-versatile"  # Default model to use

# Streamlit settings
STREAMLIT_TITLE = "Joburg Super Kings Image Finder"
STREAMLIT_DESCRIPTION = "Ask questions about Joburg Super Kings cricket images and get relevant image links."

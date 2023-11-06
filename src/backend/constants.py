import os

DB_HOST = os.environ.get('DB_HOST', "") or 'localhost'
UVICORN_HOST = os.environ.get("UVICORN_HOST","") or "127.0.0.1"
AZURE_OPENAI_API_INSTANCE_NAME=os.environ.get("AZURE_OPENAI_API_INSTANCE_NAME","")
AZURE_OPENAI_API_KEY=os.environ.get("AZURE_OPENAI_API_KEY", "")
AZURE_OPENAI_API_DEPLOYMENT_NAME="gpt-35-turbo-16k"
AZURE_OPENAI_API_VERSION="2023-06-01-preview"
import os
DB_HOST = os.environ.get('DB_HOST', "") or 'localhost'
UVICORN_HOST = os.environ.get("UVICORN_HOST","") or "127.0.0.1"

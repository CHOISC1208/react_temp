web: uvicorn app.main:app --host 0.0.0.0 --port $PORT
release: python backend/scripts/migrate.py && python backend/scripts/seed.py

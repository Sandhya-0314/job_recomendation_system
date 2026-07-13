import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base

# Load environment variables from .env file
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL is missing")

if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# Remove custom 'supa' query parameter which is rejected by psycopg2
if "supa=" in DATABASE_URL:
    from urllib.parse import urlparse, parse_qsl, urlencode, urlunparse
    parsed = urlparse(DATABASE_URL)
    query = dict(parse_qsl(parsed.query))
    if "supa" in query:
        del query["supa"]
    parsed = parsed._replace(query=urlencode(query))
    DATABASE_URL = urlunparse(parsed)

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=1800
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
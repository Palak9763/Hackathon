from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base

DATABASE_URL = "sqlite:///backend/health_data.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def init_db():
    try:
        with open("backend/health_data.db", 'a'):
            pass
    except IOError:
        print("Could not create database file.")
    
    from . import models
    Base.metadata.create_all(bind=engine)
    print("Database initialization complete.")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

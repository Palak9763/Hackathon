from sqlalchemy import Column, Integer, Float, String, DateTime, Text, Boolean
from datetime import datetime
from .database import Base

class HealthLog(Base):
    __tablename__ = "health_logs"
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    heart_rate = Column(Float)
    breathing_rate = Column(Float)
    stress_level = Column(Float)
    emotion = Column(String(50))
    blink_rate = Column(Float)
    posture_score = Column(Float)
    
class SymptomLog(Base):
    __tablename__ = "symptom_logs"
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    symptoms = Column(Text) 
    language = Column(String(10))
    suggestions = Column(Text) 
    
class ContactMessage(Base):
    __tablename__ = "contact_messages"
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    name = Column(String(100))
    email = Column(String(200))
    message = Column(Text)

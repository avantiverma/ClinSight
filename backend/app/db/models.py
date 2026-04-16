import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, JSON, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.db.session import Base

class Doctor(Base):
    __tablename__ = "doctors"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    username = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    role = Column(String, nullable=False, default="doctor") # doctor or admin
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)

    patients = relationship("Patient", back_populates="doctor")

class Patient(Base):
    __tablename__ = "patients"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4())) # System-generated unique ID
    name = Column(String, index=True, nullable=False)
    age = Column(Integer, nullable=False)
    gender = Column(String, nullable=False) # Male, Female, Other
    phone = Column(String, nullable=True)
    admission_date = Column(DateTime, nullable=False, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)
    clinical_notes = Column(String, default="")
    
    doctor_id = Column(String, ForeignKey("doctors.id"), nullable=False)
    
    doctor = relationship("Doctor", back_populates="patients")
    predictions = relationship("PredictionHistory", back_populates="patient")

class PredictionHistory(Base):
    __tablename__ = "prediction_history"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    patient_id = Column(String, ForeignKey("patients.id"), nullable=False)
    model_type = Column(String, nullable=False) # "ICU" or "LOS"
    input_data = Column(JSON, nullable=False)
    prediction_result = Column(JSON, nullable=False) # Store proba, shap values
    timestamp = Column(DateTime, default=datetime.utcnow)
    doctor_id = Column(String, ForeignKey("doctors.id"), nullable=True)

    patient = relationship("Patient", back_populates="predictions")
    doctor = relationship("Doctor")

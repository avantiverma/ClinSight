from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import Patient, PredictionHistory, Doctor
from app.schemas import PatientCreate, PatientResponse, HistoryResponse, PatientSummaryResponse, PatientNotesUpdate
from app.api.auth import get_current_active_doctor

router = APIRouter()

@router.post("/", response_model=PatientResponse)
def create_patient(
    patient: PatientCreate, 
    db: Session = Depends(get_db),
    current_user: Doctor = Depends(get_current_active_doctor)
):
    db_patient = Patient(
        name=patient.name,
        age=patient.age,
        gender=patient.gender,
        phone=patient.phone,
        admission_date=patient.admission_date,
        doctor_id=current_user.id
    )
    db.add(db_patient)
    db.commit()
    db.refresh(db_patient)
    return db_patient

@router.get("/mine", response_model=List[PatientSummaryResponse])
def read_my_patients(
    db: Session = Depends(get_db),
    current_user: Doctor = Depends(get_current_active_doctor)
):
    # Fetch all patients for this doctor
    patients = db.query(Patient).filter(Patient.doctor_id == current_user.id).order_by(Patient.admission_date.desc()).all()
    
    result = []
    for p in patients:
        # We need PatientSummaryResponse which is basically a PatientResponse
        # plus latest_icu_prediction and latest_los_prediction
        p_dict = {
            "id": p.id,
            "name": p.name,
            "age": p.age,
            "gender": p.gender,
            "phone": p.phone,
            "admission_date": p.admission_date,
            "created_at": p.created_at,
            "doctor_id": p.doctor_id,
            "latest_icu_prediction": None,
            "latest_los_prediction": None
        }
        
        # Find latest ICU prediction
        latest_icu = db.query(PredictionHistory).filter(
            PredictionHistory.patient_id == p.id,
            PredictionHistory.model_type == "ICU"
        ).order_by(PredictionHistory.timestamp.desc()).first()
        
        if latest_icu:
            p_dict["latest_icu_prediction"] = latest_icu.prediction_result
            
        # Find latest LOS prediction (can be 'LOS' or 'LOS-PIPELINE')
        latest_los = db.query(PredictionHistory).filter(
            PredictionHistory.patient_id == p.id,
            PredictionHistory.model_type.in_(["LOS", "LOS-PIPELINE"])
        ).order_by(PredictionHistory.timestamp.desc()).first()
        
        if latest_los:
            p_dict["latest_los_prediction"] = latest_los.prediction_result
            
        result.append(p_dict)
        
    return result

@router.get("/")
def read_patients(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(Patient).offset(skip).limit(limit).all()

@router.get("/{patient_id}/history", response_model=List[HistoryResponse])
def read_patient_history(patient_id: str, db: Session = Depends(get_db)):
    history = db.query(PredictionHistory).filter(PredictionHistory.patient_id == patient_id).all()
    if not history:
        return [] # Return empty list if no history
    return history

@router.get("/{patient_id}", response_model=PatientResponse)
def read_patient(patient_id: str, db: Session = Depends(get_db)):
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return patient

@router.put("/{patient_id}/notes", response_model=PatientResponse)
def update_patient_notes(
    patient_id: str, 
    notes_update: PatientNotesUpdate,
    db: Session = Depends(get_db),
    current_user: Doctor = Depends(get_current_active_doctor)
):
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
        
    patient.clinical_notes = notes_update.clinical_notes
    db.commit()
    db.refresh(patient)
    return patient

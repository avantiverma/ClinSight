from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import PredictionHistory, Patient, Doctor
from app.api.auth import get_current_active_doctor
from app.schemas import ICUInput, LOSInput, PredictionResponse
from app.services.ml_service import ml_service
from app.services.similarity_service import find_similar_cases
from app.services.llm_service import generate_clinical_summary
from datetime import datetime


router = APIRouter()

@router.post("/icu/{patient_id}", response_model=PredictionResponse)
async def predict_icu(
    patient_id: str,
    input_data: ICUInput,
    db: Session = Depends(get_db),
    current_doctor: Doctor = Depends(get_current_active_doctor)
):
    # 1. Verify Patient Exists
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    # 2. Run Inference
    result = await ml_service.predict_icu(input_data.dict())

    # 3. Save History
    history = PredictionHistory(
        patient_id=patient_id,
        model_type="ICU",
        input_data=input_data.dict(), # Store dict directly
        prediction_result=result, # Store dict directly
        doctor_id=current_doctor.id
    )
    
    db.add(history)
    db.commit()
    db.refresh(history)

    # 4. Find Similar Cases
    similar_cases = find_similar_cases(input_data.dict(), "ICU", db, exclude_patient_id=patient_id, n_neighbors=3)
    result["similar_cases"] = [case.dict() for case in similar_cases]

    # Generate Clinical Summary and Append to Notes
    new_summary = generate_clinical_summary(input_data.dict(), {"probability": result["probability"], "top_features": result["top_features"]}, "ICU Risk")
    timestamp_str = datetime.now().strftime("%b %d, %Y - %I:%M %p")
    
    append_text = f"\n\n### ICU Assessment - {timestamp_str}\n{new_summary}"
    
    if patient.clinical_notes:
        patient.clinical_notes += append_text
    else:
        patient.clinical_notes = append_text.strip()
    
    db.commit()

    return result

@router.post("/los-pipeline/{patient_id}", response_model=PredictionResponse)
async def predict_los_pipeline(
    patient_id: str,
    input_data: LOSInput,
    db: Session = Depends(get_db),
    current_doctor: Doctor = Depends(get_current_active_doctor)
):
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    result = await ml_service.predict_los_pipeline(input_data.dict())

    # Optional: Save history like the others, tracking it as a different model type
    history = PredictionHistory(
        patient_id=patient_id,
        model_type="LOS-PIPELINE",
        input_data=input_data.dict(),
        prediction_result=result,
        doctor_id=current_doctor.id
    )
    
    db.add(history)
    db.commit()
    db.refresh(history)

    # 4. Find Similar Cases
    similar_cases = find_similar_cases(input_data.dict(), "LOS-PIPELINE", db, exclude_patient_id=patient_id, n_neighbors=3)
    result["similar_cases"] = [case.dict() for case in similar_cases]

    # Generate Clinical Summary and Append to Notes
    new_summary = generate_clinical_summary(input_data.dict(), {"probability": result["probability"], "top_features": result["top_features"]}, "Length of Stay Risk")
    timestamp_str = datetime.now().strftime("%b %d, %Y - %I:%M %p")
    
    append_text = f"\n\n### LOS Assessment - {timestamp_str}\n{new_summary}"
    
    if patient.clinical_notes:
        patient.clinical_notes += append_text
    else:
        patient.clinical_notes = append_text.strip()
    
    db.commit()

    return result

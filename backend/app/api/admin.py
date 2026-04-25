from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.db.session import get_db
from app.db.models import Doctor, Patient
from app.api.auth import get_current_active_doctor
from app.schemas import AdminDashboardResponse, AdminDoctorSummary, AdminPatientSummary

router = APIRouter()

@router.get("/doctors", response_model=AdminDashboardResponse)
def get_admin_dashboard_data(
    db: Session = Depends(get_db),
    current_admin: Doctor = Depends(get_current_active_doctor)
):
    # Ensure only admins can access this
    if current_admin.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Admin role required."
        )

    # Get all doctors (excluding admin if necessary, but here we include all with role 'doctor')
    doctors = db.query(Doctor).filter(Doctor.role == "doctor").all()
    
    doctor_summaries = []
    for doc in doctors:
        patient_count = len(doc.patients)
        patient_list = [
            AdminPatientSummary(
                id=p.id,
                name=p.name,
                age=p.age,
                gender=p.gender,
                admission_date=p.admission_date
            ) for p in doc.patients
        ]
        
        doctor_summaries.append(
            AdminDoctorSummary(
                id=doc.id,
                name=doc.name,
                username=doc.username,
                role=doc.role,
                patient_count=patient_count,
                patients=patient_list
            )
        )

    return AdminDashboardResponse(
        total_doctors=len(doctor_summaries),
        doctors=doctor_summaries
    )

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime

# Input Schemas
class ICUInput(BaseModel):
    # 15 Research Features
    # 15 Research Features
    cline1: int = Field(..., description="Presence of Central Line (0/1)")
    aline1: int = Field(..., description="Presence of Arterial Line (0/1)")
    asa: int = Field(..., description="ASA Physical Status (1-6)")
    intraop_rocu: float = Field(..., description="Intraoperative Rocuronium")
    ane_duration_min: float = Field(..., description="Anesthesia Duration in minutes")
    iv2: int = Field(..., description="Two IV lines (0/1)")
    optype_Colorectal: int = Field(..., description="Colorectal Surgery (0/1)")
    intraop_ca: float = Field(..., description="Intraoperative Calcium")
    tubesize: float = Field(..., description="Endotracheal Tube Size")
    intraop_ppf: float = Field(..., description="Intraoperative Propofol")
    preop_alb: float = Field(..., description="Preoperative Albumin")
    op_duration_min: float = Field(..., description="Operation Duration in minutes")
    age: int = Field(..., ge=0, le=120, description="Patient Age")
    intraop_uo: float = Field(..., description="Intraoperative Urine Output")
    intraop_ebl: float = Field(..., description="Estimated Blood Loss")

class LOSInput(BaseModel):
    # 10 Research Features
    # 10 Research Features
    op_duration_min: float = Field(..., description="Operation Duration in minutes")
    intraop_rocu: float = Field(..., description="Intraoperative Rocuronium")
    optype_Colorectal: int = Field(..., description="Colorectal Surgery (0/1)")
    optype_Vascular: int = Field(..., description="Vascular Surgery (0/1)")
    aline1: int = Field(..., description="Presence of Arterial Line (0/1)")
    preop_alb: float = Field(..., description="Preoperative Albumin")
    intraop_crystalloid: float = Field(..., description="Intraoperative Crystalloids")
    intraop_uo: float = Field(..., description="Intraoperative Urine Output")
    cormack_Easy: int = Field(..., description="Cormack Lehane Easy (0/1)")
    optype_Stomach: int = Field(..., description="Stomach Surgery (0/1)")

# Response Schemas
# Response Schemas
class TopFeature(BaseModel):
    feature: str
    contribution: float

class SimilarCase(BaseModel):
    patient_name: str
    age: int
    gender: str
    similarity_score: float # e.g., 95.5 for 95.5% match
    predicted_risk: float

class PredictionResponse(BaseModel):
    probability: float
    top_features: List[TopFeature]
    similar_cases: Optional[List[SimilarCase]] = None
    prediction_time: Optional[float] = None

# Patient Schemas
class PatientCreate(BaseModel):
    name: str = Field(..., min_length=1)
    age: int = Field(..., ge=0, le=120)
    gender: str = Field(..., description="Male, Female, or Other")
    phone: Optional[str] = None
    admission_date: datetime

class PatientNotesUpdate(BaseModel):
    clinical_notes: str

class PatientResponse(BaseModel):
    id: str
    name: str
    age: int
    gender: str
    phone: Optional[str]
    admission_date: datetime
    created_at: datetime
    doctor_id: str
    clinical_notes: Optional[str] = None
    class Config:
        from_attributes = True

class PatientSummaryResponse(PatientResponse):
    latest_icu_prediction: Optional[Dict[str, Any]] = None
    latest_los_prediction: Optional[Dict[str, Any]] = None
    
    class Config:
        from_attributes = True

class HistoryResponse(BaseModel):
    id: str
    model_type: str
    input_data: Dict[str, Any]
    prediction_result: Dict[str, Any]
    timestamp: datetime
    
    class Config:
        from_attributes = True
        protected_namespaces = () # Silence Pydantic V2 warning for model_type field

# Doctor/Auth Schemas
class DoctorCreate(BaseModel):
    name: str = Field(..., min_length=2)
    email: str = Field(...,  description="Email address used as username")
    password: str = Field(..., min_length=6)
    role: str = Field(..., description="doctor or admin")

class DoctorResponse(BaseModel):
    id: str
    name: str
    username: str
    role: str
    is_active: bool
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    name: str

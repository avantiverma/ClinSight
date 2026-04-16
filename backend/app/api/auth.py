from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import get_db
from app.db.models import Doctor
from app.schemas import DoctorCreate, DoctorResponse, Token
from app.services.auth_service import verify_password, create_access_token, get_password_hash

router = APIRouter()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

async def get_current_doctor(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        from jose import jwt, JWTError
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    doctor = db.query(Doctor).filter(Doctor.username == username).first()
    if doctor is None:
        raise credentials_exception
    return doctor

async def get_current_active_doctor(current_doctor: Doctor = Depends(get_current_doctor)):
    if not current_doctor.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_doctor

@router.post("/register", response_model=DoctorResponse)
def register(doctor_in: DoctorCreate, db: Session = Depends(get_db)):
    # Check if user already exists
    user = db.query(Doctor).filter(Doctor.username == doctor_in.email).first()
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system.",
        )
    
    # Create new doctor
    db_doctor = Doctor(
        username=doctor_in.email,
        name=doctor_in.name,
        role=doctor_in.role,
        hashed_password=get_password_hash(doctor_in.password),
        is_active=True
    )
    db.add(db_doctor)
    db.commit()
    db.refresh(db_doctor)
    return db_doctor

@router.post("/login", response_model=Token)
def login_access_token(db: Session = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()):
    # In a real app, query the doctor from DB.
    doctor = db.query(Doctor).filter(Doctor.username == form_data.username).first()
    
    # Mocking a default user if none exists for testing flow
    if not doctor and form_data.username == "admin" and form_data.password == "admin":
        return {
            "access_token": create_access_token(
                data={"sub": "admin"}, 
                expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
            ),
            "token_type": "bearer",
            "role": "admin",
            "name": "System Administrator"
        }
    elif not doctor or not verify_password(form_data.password, doctor.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": doctor.username}, expires_delta=access_token_expires
    )
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "role": doctor.role,
        "name": doctor.name
    }

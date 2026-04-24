import os
import sys
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.db.base import Base
from app.db.models import Doctor, Patient, PredictionHistory
from app.core.config import settings

def migrate():
    # 1. Source: Local SQLite
    sqlite_url = "sqlite:///./clinical_ai.db"
    if not os.path.exists("./clinical_ai.db"):
        print("Error: clinical_ai.db not found in current directory.")
        return

    # 2. Target: PostgreSQL
    # You should provide the EXTERNAL Database URL from Render here
    postgres_url = input("Enter your PostgreSQL External URL (from Render): ").strip()
    
    if not postgres_url.startswith("postgres"):
        print("Invalid PostgreSQL URL. It should start with 'postgres://' or 'postgresql://'")
        return

    # Render uses 'postgres://' but SQLAlchemy often needs 'postgresql://'
    if postgres_url.startswith("postgres://"):
        postgres_url = postgres_url.replace("postgres://", "postgresql://", 1)

    print(f"Connecting to Source (SQLite)...")
    src_engine = create_engine(sqlite_url)
    SrcSession = sessionmaker(bind=src_engine)
    src_session = SrcSession()

    print(f"Connecting to Target (PostgreSQL)...")
    try:
        dest_engine = create_engine(postgres_url)
        # Create tables on target
        Base.metadata.create_all(bind=dest_engine)
        DestSession = sessionmaker(bind=dest_engine)
        dest_session = DestSession()
    except Exception as e:
        print(f"Error connecting to PostgreSQL: {e}")
        return

    try:
        # Migrate Doctors
        print("Migrating Doctors...")
        doctors = src_session.query(Doctor).all()
        for doc in doctors:
            # Check if doctor already exists
            exists = dest_session.query(Doctor).filter_by(id=doc.id).first()
            if not exists:
                # Merge into destination
                dest_session.merge(doc)
        dest_session.commit()
        print(f"Successfully migrated {len(doctors)} doctors.")

        # Migrate Patients
        print("Migrating Patients...")
        patients = src_session.query(Patient).all()
        for p in patients:
            exists = dest_session.query(Patient).filter_by(id=p.id).first()
            if not exists:
                dest_session.merge(p)
        dest_session.commit()
        print(f"Successfully migrated {len(patients)} patients.")

        # Migrate Prediction History
        print("Migrating Prediction History...")
        history = src_session.query(PredictionHistory).all()
        for h in history:
            exists = dest_session.query(PredictionHistory).filter_by(id=h.id).first()
            if not exists:
                dest_session.merge(h)
        dest_session.commit()
        print(f"Successfully migrated {len(history)} history records.")

        print("\nMigration Complete!")
        print("Your data is now in PostgreSQL. You can now deploy your backend to Render.")

    except Exception as e:
        print(f"Error during migration: {e}")
        dest_session.rollback()
    finally:
        src_session.close()
        dest_session.close()

if __name__ == "__main__":
    # Add parent directory to path so we can import 'app'
    sys.path.append(os.path.dirname(os.path.abspath(__file__)))
    migrate()

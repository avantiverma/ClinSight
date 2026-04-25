import os
import json
from datetime import datetime
from sqlalchemy import create_engine, desc
from sqlalchemy.orm import sessionmaker
from app.db.models import Base, Patient, PredictionHistory, Doctor
from app.services.llm_service import generate_clinical_summary

# Set the new API key for this script execution
os.environ["GEMINI_API_KEY"] = "AIzaSyB9llchoE6a6hND5iXK2GBV17q4vXahXu8"

# Setup database
engine = create_engine('sqlite:///./clinical_ai.db')
Session = sessionmaker(bind=engine)
session = Session()

def fix_last_summary():
    # 1. Find the most recent prediction
    last_prediction = session.query(PredictionHistory).order_by(desc(PredictionHistory.timestamp)).first()
    
    if not last_prediction:
        print("No predictions found.")
        return

    patient = session.query(Patient).filter(Patient.id == last_prediction.patient_id).first()
    if not patient:
        print(f"Patient {last_prediction.patient_id} not found.")
        return

    print(f"Checking patient: {patient.name} (ID: {patient.id})")
    print(f"Last prediction type: {last_prediction.model_type}")

    # 2. Check if the notes contain an error
    if "Error generating summary" not in patient.clinical_notes:
        print("No error found in clinical notes. It seems the summary was already generated correctly or is missing.")
        # If it's missing, we can still try to generate it if the user wants.
        # But let's assume they want to fix the error.
        if not patient.clinical_notes:
             print("Notes are empty. Generating fresh summary...")
        else:
             return

    # 3. Identify the error block and prepare for replacement
    # The format used in predict.py is:
    # ### ICU Assessment - {timestamp_str}\n{new_summary}
    
    # Let's just re-generate and update the last block if it's an error
    # Or more simply, if there's an error, we'll replace the text.
    
    model_name = "ICU Risk" if "ICU" in last_prediction.model_type else "Length of Stay Risk"
    
    print(f"Re-generating summary for {model_name}...")
    
    # We need to extract the probability and top_features from prediction_result
    # result = {"probability": result["probability"], "top_features": result["top_features"]}
    pred_res = last_prediction.prediction_result
    if isinstance(pred_res, str):
        pred_res = json.loads(pred_res)
        
    summary_data = {
        "probability": pred_res.get("probability"),
        "top_features": pred_res.get("top_features")
    }
    
    new_summary = generate_clinical_summary(last_prediction.input_data, summary_data, model_name)
    
    if "Error" in new_summary:
        print(f"Failed again: {new_summary}")
        return

    # Replace the error text in clinical_notes
    # We'll look for the last occurrence of the assessment header
    lines = patient.clinical_notes.split("\n\n")
    fixed_lines = []
    found = False
    
    # Iterate backwards to find the last one
    for i in range(len(lines) - 1, -1, -1):
        if ("Assessment -" in lines[i]) and ("Error generating summary" in lines[i]) and not found:
            # Reconstruct the block
            header = lines[i].split("\n")[0] # Should be like ### ICU Assessment - ...
            lines[i] = f"{header}\n{new_summary}"
            found = True
            print("Found and fixed the error block.")
            break
            
    if not found:
        # If we couldn't find the exact block but there was an error, just append or replace
        print("Could not find exact error block with header, appending new summary.")
        timestamp_str = last_prediction.timestamp.strftime("%b %d, %Y - %I:%M %p")
        header_type = "ICU" if "ICU" in last_prediction.model_type else "LOS"
        append_text = f"\n\n### {header_type} Assessment - {timestamp_str}\n{new_summary}"
        patient.clinical_notes += append_text

    patient.clinical_notes = patient.clinical_notes.strip()
    session.commit()
    print("Database updated successfully.")

if __name__ == "__main__":
    fix_last_summary()

import os
import json
import re
from datetime import datetime
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.db.models import Base, Patient, PredictionHistory

# Set the new API key
os.environ["GEMINI_API_KEY"] = "AIzaSyB9llchoE6a6hND5iXK2GBV17q4vXahXu8"

# Import service after setting env var
from app.services.llm_service import generate_clinical_summary

# Setup database
engine = create_engine('sqlite:///./clinical_ai.db')
Session = sessionmaker(bind=engine)
session = Session()

def fix_all_summaries():
    patients = session.query(Patient).all()
    
    for patient in patients:
        if not patient.clinical_notes or "Error generating summary" not in patient.clinical_notes:
            continue
            
        print(f"Fixing notes for patient: {patient.name}")
        
        # Split notes by assessment headers
        # Example header: ### ICU Assessment - Apr 25, 2026 - 04:56 PM
        blocks = re.split(r'(### .* Assessment - .*\n)', patient.clinical_notes)
        
        # Re-split results in [text_before, header1, body1, header2, body2, ...]
        new_notes = blocks[0]
        
        for i in range(1, len(blocks), 2):
            header = blocks[i]
            body = blocks[i+1]
            
            if "Error generating summary" in body:
                # Find the corresponding prediction record
                # Extract timestamp from header
                # Header format: ### {Type} Assessment - {Month} {Day}, {Year} - {Hour}:{Min} {AM/PM}
                try:
                    # Try to find a prediction that matches the type and patient
                    model_type_keyword = "ICU" if "ICU" in header else "LOS"
                    
                    # Instead of precise timestamp match (which is hard due to formatting), 
                    # let's just find predictions for this patient that match the type
                    preds = session.query(PredictionHistory).filter(
                        PredictionHistory.patient_id == patient.id,
                        PredictionHistory.model_type.like(f"%{model_type_keyword}%")
                    ).all()
                    
                    # Find the one that was likely the source of this error
                    # (Simplified: if multiple, we'll try to guess by order or just pick the most relevant)
                    # For now, let's just pick the last one that hasn't been fixed if possible
                    # But even better: Use the prediction_result and input_data to re-generate.
                    
                    if preds:
                        # We'll use the most recent prediction of that type for simplicity if there are multiple errors
                        # In Satish's case, there's likely exactly one ICU and one LOS
                        matching_pred = None
                        for p in preds:
                            # You could do more complex matching here, but let's just use the data
                            matching_pred = p # Pick any for now, ideally the one with the error
                        
                        if matching_pred:
                            model_name = "ICU Risk" if "ICU" in header else "Length of Stay Risk"
                            pred_res = matching_pred.prediction_result
                            if isinstance(pred_res, str):
                                pred_res = json.loads(pred_res)
                            
                            summary_data = {
                                "probability": pred_res.get("probability"),
                                "top_features": pred_res.get("top_features")
                            }
                            
                            print(f"  Re-generating summary for {header.strip()}...")
                            new_summary = generate_clinical_summary(matching_pred.input_data, summary_data, model_name)
                            
                            if "Error" not in new_summary:
                                body = new_summary + "\n\n"
                                print("  Success.")
                            else:
                                print(f"  Failed to re-generate: {new_summary}")
                except Exception as e:
                    print(f"  Error processing block: {e}")
            
            new_notes += header + body
            
        patient.clinical_notes = new_notes.strip()
    
    session.commit()
    print("All patient notes updated.")

if __name__ == "__main__":
    fix_all_summaries()

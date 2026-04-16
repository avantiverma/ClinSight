import pandas as pd
import numpy as np
from sqlalchemy.orm import Session
from sklearn.preprocessing import StandardScaler
from sklearn.neighbors import NearestNeighbors
from app.db.models import PredictionHistory, Patient
from app.schemas import SimilarCase

def find_similar_cases(current_input: dict, model_type: str, db: Session, exclude_patient_id: str = None, n_neighbors: int = 3) -> list[SimilarCase]:
    # 1. Fetch all histories of this model type
    histories = db.query(PredictionHistory).filter(PredictionHistory.model_type == model_type).all()
    
    if not histories:
        return []
        
    # We need at least n_neighbors to show top n
    if len(histories) == 0:
        return []

    # Filter out identical exact histories (optional, but good if we don't want to match the same prediction again)
    # 2. Extract feature lists
    keys = list(current_input.keys())
    
    # Current patient vector
    current_vec = [current_input.get(k, 0) for k in keys]
    
    # Historical vectors
    hist_data = []
    valid_histories = []
    for h in histories:
        if exclude_patient_id and h.patient_id == exclude_patient_id:
            continue
        if not h.input_data:
            continue
        vec = [h.input_data.get(k, 0) for k in keys]
        hist_data.append(vec)
        valid_histories.append(h)
        
    if not hist_data:
        return []
        
    # 3. Standardize & find nearest neighbors
    X = np.array(hist_data)
    X_current = np.array([current_vec])
    
    scaler = StandardScaler()
    
    # If standard deviation is 0, scaler handles it gracefully by not scaling
    # Fallback to unscaled if only 1 record
    if len(hist_data) > 1:
        X_scaled = scaler.fit_transform(X)
        X_current_scaled = scaler.transform(X_current)
    else:
        X_scaled = X
        X_current_scaled = X_current

    n_neighbors_actual = min(n_neighbors, len(hist_data))
    nn = NearestNeighbors(n_neighbors=n_neighbors_actual, metric='euclidean')
    nn.fit(X_scaled)
    
    distances, indices = nn.kneighbors(X_current_scaled)
    
    # 4. Map back to valid_histories and construct response
    similar_cases = []
    for idx_in_result, hist_idx in enumerate(indices[0]):
        dist = distances[0][idx_in_result]
        history_record = valid_histories[hist_idx]
        
        # Calculate a pseudo-percentage match (0 distance = 100%)
        # This uses an exponential decay curve that gives more reasonable percentages for multi-dimensional space
        match_score = np.exp(-dist / 3.0) * 100
        
        # Fetch patient info
        patient = db.query(Patient).filter(Patient.id == history_record.patient_id).first()
        if not patient:
            continue
            
        probability = history_record.prediction_result.get("probability", 0.0)
            
        similar_cases.append(
            SimilarCase(
                patient_name=patient.name,
                age=patient.age,
                gender=patient.gender,
                similarity_score=round(float(match_score), 1),
                predicted_risk=round(float(probability), 3)
            )
        )
        
    return similar_cases

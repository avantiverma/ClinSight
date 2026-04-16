import asyncio
import numpy as np
import pandas as pd
import time
import joblib
import shap
import os
import csv
from pathlib import Path
from typing import Dict, Any, List


# Feature Definitions
ICU_FEATURES = [
    "cline1", "aline1", "asa", "intraop_rocu", "ane_duration_min",
    "iv2", "optype_Colorectal", "intraop_ca", "tubesize", "intraop_ppf",
    "preop_alb", "op_duration_min", "age", "intraop_uo", "intraop_ebl"
]

LOS_PIPELINE_FEATURES = [
    "op_duration_min", "intraop_rocu", "optype_Colorectal", "optype_Vascular",
    "aline1", "preop_alb", "intraop_crystalloid", "intraop_uo",
    "cormack_Easy", "optype_Stomach"
]

LOS_TRANSFORMED_FEATURES = [
    "op_duration_min", "intraop_rocu", "preop_alb", "intraop_crystalloid", "intraop_uo",
    "optype_Colorectal", "optype_Vascular", "optype_Stomach", "cormack_Easy", "aline1"
]

from sklearn.base import BaseEstimator, TransformerMixin
from scipy.stats.mstats import winsorize
import sys

class Winsorizer(BaseEstimator, TransformerMixin):
    def __init__(self, columns, lower=0.01, upper=0.01):
        self.columns = columns
        self.lower = lower
        self.upper = upper

    def fit(self, X, y=None):
        return self

    def transform(self, X):
        X = X.copy()
        for col in self.columns:
            X[col] = winsorize(X[col], limits=[self.lower, self.upper])
        return X

# Patch for newer scikit-learn models loaded in older scikit-learn environment
import sklearn.compose
class _RemainderColsList(list):
    pass
if not hasattr(sklearn.compose, '_column_transformer'):
    sklearn.compose._column_transformer = type('mock', (object,), {})()
sklearn.compose._column_transformer._RemainderColsList = _RemainderColsList

# ✅ THIS IS THE CRITICAL LINE
sys.modules['__main__'].Winsorizer = Winsorizer

class MLService:
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(MLService, cls).__new__(cls)
            cls._instance.initialize()
        return cls._instance
    
    def initialize(self):
        print("Loading ML Models and Explainers...")
        BASE_DIR = Path(__file__).resolve().parents[2]
        base_path = BASE_DIR / "ml_models"
        
        # Load ICU Model and Explainer
        icu_model_path = base_path / "icu_model.pkl"
        self.icu_model = joblib.load(icu_model_path)
        # Initialize explainer once
        self.icu_explainer = shap.TreeExplainer(self.icu_model)
        
        # Load new LOS feature pipeline
        los_pipeline_path = base_path / "los_10feature_pipeline.pkl"
        self.los_pipeline_model = joblib.load(los_pipeline_path)
        self.los_explainer = shap.TreeExplainer(self.los_pipeline_model.named_steps['model'])

        
        print("Models Loaded.")

    async def predict_icu(self, features: Dict[str, Any]) -> Dict[str, Any]:
        # 1. Build NUMPY input in strict feature order
        feature_vector = [features[f] for f in ICU_FEATURES]
        X = np.array(feature_vector).reshape(1, -1)

        # 2. Predict probability
        proba = self.icu_model.predict_proba(X)[0][1]
        if not np.isfinite(proba):
            proba = 0.0

        # 3. SHAP values (positional)
        shap_values = self.icu_explainer.shap_values(X)

        if isinstance(shap_values, list):
            shap_vals = shap_values[1][0]
        else:
            shap_vals = shap_values[0]

        # 4. Filter + sort
        feature_contributions = []
        for name, val in zip(ICU_FEATURES, shap_vals):
            val = float(val)
            if np.isfinite(val) and val > 0:
                feature_contributions.append((name, val))

        feature_contributions.sort(key=lambda x: x[1], reverse=True)

        top_features = [
            {"feature": name, "contribution": val}
            for name, val in feature_contributions[:5]
        ]

        return {
            "probability": float(proba),
            "top_features": top_features
        }

    async def predict_los_pipeline(self, features: Dict[str, Any]) -> Dict[str, Any]:
        # 1. Build NUMPY input in strict feature order
        feature_vector = [features[f] for f in LOS_PIPELINE_FEATURES]
        
        # 2. DataFrame conversion (as required by sklearn pipelines w/ column transformers)
        # Using the exact same names guarantees columns match the trained model requirements.
        df = pd.DataFrame([feature_vector], columns=LOS_PIPELINE_FEATURES)

        # 3. Predict probability safely
        try:
             proba = self.los_pipeline_model.predict_proba(df)[0][1]
        except Exception as e:
             # If model fails, surface error or return default
             print(f"Pipeline prediction error: {e}")
             raise ValueError("Failed to process prediction through pipeline")
             
        if not np.isfinite(proba):
            proba = 0.0
            
        # 4. Extract SHAP values
        X_transformed = self.los_pipeline_model.named_steps["preprocessing"].transform(df)
        shap_values = self.los_explainer.shap_values(X_transformed)
        
        if isinstance(shap_values, list):
            shap_vals = shap_values[1][0]
        else:
            shap_vals = shap_values[0]

        # 5. Filter + sort
        feature_contributions = []
        for name, val in zip(LOS_TRANSFORMED_FEATURES, shap_vals):
            val = float(val)
            if np.isfinite(val) and val > 0:
                feature_contributions.append((name, val))

        feature_contributions.sort(key=lambda x: x[1], reverse=True)

        top_features = [
            {"feature": name, "contribution": val}
            for name, val in feature_contributions[:5]
        ]

        return {
            "probability": float(proba),
            "top_features": top_features
        }


    def _predict(self, model, explainer, feature_vector: List[float], feature_names: List[str]) -> Dict[str, Any]:
        # Reshape input to (1, n_features) for sklearn
        X = np.array(feature_vector).reshape(1, -1)
        
        # Prediction logic
        # Both ICU and LOS are binary classifiers
        # Use predict_proba to get probability of positive class (index 1)
        # For LOS: Class 1 = LOS >= 3 days
        try:
            proba = model.predict_proba(X)[0][1]
        except AttributeError:
             # Fallback if model unexpectedly lacks predict_proba, but strict requirement says use it.
             # If this fails, it means the model file is not a classifier as expected.
             # However, given "LOS model outputs probabilities via predict_proba", we assume success.
             raise ValueError("Model does not support predict_proba as required for classification.")

        # Sanitize probability to ensure valid JSON (no NaN/Inf)
        if not np.isfinite(proba):
            proba = 0.0

        # SHAP output
        shap_values_result = explainer.shap_values(X)
        
        if isinstance(shap_values_result, list):
            if len(shap_values_result) == 2:
                shap_values = shap_values_result[1][0]
            else:
                shap_values = shap_values_result[-1][0]
        else:
            if len(shap_values_result.shape) > 1:
                 shap_values = shap_values_result[0]
            else:
                 shap_values = shap_values_result

        # Process SHAP values for response
        # 1. Filter positive only AND valid numbers (Fix 2: No NaN/Inf)
        # 2. Sort by absolute contribution (descending)
        # 3. Top 5
        
        # Create list of tuples: (name, shap_value)
        feature_contributions = []
        for name, val in zip(feature_names, shap_values):
            val_float = float(val)
            # Check for NaN or Inf
            if np.isfinite(val_float) and val_float > 0:
                feature_contributions.append((name, val_float))
        
        # Sort by contribution descending
        feature_contributions.sort(key=lambda x: x[1], reverse=True)
        
        # Take top 5
        top_5 = feature_contributions[:5]
        
        # Format response
        top_features_list = []
        for name, val in top_5:
            top_features_list.append({
                "feature": name,
                "contribution": val
            })
        
        return {
            "probability": float(proba),
            "top_features": top_features_list
        }

ml_service = MLService()



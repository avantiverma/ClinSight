import os
from google import genai
from fastapi import APIRouter
from app.db.models import PredictionHistory
import json

# Initialize GenAI Client
# Will automatically pick up GEMINI_API_KEY from environment variables
api_key = os.environ.get("GEMINI_API_KEY")
if not api_key:
    # Fallback to local .env if mostly needed
    from dotenv import load_dotenv
    load_dotenv()
    api_key = os.environ.get("GEMINI_API_KEY")

client = genai.Client(api_key=api_key)

SYSTEM_PROMPT = """You are an expert Clinical AI Assistant embedded in an ICU/Hospital predictive analytics system.
Your goal is to review a patient's vitals, labs, and the machine learning model's prediction, and provide a concise, clinically sound summary.

Write a focused clinical evaluation explaining the prediction based on the provided vitals and algorithms. Keep it clinically relevant, to the point, and easily scannable (around 3 to 4 sentences). Do not write overly lengthy or verbose paragraphs.
Use Markdown to emphasize high-risk variables (use bold for elevated vitals like **Heart Rate: 110 bpm**).
Do not diagnose or prescribe treatment. Just provide a brief interpretative summary of the data, the prediction, and the key contributing factors.
"""

def generate_clinical_summary(patient_data: dict, prediction_result: dict, model_type: str) -> str:
    """
    Generates a markdown formatted summary of the patient case.
    """
    try:
        if not api_key:
            return "Error: Gemini API Key not found."

        input_prompt = f"Model Type: {model_type}\n"
        input_prompt += f"Patient Input Data:\n{json.dumps(patient_data, indent=2)}\n\n"
        input_prompt += f"Prediction Result:\n{json.dumps(prediction_result, indent=2)}\n\n"
        input_prompt += "Please provide a concise clinical summary."

        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=[SYSTEM_PROMPT, input_prompt]
        )
        return response.text
    except Exception as e:
        return f"Error generating summary: {str(e)}"

def generate_batch_clinical_summaries(history_records: list) -> str:
    """
    Generates a single markdown formatted output containing summaries for multiple historical records.
    Each record in history_records should be a dict with: timestamp, model_type, input_data, prediction_result
    """
    try:
        if not api_key:
            return "Error: Gemini API Key not found."

        input_prompt = "Please provide a concise clinical summary for EACH of the following historical predictions for this patient.\n"
        input_prompt += "For each prediction, start your summary with EXACTLY this header format:\n"
        input_prompt += "### {Model Type} Assessment - {Timestamp}\n\n"
        
        for record in history_records:
            input_prompt += f"Timestamp: {record['timestamp']}\n"
            input_prompt += f"Model Type: {record['model_type']}\n"
            input_prompt += f"Patient Input Data:\n{json.dumps(record['input_data'], indent=2)}\n"
            input_prompt += f"Prediction Result:\n{json.dumps(record['prediction_result'], indent=2)}\n\n"
        
        input_prompt += "Provide the concise summaries now. Make sure each is clinically sound. \n"
        input_prompt += "CRITICAL: You MUST separate each summary block with plenty of empty lines (e.g. \\n\\n) so it is visually clear where one ends and the next begins, but strictly DO NOT use any markdown horizontal rules or dividers like `---`."

        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=[SYSTEM_PROMPT, input_prompt]
        )
        return response.text
    except Exception as e:
        return f"Error generating summary: {str(e)}"

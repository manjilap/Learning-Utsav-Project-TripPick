import os
import json
import logging
from typing import Dict, Any, List
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

try:
    from google import genai
    from google.genai.errors import APIError
    client = genai.Client(api_key=os.getenv('GEMINI_API_KEY'))
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False
    logging.warning("Google GenAI SDK not installed. Activities agent will use a fallback mock.")
except Exception:
    GEMINI_AVAILABLE = False
    logging.warning("GEMINI_API_KEY not set or invalid. Activities agent will use a fallback mock.")


logger = logging.getLogger(__name__)

def recommend_activities(state: Dict[str, Any]) -> Dict[str, List[str]]:
    """
    Generates personalized activity recommendations using the Gemini LLM.
    """
    destination = state.get('preferences', {}).get('destination', 'A city')
    days = state.get('preferences', {}).get('Days', 3)
    
    # 1. Fallback if Gemini is unavailable
    if not GEMINI_AVAILABLE:
        logger.warning("Using mock activities recommendation.")
        return _mock_activities_recommendation(destination, days)

    # 2. Build the LLM Prompt
    system_prompt = (
        "You are a local concierge. Your task is to generate a comprehensive, exciting list of activities "
        f"for a {days}-day trip to {destination}. The list should include a mix of landmarks, food, and culture, "
        "and contain at least 4 activities per day, totaling at least 12 items. "
        "The list must be formatted STRICTLY as a JSON list of strings. Do not include any other text."
    )
    
    user_prompt = f"Generate an activity list for a leisure trip to {destination} for {days} days."

    # 3. Call Gemini API
    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=[system_prompt, user_prompt],
            config={"response_mime_type": "application/json"}
        )
        
        # Parse the JSON output from the LLM
        activity_list = json.loads(response.text.strip())
        
        if not isinstance(activity_list, list):
            raise ValueError("LLM did not return a valid JSON list.")
            
        # The agent should return the list wrapped in the key expected by the LangGraph state
        return {'activities': activity_list}

    except APIError as e:
        logger.error(f"Gemini Activities API Error: {e}")
        return _mock_activities_recommendation(destination, days)
    except Exception as e:
        logger.error(f"Error processing Gemini activities response: {e}")
        return _mock_activities_recommendation(destination, days)


def _mock_activities_recommendation(destination: str, days: int) -> Dict[str, List[str]]:
    """Deterministic fallback."""
    base_activities = [
        f"Visit the main landmark of {destination}",
        "Explore the local market/bazaar",
        "Take a scenic walking tour",
        "Enjoy a sunset view",
    ]
    full_activity_list = (base_activities * (days // len(base_activities) + 1))[:days * 4]
    return {'activities': full_activity_list}
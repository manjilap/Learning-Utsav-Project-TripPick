import os
import json
import logging
from typing import Dict, Any, List
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Re-use the existing Gemini setup check from activities_agent or packing_agent
try:
    from google import genai
    from google.genai.errors import APIError
    client = genai.Client(api_key=os.getenv('GEMINI_API_KEY'))
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False
except Exception:
    GEMINI_AVAILABLE = False


logger = logging.getLogger(__name__)

def recommend(state: Dict[str, Any]) -> Dict[str, Dict[str, str]]:
    """
    Generates a food and culture overview using the Gemini LLM.
    """
    destination = state.get('preferences', {}).get('destination', 'A city')
    
    # 1. Fallback if Gemini is unavailable
    if not GEMINI_AVAILABLE:
        logger.warning("Using mock food/culture recommendation.")
        return _mock_food_culture_recommendation(destination)

    # 2. Build the LLM Prompt
    system_prompt = (
        "You are a cultural guide. Generate a summary of local culture and cuisine for the given destination. "
        "The output must be formatted STRICTLY as a JSON object with two keys: 'cuisine_summary' (1 paragraph) "
        "and 'cultural_note' (1 paragraph). Do not include any other text or markdown."
    )
    
    user_prompt = f"Destination: {destination}. Provide a cuisine summary and one cultural note."

    # 3. Call Gemini API
    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=[system_prompt, user_prompt],
            config={"response_mime_type": "application/json"}
        )
        
        # Parse the JSON output from the LLM
        culture_dict = json.loads(response.text.strip())
        
        if not isinstance(culture_dict, dict) or 'cuisine_summary' not in culture_dict:
            raise ValueError("LLM did not return the expected JSON object.")
            
        # The agent should return the dict wrapped in the key expected by the LangGraph state
        return {'food_culture': culture_dict}

    except APIError as e:
        logger.error(f"Gemini Food/Culture API Error: {e}")
        return _mock_food_culture_recommendation(destination)
    except Exception as e:
        logger.error(f"Error processing Gemini food/culture response: {e}")
        return _mock_food_culture_recommendation(destination)


def _mock_food_culture_recommendation(destination: str) -> Dict[str, Dict[str, str]]:
    """Deterministic fallback."""
    return {
        'food_culture': {
            'cuisine_summary': f'The food in {destination} is famous for its simple, fresh, and seasonal ingredients. Look for the local specialty stew!',
            'cultural_note': 'A key cultural note is the tradition of afternoon tea/coffee, which is a must-do for visitors.',
        }
    }
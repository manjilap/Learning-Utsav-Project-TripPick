import os
import json
import logging
from typing import Dict, Any, List

logger = logging.getLogger(__name__)

# Try to import Gemini SDK
try:
    from google import genai
    from google.genai.errors import APIError
    client = genai.Client(api_key=os.environ.get('GEMINI_API_KEY'))
    GEMINI_AVAILABLE = True
except ImportError:
    logger.warning("Google GenAI SDK not installed. Packing agent will use a fallback mock.")
    GEMINI_AVAILABLE = False
except Exception:
    logger.warning("GEMINI_API_KEY not set or invalid. Packing agent will use a fallback mock.")
    GEMINI_AVAILABLE = False


def generate_packing_list(state: Dict[str, Any]) -> Dict[str, List[str]]:
    """
    Generates a packing list based on destination, preferences, and weather forecast
    using the Gemini LLM. Falls back to deterministic logic if Gemini is unavailable.
    """
    # 1. Extract necessary data from LangGraph state
    destination = state.get('preferences', {}).get('destination', 'A mystery location')
    forecast_list = state.get('weather_forecast', [])
    
    # Check if the weather agent provided data (it returns [] on failure)
    if not forecast_list or not GEMINI_AVAILABLE:
        return _deterministic_packing_fallback(destination, forecast_list)

    # 2. Build the LLM Prompt
    weather_summary = "\n".join([
        f"- {f.get('date')}: Min {f.get('min_temp_c')}°C, Max {f.get('max_temp_c')}°C, Summary: {f.get('summary')}"
        for f in forecast_list
    ])

    system_prompt = (
        "You are an intelligent, concise travel agent. Your task is to generate a comprehensive packing list "
        "based ONLY on the provided destination and weather forecast. The list must be formatted strictly as a "
        "JSON list of strings. Do not include any other text or markdown."
    )
    
    user_prompt = f"""
    Destination: {destination}
    Weather Forecast (Next 5 Days):
    {weather_summary}
    
    User Preferences: The user is planning a short leisure trip.
    
    Generate the packing list now.
    """

    # 3. Call Gemini API
    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=[system_prompt, user_prompt],
            config={"response_mime_type": "application/json"}
        )
        
        # Parse the JSON output from the LLM
        packing_list = json.loads(response.text.strip())
        
        if not isinstance(packing_list, list):
            raise ValueError("LLM did not return a valid JSON list.")
            
        return {'packing_list': packing_list}

    except APIError as e:
        logger.error(f"Gemini API Error: {e}")
        return _deterministic_packing_fallback(destination, forecast_list)
    except Exception as e:
        logger.error(f"Error processing Gemini response: {e}")
        return _deterministic_packing_fallback(destination, forecast_list)


def _deterministic_packing_fallback(destination: str, forecast_list: List[Dict]) -> Dict[str, List[str]]:
    """
    Deterministic fallback logic (based on previous agent plan) if the LLM fails.
    """
    logger.warning("Using deterministic packing fallback for %s.", destination)
    
    packing_list = [
        'Passport/ID', 'Phone & Charger', 'Basic Toiletries', 'Adapter'
    ]
    
    # Calculate averages from forecast list
    if forecast_list:
        is_rainy = any('Rainy' in item.get('summary', '') for item in forecast_list)
        min_temps = [item.get('min_temp_c', 999) for item in forecast_list if isinstance(item.get('min_temp_c'), (int, float))]
        avg_min_temp = sum(min_temps) / len(min_temps) if min_temps else 999
        
        if is_rainy:
            packing_list.append('Waterproof Jacket')
            packing_list.append('Umbrella')
            
        if avg_min_temp < 10:
            packing_list.append('Warm Coat')
            packing_list.append('Gloves and Hat')
        elif avg_min_temp > 25:
            packing_list.append('Sunscreen')
            packing_list.append('Sunglasses')
        
    else:
        # Generic items if no weather data is available
        packing_list.append(f'Clothing suitable for {destination}')

    return {'packing_list': packing_list}
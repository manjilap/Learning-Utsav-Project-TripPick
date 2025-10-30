import requests
import os
import logging
from datetime import datetime
from typing import Dict, Any, List
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

logger = logging.getLogger(__name__)

OPENWEATHER_API_KEY = os.getenv('OPENWEATHER_API_KEY')

def get_forecast(state: Dict[str, Any]) -> Dict[str, List[Dict]]:
    """
    Fetches weather data using OpenWeatherMap 5-day / 3-hour forecast.
    Extracts destination from state['preferences'].
    """
    prefs = state.get('preferences', {})
    destination = prefs.get('destination')
    
    if not destination or not OPENWEATHER_API_KEY:
        logger.error("Destination or OPENWEATHER_API_KEY is missing.")
        # Return empty list for robust LangGraph state merge
        return {'weather_forecast': []}

    # OpenWeatherMap 5-day / 3-hour Forecast API endpoint
    weather_url = 'https://api.openweathermap.org/data/2.5/forecast'
    params = {
        'q': destination,
        'appid': OPENWEATHER_API_KEY,
        'units': 'metric'  # Use Celsius
    }

    try:
        response = requests.get(weather_url, params=params)
        response.raise_for_status()
        data = response.json()
        
        # --- Process the 3-hour data into a simplified daily summary ---
        
        # Group by day to get min/max/summary
        daily_summaries = {}
        
        for forecast in data.get('list', []):
            # Extract date (YYYY-MM-DD) from the timestamp
            date_str = datetime.fromtimestamp(forecast['dt']).strftime('%Y-%m-%d')
            temp = forecast['main']['temp']
            weather_desc = forecast['weather'][0]['description'].lower()

            if date_str not in daily_summaries:
                daily_summaries[date_str] = {
                    'min_temp_c': temp,
                    'max_temp_c': temp,
                    'rainy_periods': 0,
                    'summary_words': set()
                }

            # Update min/max temps
            daily_summaries[date_str]['min_temp_c'] = min(daily_summaries[date_str]['min_temp_c'], temp)
            daily_summaries[date_str]['max_temp_c'] = max(daily_summaries[date_str]['max_temp_c'], temp)
            
            # Count rain occurrences
            if 'rain' in weather_desc or 'shower' in weather_desc:
                daily_summaries[date_str]['rainy_periods'] += 1

            # Add general description words
            daily_summaries[date_str]['summary_words'].add(weather_desc)
        
        
        # Format for final output list (same as the previous structure)
        forecast_list = []
        for date_str, summary in daily_summaries.items():
            
            # Simple aggregation for 'summary'
            final_summary = 'Rainy' if summary['rainy_periods'] >= 2 else ', '.join(list(summary['summary_words'])[:2])
            
            forecast_list.append({
                'date': date_str,
                'max_temp_c': round(summary['max_temp_c']),
                'min_temp_c': round(summary['min_temp_c']),
                'summary': final_summary.title(),
            })

        # Return the output wrapped in the key expected by the LangGraph state
        return {'weather_forecast': forecast_list}
        
    except requests.exceptions.RequestException as e:
        logger.error(f"OpenWeatherMap API call failed: {e}")
        return {'weather_forecast': []}
    except Exception as e:
        logger.error(f"An unexpected error occurred in weather agent: {e}")
        return {'weather_forecast': []}
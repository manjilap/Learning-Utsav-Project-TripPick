import os
import logging
from typing import Dict, Any, List
from amadeus import Client, ResponseError
from django.conf import settings
from datetime import datetime, timedelta
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

logger = logging.getLogger(__name__)

# NOTE: Amadeus Client is assumed to be initialized (or available) via flight_recommender's initialization
# For simplicity, we'll re-initialize or reuse the availability check.
try:
    # Use the same client initialized in the flight agent's file, or re-init (safer)
    AMADEUS_CLIENT = Client(
        client_id=os.getenv('AMADEUS_CLIENT_ID'),
        client_secret=os.getenv('AMADEUS_CLIENT_SECRET')
    )
    AMADEUS_AVAILABLE = True
except Exception as e:
    logger.warning(f"Amadeus Client is not available for hotels: {e}")
    AMADEUS_AVAILABLE = False


def search_hotels(state: Dict[str, Any]) -> Dict[str, List[Dict]]:
    """
    Searches for hotel offers using the Amadeus API based on a city search.
    """
    if not AMADEUS_AVAILABLE:
        return _mock_hotel_search(state) # Fallback to mock

    prefs = state.get('preferences', {})
    destination_city = prefs.get('destination')
    
    if not destination_city:
        logger.warning("Missing destination for hotel search.")
        return {'hotels': []}

    # 1. Get Location ID or Lat/Lon for the city
    # Amadeus Hotel Search often prefers GEO coordinates. We can get this via the Location API.
    lat, lon = 0, 0
    try:
        response = AMADEUS_CLIENT.reference_data.locations.get(
            keyword=destination_city, 
            subType=['CITY']
        )
        if response.data:
            lat = response.data[0]['geoCode']['latitude']
            lon = response.data[0]['geoCode']['longitude']
        else:
            logger.warning(f"Could not get coordinates for {destination_city}.")
            return {'hotels': []}
            
    except Exception as e:
        logger.error(f"Amadeus Geocoding Error for hotels: {e}")
        return {'hotels': []}

    # 2. Call Hotel Search API (using Bounding Box around the coordinates)
    # The API is complex, we will use the most direct 'by-square' method for simplicity.
    try:
        # Search a 10km radius (0.1 degree is roughly 11km)
        response = AMADEUS_CLIENT.shopping.hotel_offers.get(
            latitude=lat,
            longitude=lon,
            radius=10, # 10km radius
            radiusUnit='KM',
            checkInDate=(datetime.now() + timedelta(days=1)).strftime('%Y-%m-%d'),
            checkOutDate=(datetime.now() + timedelta(days=2)).strftime('%Y-%m-%d'),
            view='FULL',
            bestRateOnly='true',
            boardType='ROOM_ONLY',
            # You can add price range filtering here if Amadeus supports it in this call
        )
        
        hotel_options = []
        for offer in response.data:
            # Extracting name requires a separate call sometimes, so we'll use a placeholder or best guess
            hotel_id = offer['hotel']['hotelId']
            
            hotel_options.append({
                'id': hotel_id,
                'name': f"Hotel near {destination_city} ({hotel_id})", # Placeholder
                'price_per_night': float(offer['offers'][0]['price']['total']), # Price for the single night
                'rating': offer['hotel'].get('rating', 'N/A'),
                'amenities': offer['hotel'].get('amenities', []),
                'address': offer['hotel']['address']['cityName'],
            })
            
        return {'hotels': hotel_options}
        
    except ResponseError as e:
        logger.error(f"Amadeus Hotel Search API Error: {e}")
        return {'hotels': []}
    except Exception as e:
        logger.error(f"An unexpected error occurred in hotel agent: {e}")
        return {'hotels': []}


# Simple mock for fallback
def _mock_hotel_search(state: Dict[str, Any]) -> Dict[str, List[Dict]]:
    logger.warning("Using mock hotel search because Amadeus is unavailable.")
    # This is the same mock as before, just renamed to be a private fallback helper
    prefs = state.get('preferences', {})
    destination = prefs.get('destination', 'Unknown')
    return {'hotels': [
        {'id': 'H501', 'name': f'MOCK Grand View in {destination}', 'price_per_night': 200, 'rating': 4.5, 'amenities': ['Free Wifi', 'Pool'], 'address': destination},
    ]}
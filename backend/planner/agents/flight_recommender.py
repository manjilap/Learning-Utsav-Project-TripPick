import os
import logging
from typing import Dict, Any, List
from amadeus import Client, ResponseError
from django.conf import settings
from datetime import datetime
import timedelta

logger = logging.getLogger(__name__)

# Initialize Amadeus Client (will automatically handle token generation)
try:
    AMADEUS_CLIENT = Client(
        client_id=os.environ.get('AMADEUS_CLIENT_ID'),
        client_secret=os.environ.get('AMADEUS_CLIENT_SECRET')
    )
    AMADEUS_AVAILABLE = True
except Exception as e:
    logger.error(f"Failed to initialize Amadeus Client: {e}")
    AMADEUS_AVAILABLE = False


def _get_iata_code(city_name: str) -> str:
    """Helper to convert a city name to its primary IATA airport code."""
    if not AMADEUS_AVAILABLE:
        return ""
    
    try:
        # Using the Location API to find the closest major airport code (IATA)
        response = AMADEUS_CLIENT.reference_data.locations.get(
            keyword=city_name, 
            subType=['CITY', 'AIRPORT']
        )
        # Assuming the first result is the best
        return response.data[0]['iataCode']
    except Exception as e:
        logger.warning(f"Failed to get IATA code for {city_name}: {e}")
        return ""


def search_flights(state: Dict[str, Any]) -> Dict[str, List[Dict]]:
    """
    Searches for flight offers using the Amadeus API.
    """
    if not AMADEUS_AVAILABLE:
        return _mock_flight_search(state) # Fallback to mock if API is not configured

    prefs = state.get('preferences', {})
    destination_city = prefs.get('destination')
    origin_city = prefs.get('origin') # Assume origin is provided by frontend
    
    if not destination_city or not origin_city:
        logger.warning("Missing origin or destination for flight search.")
        return {'flights': []}

    # 1. Get IATA codes
    origin_iata = _get_iata_code(origin_city)
    destination_iata = _get_iata_code(destination_city)
    
    # 2. Extract Date (Simplification: just get tomorrow's date for a one-way trip)
    # NOTE: You will need to implement proper date handling based on user input for a round-trip
    travel_date = (datetime.now() + timedelta(days=1)).strftime('%Y-%m-%d')
    
    if not origin_iata or not destination_iata:
        logger.warning("Could not convert city names to IATA codes.")
        return {'flights': []}

    # 3. Call Flight Search API
    try:
        response = AMADEUS_CLIENT.shopping.flight_offers_search.get(
            originLocationCode=origin_iata,
            destinationLocationCode=destination_iata,
            departureDate=travel_date,
            adults=1,
            currencyCode='USD',
            max=3  # Limit to 3 results
        )
        
        flight_options = []
        for offer in response.data:
            # Extract relevant details from the complex Amadeus response
            segment = offer['itineraries'][0]['segments'][0]
            
            flight_options.append({
                'id': offer['id'],
                'airline': segment['carrierCode'],
                'price': float(offer['price']['total']),
                'stops': len(offer['itineraries'][0]['segments']) - 1, # Number of intermediate segments
                'duration': offer['itineraries'][0]['duration'],
                'origin': origin_iata,
                'destination': destination_iata,
                'co2_estimate': offer.get('travelerPricings', [{}])[0].get('fareDetailsBySegment', [{}])[0].get('co2Emissions', {}).get('weight', 0), # Amadeus provides CO2 data
                'departure_time': segment['departure']['at'],
            })
            
        return {'flights': flight_options}
        
    except ResponseError as e:
        logger.error(f"Amadeus Flight Search API Error: {e}")
        return {'flights': []}
    except Exception as e:
        logger.error(f"An unexpected error occurred in flight agent: {e}")
        return {'flights': []}

# Simple mock for fallback
def _mock_flight_search(state: Dict[str, Any]) -> Dict[str, List[Dict]]:
    logger.warning("Using mock flight search because Amadeus is unavailable.")
    # This is the same mock as before, just renamed to be a private fallback helper
    prefs = state.get('preferences', {})
    origin = prefs.get('origin', 'JFK') 
    destination = prefs.get('destination', 'Unknown')
    # ... (rest of the mock logic)
    return {'flights': [
        {'id': 'F101', 'airline': 'MOCK', 'price': 650, 'stops': 1, 'duration': '12h 30m', 'origin': origin, 'destination': destination, 'co2_estimate': 1.5, 'departure_time': '08:00'},
    ]}
import os
import logging
import requests
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

logger = logging.getLogger(__name__)

# Amadeus API credentials
AMADEUS_CLIENT_ID = os.getenv('AMADEUS_CLIENT_ID')
AMADEUS_CLIENT_SECRET = os.getenv('AMADEUS_CLIENT_SECRET')
AMADEUS_AVAILABLE = bool(AMADEUS_CLIENT_ID and AMADEUS_CLIENT_SECRET)

# # Common city to IATA code mapping (fallback for quick lookups)
# CITY_IATA_MAP = {
#     'paris': 'PAR',
#     'paris, france': 'PAR',
#     'london': 'LON',
#     'london, uk': 'LON',
#     'new york': 'NYC',
#     'new york, usa': 'NYC',
#     'kathmandu': 'KTM',
#     'kathmandu, nepal': 'KTM',
#     'tokyo': 'TYO',
#     'tokyo, japan': 'TYO',
#     'dubai': 'DXB',
#     'dubai, uae': 'DXB',
#     'singapore': 'SIN',
#     'los angeles': 'LAX',
#     'los angeles, usa': 'LAX',
#     'bangkok': 'BKK',
#     'bangkok, thailand': 'BKK',
#     'delhi': 'DEL',
#     'delhi, india': 'DEL',
#     'sydney': 'SYD',
#     'sydney, australia': 'SYD',
# }

CITY_IATA_MAP = {}


def _get_amadeus_token() -> Optional[str]:
    """Gets an OAuth2 token from Amadeus."""
    if not AMADEUS_AVAILABLE:
        return None
    
    url = "https://test.api.amadeus.com/v1/security/oauth2/token"
    headers = {"Content-Type": "application/x-www-form-urlencoded"}
    data = {
        "grant_type": "client_credentials",
        "client_id": AMADEUS_CLIENT_ID,
        "client_secret": AMADEUS_CLIENT_SECRET
    }
    
    try:
        response = requests.post(url, headers=headers, data=data)
        response.raise_for_status()
        token = response.json().get("access_token")
        logger.info("Successfully obtained Amadeus access token")
        return token
    except requests.exceptions.RequestException as e:
        logger.error(f"Error getting Amadeus token: {e}")
        return None


def _get_iata_code(city_name: str, access_token: Optional[str] = None) -> str:
    """
    Gets IATA code for a city using the Amadeus Cities API.
    Uses /v1/reference-data/locations/cities endpoint for accurate city IATA codes.
    """
    if not city_name:
        return ""
    
    # First, check the local mapping for quick lookups
    city_lower = city_name.lower().strip()
    if city_lower in CITY_IATA_MAP:
        logger.info(f"Found IATA code for '{city_name}' in local mapping: {CITY_IATA_MAP[city_lower]}")
        return CITY_IATA_MAP[city_lower]
    
    # If not in mapping and we have a token, try the Cities API
    if not access_token:
        logger.warning(f"No access token available to lookup IATA code for '{city_name}'")
        return ""
    
    # Extract just the city name if it contains comma (e.g., "Amsterdam, Netherlands" -> "Amsterdam")
    keyword = city_name.split(',')[0].strip()
    
    url = "https://test.api.amadeus.com/v1/reference-data/locations/cities"
    headers = {"Authorization": f"Bearer {access_token}"}
    params = {
        "keyword": keyword,  # Use just city name without country
        "max": 10  # Get top 10 results to find best match
    }
    
    try:
        response = requests.get(url, headers=headers, params=params)
        response.raise_for_status()
        data = response.json()
        
        if data.get("data") and len(data["data"]) > 0:
            # Get the first result (most relevant match)
            city = data["data"][0]
            iata_code = city.get("iataCode", "")
            name = city.get("name", "")
            country = city.get("address", {}).get("countryCode", "")
            
            if iata_code:
                logger.info(f"Found IATA code for '{city_name}': {iata_code} - {name}, {country}")
                return iata_code
            else:
                logger.warning(f"City '{city_name}' found but has no IATA code: {name}, {country}")
                return ""
        else:
            logger.warning(f"No city found for '{city_name}'")
            return ""
            
    except requests.exceptions.RequestException as e:
        logger.error(f"Error searching for IATA code for '{city_name}': {e}")
        if hasattr(e, 'response') and hasattr(e.response, 'text'):
            logger.error(f"Response: {e.response.text}")
        return ""


def search_flights(state: Dict[str, Any]) -> Dict[str, List[Dict]]:
    """
    Searches for flight offers using the Amadeus Flight Offers Search API with OAuth2 token authentication.
    Uses /v2/shopping/flight-offers endpoint for specific origin-destination searches.
    """
    if not AMADEUS_AVAILABLE:
        logger.warning("Amadeus credentials not available - using mock flight data")
        return _mock_flight_search(state)

    prefs = state.get('preferences', {})
    destination_city = prefs.get('destination')
    origin_city = prefs.get('origin')
    days = prefs.get('Days', 7)  # Get trip duration from preferences
    
    if not destination_city or not origin_city:
        logger.warning("Missing origin or destination for flight search.")
        return {'flights': []}

    # Get access token
    access_token = _get_amadeus_token()
    if not access_token:
        logger.warning("Failed to get Amadeus access token - using mock data")
        return _mock_flight_search(state)

    # Get IATA codes using the token
    origin_iata = _get_iata_code(origin_city, access_token)
    destination_iata = _get_iata_code(destination_city, access_token)
    
    if not origin_iata or not destination_iata:
        logger.warning(f"Could not resolve IATA codes for {origin_city} -> {destination_city}")
        return _mock_flight_search(state)

    # Calculate departure and return dates
    departure_date = (datetime.now() + timedelta(days=7)).strftime('%Y-%m-%d')  # 1 week from now
    return_date = (datetime.now() + timedelta(days=7 + int(days))).strftime('%Y-%m-%d')
    
    # Call Flight Offers Search API with Bearer token
    url = "https://test.api.amadeus.com/v2/shopping/flight-offers"
    headers = {"Authorization": f"Bearer {access_token}"}
    params = {
        "originLocationCode": origin_iata,
        "destinationLocationCode": destination_iata,
        "departureDate": departure_date,
        "returnDate": return_date,  # Add return date for round-trip
        "adults": "1",
        "nonStop": "false",  # Allow connecting flights
        "currencyCode": "USD",
        "max": "5"  # Get top 5 results for better options
    }
    
    try:
        logger.info(f"Searching flights from {origin_iata} to {destination_iata} (Departure: {departure_date}, Return: {return_date})")
        response = requests.get(url, headers=headers, params=params)
        response.raise_for_status()
        data = response.json()
        
        flight_options = []
        for offer in data.get("data", []):
            # Extract relevant details from the Amadeus response
            outbound = offer['itineraries'][0]  # Outbound flight
            inbound = offer['itineraries'][1] if len(offer['itineraries']) > 1 else None  # Return flight
            
            first_segment = outbound['segments'][0]
            last_segment = outbound['segments'][-1]
            
            flight_info = {
                'id': offer['id'],
                'airline': first_segment['carrierCode'],
                'price': float(offer['price']['total']),
                'currency': offer['price']['currency'],
                'stops': len(outbound['segments']) - 1,
                'duration': outbound['duration'],
                'origin': origin_iata,
                'destination': destination_iata,
                'departure_time': first_segment['departure']['at'],
                'arrival_time': last_segment['arrival']['at'],
                'co2_estimate': offer.get('travelerPricings', [{}])[0].get('fareDetailsBySegment', [{}])[0].get('co2Emissions', {}).get('weight', 0),
            }
            
            # Add return flight info if available
            if inbound:
                flight_info['return_duration'] = inbound['duration']
                flight_info['return_departure'] = inbound['segments'][0]['departure']['at']
            
            flight_options.append(flight_info)
        
        logger.info(f"Found {len(flight_options)} flight options from {origin_iata} to {destination_iata}")
        return {'flights': flight_options}
        
    except requests.exceptions.RequestException as e:
        logger.error(f"Amadeus Flight Search API Error: {e}")
        if hasattr(e.response, 'text'):
            logger.error(f"Response: {e.response.text}")
        return _mock_flight_search(state)
    except Exception as e:
        logger.error(f"Unexpected error in flight search: {e}")
        return _mock_flight_search(state)

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
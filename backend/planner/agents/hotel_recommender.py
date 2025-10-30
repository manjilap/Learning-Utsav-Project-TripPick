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


def _get_city_iata_code(city_name: str, access_token: str) -> Optional[str]:
    """
    Gets IATA code for a city using the Amadeus Cities API.
    Uses /v1/reference-data/locations/cities endpoint for accurate city IATA codes.
    """
    if not city_name:
        return None
    
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
                return None
        else:
            logger.warning(f"No city found for '{city_name}'")
            return None
        
    except requests.exceptions.RequestException as e:
        logger.error(f"Error getting IATA code for '{city_name}': {e}")
        if hasattr(e, 'response') and hasattr(e.response, 'text'):
            logger.error(f"Response: {e.response.text}")
        return None


def search_hotels(state: Dict[str, Any]) -> Dict[str, List[Dict]]:
    """
    Searches for hotels by city using the Amadeus Hotels by City API.
    Returns hotels within 2 km radius of the destination city center.
    """
    if not AMADEUS_AVAILABLE:
        logger.warning("Amadeus credentials not available - using mock hotel data")
        return _mock_hotel_search(state)

    prefs = state.get('preferences', {})
    destination_city = prefs.get('destination')
    
    if not destination_city:
        logger.warning("Missing destination for hotel search.")
        return {'hotels': []}

    # Get access token
    access_token = _get_amadeus_token()
    if not access_token:
        logger.warning("Failed to get Amadeus access token - using mock data")
        return _mock_hotel_search(state)

    # Get IATA city code
    city_code = _get_city_iata_code(destination_city, access_token)
    if not city_code:
        logger.warning(f"Could not find IATA code for '{destination_city}' - using mock data")
        return _mock_hotel_search(state)

    # Search hotels by city with 2 km radius
    url = "https://test.api.amadeus.com/v1/reference-data/locations/hotels/by-city"
    headers = {"Authorization": f"Bearer {access_token}"}
    params = {
        "cityCode": city_code,
        "radius": "2",  # 2 km radius as requested
        "radiusUnit": "KM",
        "hotelSource": "ALL"
    }
    
    try:
        response = requests.get(url, headers=headers, params=params)
        response.raise_for_status()
        data = response.json()
        
        hotel_options = []
        for hotel in data.get("data", [])[:10]:  # Limit to first 10 hotels
            hotel_options.append({
                'id': hotel.get('hotelId', 'N/A'),
                'name': hotel.get('name', 'Unknown Hotel'),
                'chain_code': hotel.get('chainCode', 'N/A'),
                'distance': f"{hotel.get('distance', {}).get('value', 'N/A')} {hotel.get('distance', {}).get('unit', 'KM')}",
                'address': {
                    'city': hotel.get('address', {}).get('cityName', 'N/A'),
                    'country': hotel.get('address', {}).get('countryCode', 'N/A'),
                    'postal_code': hotel.get('address', {}).get('postalCode', 'N/A'),
                    'lines': hotel.get('address', {}).get('lines', [])
                },
                'geo_code': {
                    'latitude': hotel.get('geoCode', {}).get('latitude', 0),
                    'longitude': hotel.get('geoCode', {}).get('longitude', 0)
                }
            })
        
        logger.info(f"Found {len(hotel_options)} hotels within 2km of {destination_city} ({city_code})")
        return {'hotels': hotel_options}
        
    except requests.exceptions.RequestException as e:
        logger.error(f"Amadeus Hotels by City API Error: {e}")
        if hasattr(e.response, 'text'):
            logger.error(f"Response: {e.response.text}")
        return _mock_hotel_search(state)
    except Exception as e:
        logger.error(f"Unexpected error in hotel search: {e}")
        return _mock_hotel_search(state)


# Simple mock for fallback
def _mock_hotel_search(state: Dict[str, Any]) -> Dict[str, List[Dict]]:
    logger.warning("Using mock hotel search because Amadeus is unavailable.")
    # This is the same mock as before, just renamed to be a private fallback helper
    prefs = state.get('preferences', {})
    destination = prefs.get('destination', 'Unknown')
    return {'hotels': [
        {'id': 'H501', 'name': f'MOCK Grand View in {destination}', 'price_per_night': 200, 'rating': 4.5, 'amenities': ['Free Wifi', 'Pool'], 'address': destination},
    ]}
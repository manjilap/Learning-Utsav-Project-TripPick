# Amadeus API Refactoring - Access Token Authentication

## Summary of Changes

Refactored the Amadeus API integration in both `flight_recommender.py` and `hotel_recommender.py` to use direct HTTP requests with OAuth2 access token authentication instead of the Amadeus Python SDK.

## Key Changes

### 1. Flight Recommender (`backend/planner/agents/flight_recommender.py`)

**Before:**
- Used `amadeus` SDK with `Client()` initialization
- Called `AMADEUS_CLIENT.reference_data.locations.get()` for IATA codes
- Called `AMADEUS_CLIENT.shopping.flight_offers_search.get()` for flights
- Failed with 401 authentication errors

**After:**
- Uses `requests` library for direct HTTP calls
- Implements `_get_amadeus_token()` function to obtain OAuth2 access token
- Added city-to-IATA mapping dictionary for common cities (fallback)
- Updated `_get_iata_code()` to:
  - First check local CITY_IATA_MAP
  - Then call API with Bearer token: `GET /v1/reference-data/locations`
- Updated `search_flights()` to:
  - Get access token before making requests
  - Call API with Bearer token: `GET /v2/shopping/flight-offers`
  - Use proper error handling with mock fallback

### 2. Hotel Recommender (`backend/planner/agents/hotel_recommender.py`)

**Before:**
- Used `amadeus` SDK with `Client()` initialization
- Called `AMADEUS_CLIENT.reference_data.locations.get()` for geocoding
- Called `AMADEUS_CLIENT.shopping.hotel_offers.get()` for hotels
- Failed with 401 authentication errors

**After:**
- Uses `requests` library for direct HTTP calls
- Implements `_get_amadeus_token()` function (same as flight_recommender)
- Updated `search_hotels()` to:
  - Get access token before making requests
  - Call API with Bearer token: `GET /v1/reference-data/locations` for geocoding
  - Call API with Bearer token: `GET /v3/shopping/hotel-offers` for hotel search
  - Use proper error handling with mock fallback

## Authentication Flow

```
1. POST https://test.api.amadeus.com/v1/security/oauth2/token
   Headers: Content-Type: application/x-www-form-urlencoded
   Body: grant_type=client_credentials&client_id=XXX&client_secret=XXX
   
2. Receive access token in response
   
3. Use token in subsequent API calls:
   Headers: Authorization: Bearer {access_token}
```

## API Endpoints Used

### Flight Search
- **Token**: `POST /v1/security/oauth2/token`
- **Location Lookup**: `GET /v1/reference-data/locations?keyword={city}&subType=CITY,AIRPORT`
- **Flight Offers**: `GET /v2/shopping/flight-offers?originLocationCode={IATA}&destinationLocationCode={IATA}&departureDate={date}&adults={count}&currencyCode=USD&max={limit}`

### Hotel Search
- **Token**: `POST /v1/security/oauth2/token`
- **Geocoding**: `GET /v1/reference-data/locations?keyword={city}&subType=CITY`
- **Hotel Offers**: `GET /v3/shopping/hotel-offers?latitude={lat}&longitude={lon}&radius={km}&radiusUnit=KM&checkInDate={date}&checkOutDate={date}&view=FULL&bestRateOnly=true&boardType=ROOM_ONLY`

## City-to-IATA Mapping

Added local mapping for common cities to avoid unnecessary API calls:

```python
CITY_IATA_MAP = {
    'paris': 'PAR',
    'london': 'LON',
    'new york': 'NYC',
    'kathmandu': 'KTM',
    'tokyo': 'TYO',
    'dubai': 'DXB',
    'singapore': 'SIN',
    'los angeles': 'LAX',
    'bangkok': 'BKK',
    'delhi': 'DEL',
    'sydney': 'SYD',
    # Add more cities as needed
}
```

## Error Handling

Both files now include comprehensive error handling:
- If credentials are missing → Falls back to mock data
- If token retrieval fails → Falls back to mock data
- If IATA code lookup fails → Falls back to mock data
- If API calls fail (401, 403, etc.) → Falls back to mock data
- All errors are logged for debugging

## Environment Variables

Required in `backend/.env`:
```
AMADEUS_CLIENT_ID=your_client_id_here
AMADEUS_CLIENT_SECRET=your_client_secret_here
```

Get credentials from: https://developers.amadeus.com/

## Testing

To test the integration:

1. **With Valid Credentials:**
   - Add your Amadeus API credentials to `.env`
   - Make a trip planning request
   - Check logs for successful API calls
   - Verify real flight/hotel data is returned

2. **Without Credentials (Mock Mode):**
   - Leave credentials empty in `.env`
   - Make a trip planning request
   - System will automatically use mock data
   - Check logs for "using mock data" warnings

## Benefits

✅ **Proper Authentication**: Uses OAuth2 access tokens as per Amadeus documentation
✅ **Better Error Handling**: Graceful fallback to mock data on any failure
✅ **More Control**: Direct HTTP requests allow fine-tuned debugging and logging
✅ **Reduced Dependencies**: Less reliance on SDK behavior
✅ **Local Caching**: City-to-IATA mapping reduces API calls
✅ **Consistent Pattern**: Both flight and hotel use same authentication flow

## Next Steps

1. Test with valid Amadeus credentials
2. Monitor API call success/failure rates in logs
3. Expand CITY_IATA_MAP as needed for frequently used cities
4. Consider implementing token caching (tokens are valid for ~30 minutes)
5. Add retry logic for transient failures if needed

## Related Files Modified

- `backend/planner/agents/flight_recommender.py`
- `backend/planner/agents/hotel_recommender.py`

## Dependencies

- `requests==2.31.0` (already in requirements.txt)
- `python-dotenv` (already in requirements.txt)

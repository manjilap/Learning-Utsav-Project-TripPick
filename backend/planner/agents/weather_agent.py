import os
import requests
from datetime import datetime


def _safe_json(resp):
    try:
        return resp.json()
    except Exception:
        return None


def get_forecast(state):
    """Fetch a simplified 3-day forecast for the destination in `state['preferences']`.

    Returns a dict: {'weather_forecast': [ {date, temp, summary}, ... ]} on success,
    or {'weather_forecast': [], 'error': '...'} on failure.
    """
    prefs = state.get('preferences', {}) if isinstance(state, dict) else {}
    destination = prefs.get('destination') or prefs.get('to') or prefs.get('arrival')
    api_key = os.environ.get('OPENWEATHER_API_KEY')

    if not api_key:
        return {'weather_forecast': [], 'error': 'OPENWEATHER_API_KEY not set'}

    if not destination:
        return {'weather_forecast': [], 'error': 'destination not provided in preferences'}

    try:
        # 1) Geocode destination to get lat/lon
        geo_url = 'http://api.openweathermap.org/geo/1.0/direct'
        geo_params = {'q': destination, 'limit': 1, 'appid': api_key}
        gresp = requests.get(geo_url, params=geo_params, timeout=5)
        if gresp.status_code != 200:
            return {'weather_forecast': [], 'error': f'geocode failed: {gresp.status_code}'}
        gjson = _safe_json(gresp)
        if not gjson:
            return {'weather_forecast': [], 'error': 'geocode invalid json'}
        if len(gjson) == 0:
            return {'weather_forecast': [], 'error': 'geocode returned no results for destination'}

        lat = gjson[0].get('lat')
        lon = gjson[0].get('lon')
        if lat is None or lon is None:
            return {'weather_forecast': [], 'error': 'geocode missing lat/lon'}

        # 2) Call One Call API to get daily forecasts
        onecall_url = 'https://api.openweathermap.org/data/2.5/onecall'
        oc_params = {
            'lat': lat,
            'lon': lon,
            'exclude': 'minutely,hourly,alerts',
            'units': 'metric',
            'appid': api_key,
        }
        oresp = requests.get(onecall_url, params=oc_params, timeout=5)
        if oresp.status_code != 200:
            return {'weather_forecast': [], 'error': f'onecall failed: {oresp.status_code}'}
        ojson = _safe_json(oresp)
        if not ojson:
            return {'weather_forecast': [], 'error': 'onecall invalid json'}

        daily = ojson.get('daily', [])
        forecast = []
        for day in daily[:3]:
            dt = day.get('dt')
            date = datetime.utcfromtimestamp(dt).date().isoformat() if dt else None
            temp = None
            if isinstance(day.get('temp'), dict):
                temp = day['temp'].get('day')
            else:
                temp = day.get('temp')
            summary = None
            weather = day.get('weather')
            if isinstance(weather, list) and len(weather) > 0:
                summary = weather[0].get('description')

            forecast.append({'date': date, 'temp': temp, 'summary': summary})

        return {'weather_forecast': forecast}

    except requests.RequestException as re:
        return {'weather_forecast': [], 'error': f'request error: {str(re)}'}
    except Exception as e:
        return {'weather_forecast': [], 'error': f'unexpected error: {str(e)}'}

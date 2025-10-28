def search_flights(state):
    prefs = state.get('preferences', {})
    flights = [
        {
            'airline': 'SkyMock',
            'price': 150,
            'currency': 'USD',
            'departure': prefs.get('start'),
            'arrival': prefs.get('destination'),
            'duration': '3h 10m'
        }
    ]
    return {'flights': flights}

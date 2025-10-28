def search_hotels(state):
    prefs = state.get('preferences', {})
    hotels = [
        {'name': 'Mock Comfort Hotel', 'price_per_night': 45, 'currency': 'USD', 'rating': 4.1}
    ]
    return {'hotels': hotels}

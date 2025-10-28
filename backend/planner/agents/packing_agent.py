def generate_packing_list(state):
    prefs = state.get('preferences', {})
    days = int(prefs.get('Days', 3))
    base = ['Passport/ID', 'Phone & Charger', 'Toiletries', 'Medications']
    clothes = [f'{days}x casual outfit', '1x jacket', '1x swimwear']
    return {'packing_list': base + clothes}

def estimate_co2(state):
    distance_km = 1000
    emission_factor = 0.115
    return {'co2_kg': round(distance_km * emission_factor, 2)}

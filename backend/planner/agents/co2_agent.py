import logging
from typing import Dict, Any, Union

logger = logging.getLogger(__name__)

def estimate_co2(state: Dict[str, Any]) -> Dict[str, float]:
    """
    Calculates total CO2 based on ALL flight options returned by the flight agent.
    We sum the 'co2_estimate' field (assumed to be in KG) from the first 3 options.
    """
    # NOTE: The flight agent returns the list of flights under state['flights']['flights']
    flights_list = state.get('flights', {}).get('flights', [])
    
    if flights_list:
        co2_values = [
            f.get('co2_estimate', 0) 
            for f in flights_list 
            if isinstance(f.get('co2_estimate'), (int, float))
        ]
        
        # We will take the AVERAGE CO2 of the top 3 options to represent the typical trip cost.
        if co2_values:
            total_co2_kg = sum(co2_values) / len(co2_values)
        else:
            total_co2_kg = 0.0
            
    # 3. Fallback Calculation (If no flight data is available)
    else:
        # Simplified, destination-based fallback. 
        destination = state.get('preferences', {}).get('destination', '').lower()
        if 'tokyo' in destination or 'sydney' in destination:
            total_co2_kg = 2500.0 
        elif 'paris' in destination or 'london' in destination:
            total_co2_kg = 1000.0
        else:
            total_co2_kg = 500.0

    # Return the result
    return {'co2_kg': round(total_co2_kg, 2)}
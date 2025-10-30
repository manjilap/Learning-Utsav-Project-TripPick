from ..agents import packing_agent


def run(inputs: dict) -> dict:
    """
    Generate packing list based on preferences and weather forecast.
    Reads weather_forecast from the state and returns packing_list update.
    """
    state = {
        'preferences': inputs.get('preferences', {}),
        'weather_forecast': inputs.get('weather_forecast', [])
    }
    return packing_agent.generate_packing_list(state)


def REGISTER_NODE(langgraph):
    try:
        register = getattr(langgraph, 'register_node', None)
        if callable(register):
            register('packing_agent', run, description='Generate packing list (mock)')
    except Exception:
        pass

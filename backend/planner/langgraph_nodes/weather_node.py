from ..agents import weather_agent


def run(inputs: dict) -> dict:
    """Call the weather agent and return the forecast update.
    
    Returns a dict with 'weather_forecast' key that will be merged into state.
    """
    state = {'preferences': inputs.get('preferences', {})}
    result = weather_agent.get_forecast(state)
    
    # Return the result as-is - it should contain 'weather_forecast' key
    # The agent returns {'weather_forecast': [...]} or {'weather_forecast': []} on error
    return result


def REGISTER_NODE(langgraph):
    try:
        register = getattr(langgraph, 'register_node', None)
        if callable(register):
            register('weather_agent', run, description='Get weather forecast (mock)')
    except Exception:
        pass

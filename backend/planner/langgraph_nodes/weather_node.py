from ..agents import weather_agent


def run(inputs: dict) -> dict:
    """Call the weather agent and update the input state with the forecast.

    Expects inputs to be a mutable dict. The function will call
    `weather_agent.get_forecast(state)` and set `inputs['weather_forecast']`
    to the returned value (or an empty list on error). Returns the agent result.
    """
    state = {'preferences': inputs.get('preferences', {})}
    result = weather_agent.get_forecast(state)
    # Normalize and update the shared state dictionary for downstream nodes
    wf = result.get('weather_forecast') if isinstance(result, dict) else None
    inputs['weather_forecast'] = wf or []
    return result


def REGISTER_NODE(langgraph):
    try:
        register = getattr(langgraph, 'register_node', None)
        if callable(register):
            register('weather_agent', run, description='Get weather forecast (mock)')
    except Exception:
        pass

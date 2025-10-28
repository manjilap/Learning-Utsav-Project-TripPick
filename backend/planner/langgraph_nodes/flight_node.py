from ..agents import flight_recommender


def run(inputs: dict) -> dict:
    """LangGraph-compatible wrapper for flight_recommender.search_flights.

    inputs: expects {'preferences': {...}}. Returns {'flights': [...]}.
    """
    state = {'preferences': inputs.get('preferences', {})}
    return flight_recommender.search_flights(state)


def REGISTER_NODE(langgraph):
    """Optional LangGraph registration hook.

    Registers this python callable as a LangGraph node if the package is present.
    This function intentionally uses a very small API surface (langgraph.register)
    if available. If the exact LangGraph API differs this is a harmless best-effort
    registration.
    """
    try:
        register = getattr(langgraph, 'register_node', None)
        if callable(register):
            register('flight_recommender', run, description='Search flights (mock)')
    except Exception:
        pass

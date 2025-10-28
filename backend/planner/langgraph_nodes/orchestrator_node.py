from ..agents import orchestrator


def run(inputs: dict) -> dict:
    """LangGraph wrapper that calls orchestrator.orchestrate_itinerary.

    inputs: {'preferences': {...}}
    returns: the orchestrator result dict {'ok': True, 'itinerary': {...}}
    """
    state = {'preferences': inputs.get('preferences', {})}
    return orchestrator.orchestrate_itinerary(state)


def REGISTER_NODE(langgraph):
    try:
        register = getattr(langgraph, 'register_node', None)
        if callable(register):
            register('orchestrator', run, description='Run all planner agents and compose itinerary')
    except Exception:
        pass

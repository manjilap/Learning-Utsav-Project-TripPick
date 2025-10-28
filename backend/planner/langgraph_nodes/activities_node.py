from ..agents import activities_agent


def run(inputs: dict) -> dict:
    state = {'preferences': inputs.get('preferences', {})}
    return activities_agent.recommend_activities(state)


def REGISTER_NODE(langgraph):
    try:
        register = getattr(langgraph, 'register_node', None)
        if callable(register):
            register('activities_agent', run, description='Recommend activities (mock)')
    except Exception:
        pass

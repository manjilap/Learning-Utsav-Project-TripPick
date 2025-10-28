from ..agents import food_culture_agent


def run(inputs: dict) -> dict:
    state = {'preferences': inputs.get('preferences', {})}
    return food_culture_agent.recommend(state)


def REGISTER_NODE(langgraph):
    try:
        register = getattr(langgraph, 'register_node', None)
        if callable(register):
            register('food_culture_agent', run, description='Recommend local food & culture tips (mock)')
    except Exception:
        pass

from ..agents import hotel_recommender


def run(inputs: dict) -> dict:
    state = {'preferences': inputs.get('preferences', {})}
    return hotel_recommender.search_hotels(state)


def REGISTER_NODE(langgraph):
    try:
        register = getattr(langgraph, 'register_node', None)
        if callable(register):
            register('hotel_recommender', run, description='Search hotels (mock)')
    except Exception:
        pass

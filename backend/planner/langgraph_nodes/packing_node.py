from ..agents import packing_agent


def run(inputs: dict) -> dict:
    state = {'preferences': inputs.get('preferences', {})}
    return packing_agent.generate_packing_list(state)


def REGISTER_NODE(langgraph):
    try:
        register = getattr(langgraph, 'register_node', None)
        if callable(register):
            register('packing_agent', run, description='Generate packing list (mock)')
    except Exception:
        pass

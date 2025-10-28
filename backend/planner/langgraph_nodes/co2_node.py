from ..agents import co2_agent


def run(inputs: dict) -> dict:
    state = {'preferences': inputs.get('preferences', {})}
    return co2_agent.estimate_co2(state)


def REGISTER_NODE(langgraph):
    try:
        register = getattr(langgraph, 'register_node', None)
        if callable(register):
            register('co2_agent', run, description='Estimate CO2 emissions (mock)')
    except Exception:
        pass

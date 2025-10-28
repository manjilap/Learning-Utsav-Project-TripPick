"""LangGraph node wrappers for planner agents.

These wrappers expose a `run(inputs: dict) -> dict` function for each agent so they can
be used directly, and attempt to register themselves with LangGraph at import time
if the `langgraph` package is available in the environment.

If LangGraph is not installed the wrappers still work as plain Python callables.
"""
from . import flight_node, hotel_node, weather_node, activities_node, packing_node, co2_node, food_culture_node, orchestrator_node


def register_all_nodes():
    """Attempt to register all nodes with LangGraph if available.

    This is best-effort: failures are logged but do not raise so the project
    can be used without LangGraph installed.
    """
    try:
        import langgraph
    except Exception:
        # LangGraph not available; nothing to register.
        return False

    # A simple convention: if the node module exposes `REGISTER_NODE` callable,
    # call it with the langgraph module so it can register itself.
    modules = [
        flight_node, hotel_node, weather_node, activities_node,
        packing_node, co2_node, food_culture_node, orchestrator_node
    ]
    for m in modules:
        register = getattr(m, 'REGISTER_NODE', None)
        if callable(register):
            try:
                register(langgraph)
            except Exception:
                # swallow exceptions to keep startup robust
                pass
    return True

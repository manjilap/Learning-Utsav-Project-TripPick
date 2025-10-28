from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
import logging
from . import (
    flight_recommender,
    hotel_recommender,
    packing_agent,
    weather_agent,
    activities_agent,
    co2_agent,
    food_culture_agent,
)

logger = logging.getLogger(__name__)


def _local_orchestrate(request_state):
    """Fallback orchestrator that runs agents in parallel using ThreadPoolExecutor.

    This preserves the original behavior if LangGraph is not available or execution fails.
    """
    prefs = request_state.get('preferences', {})
    state = {'preferences': prefs}

    with ThreadPoolExecutor() as ex:
        futures = {
            'flights': ex.submit(flight_recommender.search_flights, state),
            'hotels': ex.submit(hotel_recommender.search_hotels, state),
            'weather': ex.submit(weather_agent.get_forecast, state),
            'activities': ex.submit(activities_agent.recommend_activities, state),
            'packing': ex.submit(packing_agent.generate_packing_list, state),
            'co2': ex.submit(co2_agent.estimate_co2, state),
            'food_culture': ex.submit(food_culture_agent.recommend, state),
        }
        results = {k: f.result() for k, f in futures.items()}

    itinerary = {
        'meta': {'budget': prefs.get('budget'), 'destination': prefs.get('destination'), 'days': prefs.get('Days')},
        'flights': results['flights'].get('flights', []),
        'hotels': results['hotels'].get('hotels', []),
        'weather': results['weather'].get('forecast', {}),
        'activities': results['activities'].get('activities', []),
        'packing_list': results['packing'].get('packing_list', []),
        'co2_kg': results['co2'].get('co2_kg'),
        'food_culture': results['food_culture'].get('food_culture', {}),
    }

    days = int(prefs.get('Days', 3))
    acts = itinerary['activities'] or []
    day_plan = []
    for d in range(days):
        day_plan.append({
            'day': d + 1,
            'activities': acts[d::days][:3] or ['Explore the local area'],
        })
    itinerary['day_plan'] = day_plan

    return {'ok': True, 'itinerary': itinerary}


def run_langgraph(preferences: dict):
    """Attempt to run the planner using LangGraph.

    The function will:
    - import graph_builder and StateGraph from the langgraph package (best-effort)
    - register nodes from backend.planner.langgraph_nodes
    - load `planner_graph.yaml` from the planner package
    - initialize the graph state with `preferences` and execute it

    If any step fails (package not installed or API mismatch) an exception is raised so the caller
    can fall back to the local orchestrator.
    """
    try:
        # Respect the user's request to import these symbols
        from langgraph import graph_builder, StateGraph  # type: ignore
    except Exception as e:
        raise RuntimeError('LangGraph not available or import failed') from e

    # Register node wrappers (best-effort)
    try:
        from ..langgraph_nodes import register_all_nodes

        register_all_nodes()
    except Exception:
        # continue even if registration fails
        logger.warning('Failed to auto-register langgraph nodes; continuing')

    # Load graph YAML
    graph_path = Path(__file__).resolve().parent.parent / 'planner_graph.yaml'
    if not graph_path.exists():
        raise FileNotFoundError(f'Planner graph not found at {graph_path}')

    # Try a few possible graph_builder APIs
    graph = None
    try:
        if hasattr(graph_builder, 'build_from_yaml'):
            graph = graph_builder.build_from_yaml(str(graph_path))
        elif hasattr(graph_builder, 'from_yaml'):
            graph = graph_builder.from_yaml(str(graph_path))
        elif hasattr(graph_builder, 'load'):
            graph = graph_builder.load(str(graph_path))
        elif hasattr(graph_builder, 'build'):
            # Some variants take the YAML string
            text = graph_path.read_text()
            graph = graph_builder.build(text)
        else:
            raise RuntimeError('Unsupported graph_builder API')
    except Exception as e:
        raise RuntimeError('Failed to build LangGraph graph') from e

    # Construct a StateGraph and set initial inputs
    try:
        sg = StateGraph(graph)
    except Exception as e:
        raise RuntimeError('Failed to construct StateGraph') from e

    # Try a few ways to set inputs
    try:
        if hasattr(sg, 'set_input'):
            sg.set_input('preferences_input', preferences)
        elif hasattr(sg, 'set_inputs'):
            sg.set_inputs({'preferences_input': preferences})
        elif hasattr(sg, 'initialize'):
            sg.initialize({'preferences_input': preferences})
        else:
            # last resort: set attribute
            setattr(sg, 'initial_state', {'preferences_input': preferences})
    except Exception:
        # Non-fatal — proceed to run and hope the graph reads external state
        logger.warning('Could not set initial state on StateGraph; proceeding to run')

    # Execute the graph using common run APIs
    try:
        if hasattr(sg, 'run'):
            result = sg.run()
        elif hasattr(sg, 'execute'):
            result = sg.execute()
        elif hasattr(sg, 'run_sync'):
            result = sg.run_sync()
        else:
            raise RuntimeError('Unsupported StateGraph run API')
    except Exception as e:
        raise RuntimeError('LangGraph execution failed') from e

    return result


def orchestrate_itinerary(request_state):
    """High-level orchestrator entrypoint.

    Tries to execute the LangGraph-driven planner first. If LangGraph is not available
    or execution fails, falls back to the original concurrent.futures-based orchestration.
    """
    prefs = request_state.get('preferences', {})
    try:
        result = run_langgraph(prefs)
        # If the LangGraph result is a dict with an 'itinerary' key, normalize output
        if isinstance(result, dict) and ('itinerary' in result or 'ok' in result):
            return result
        # otherwise, attempt to wrap common outputs
        return {'ok': True, 'itinerary': result}
    except Exception:
        logger.exception('LangGraph orchestration failed, falling back to local orchestrator')
        return _local_orchestrate(request_state)

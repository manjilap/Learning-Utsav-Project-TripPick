from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
import logging
from typing import TypedDict, Optional, Dict, Any, List, Annotated
import operator

# Imports for the agent functions (used by both local orchestrator and LangGraph nodes)
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

# ------------------------------------------------------------------------------
# LangGraph Imports and State Definition
# ------------------------------------------------------------------------------
try:
    from langgraph.graph import StateGraph, END, START
    # Import the run function from the node wrappers
    from planner.langgraph_nodes.flight_node import run as run_flights
    from planner.langgraph_nodes.hotel_node import run as run_hotels
    from planner.langgraph_nodes.weather_node import run as run_weather
    from planner.langgraph_nodes.activities_node import run as run_activities
    from planner.langgraph_nodes.packing_node import run as run_packing
    from planner.langgraph_nodes.co2_node import run as run_co2
    from planner.langgraph_nodes.food_culture_node import run as run_food_culture
    LANGGRAPH_AVAILABLE = True
except ImportError:
    # If imports fail, the top-level function will automatically fall back
    LANGGRAPH_AVAILABLE = False
    logger.warning("LangGraph components not fully available. Orchestration will rely on ThreadPoolExecutor fallback.")


# Define the State (MUST be consistent with what nodes read/write)
# Using Annotated types with operator.add to merge lists from concurrent updates
def merge_dicts(left: Optional[Dict], right: Optional[Dict]) -> Optional[Dict]:
    """Custom reducer that takes the right value if it exists, otherwise keeps left."""
    return right if right is not None else left

class ItineraryState(TypedDict):
    preferences: Dict[str, Any]
    # Agent output keys (these keys will be added to the state by the respective agent nodes)
    # Use Annotated with a reducer to handle concurrent updates safely
    flights: Annotated[Optional[Dict], merge_dicts]
    hotels: Annotated[Optional[Dict], merge_dicts]
    weather_forecast: Annotated[Optional[List], merge_dicts]
    activities: Annotated[Optional[Dict], merge_dicts]
    packing_list: Annotated[Optional[Dict], merge_dicts]  # Use reducer to handle potential conflicts
    co2_kg: Annotated[Optional[Dict], merge_dicts]
    food_culture: Annotated[Optional[Dict], merge_dicts]


# ------------------------------------------------------------------------------
# Fallback Orchestrator (Original Logic - KEPT)
# ------------------------------------------------------------------------------
def _local_orchestrate(request_state):
    """Fallback orchestrator that runs agents in parallel using ThreadPoolExecutor."""
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
        # NOTE: Keys here must match the final structure expected by the frontend
        'flights': results['flights'].get('flights', []),
        'hotels': results['hotels'].get('hotels', []),
        'weather': {'forecast': results['weather'].get('weather_forecast', [])},
        'activities': results['activities'].get('activities', []),
        'packing_list': results['packing'].get('packing_list', []),
        'co2_kg': results['co2'].get('co2_kg', 0),
        'food_culture': results['food_culture'].get('food_culture', {}),
    }

    days = int(prefs.get('Days', 3))
    acts = itinerary['activities'] or []
    day_plan = []
    # Day Plan logic remains the same
    for d in range(days):
        day_plan.append({
            'day': d + 1,
            'activities': acts[d::days][:3] or ['Explore the local area'],
        })
    itinerary['day_plan'] = day_plan

    return {'ok': True, 'itinerary': itinerary}


# ------------------------------------------------------------------------------
# LangGraph Orchestrator Logic
# ------------------------------------------------------------------------------

# Helper Node: Consolidator (a required merge point for parallel branches)
def consolidate_results(state: ItineraryState):
    """
    Passthrough node to act as a merge point for parallel paths.
    All agent outputs are merged into the state automatically.
    """
    return state


def build_full_planner_graph():
    """Defines and compiles the full LangGraph workflow."""
    if not LANGGRAPH_AVAILABLE:
        raise RuntimeError("LangGraph is not available to build the graph.")
        
    workflow = StateGraph(ItineraryState)
    
    # 1. Define Agent Nodes
    workflow.add_node("flights", run_flights)
    workflow.add_node("hotels", run_hotels)
    workflow.add_node("weather", run_weather)
    workflow.add_node("activities", run_activities)
    workflow.add_node("co2", run_co2)
    workflow.add_node("food_culture", run_food_culture)
    workflow.add_node("packing", run_packing)
    workflow.add_node("consolidator", consolidate_results) # Final Merge

    # 2. Define Edges (The flow)

    # 2a. Parallel Execution: All independent agents run from START
    workflow.add_edge(START, "flights")
    workflow.add_edge(START, "hotels")
    workflow.add_edge(START, "weather")
    workflow.add_edge(START, "activities")
    workflow.add_edge(START, "co2")
    workflow.add_edge(START, "food_culture")
    
    # 2b. Dependent Execution: Packing runs after Weather
    workflow.add_edge("weather", "packing") 
    
    # 2c. Merge All Paths: All terminal nodes in a path go to the 'consolidator'
    workflow.add_edge("flights", "consolidator")
    workflow.add_edge("hotels", "consolidator")
    workflow.add_edge("activities", "consolidator")
    workflow.add_edge("co2", "consolidator")
    workflow.add_edge("food_culture", "consolidator")
    workflow.add_edge("packing", "consolidator") # The end of the dependent path
    
    # 2d. Final Edge
    workflow.add_edge("consolidator", END)

    return workflow.compile()


def run_langgraph(preferences: dict):
    """Runs the full itinerary planning using the compiled LangGraph."""
    
    if not LANGGRAPH_AVAILABLE:
        raise RuntimeError("LangGraph is not fully initialized.")

    # 1. Build the graph (Build once per run for simplicity, but optimize for production)
    try:
        app = build_full_planner_graph()
    except Exception as e:
        raise RuntimeError(f"Failed to build LangGraph: {e}")

    # 2. Initialize State
    # Note: Use the actual ItineraryState keys as defined in the TypedDict
    initial_state: ItineraryState = {
        'preferences': preferences, 
        'flights': None, 'hotels': None, 'weather_forecast': None, 
        'activities': None, 'packing_list': None, 'co2_kg': None, 
        'food_culture': None
    }
    
    # 3. Execute
    final_state = app.invoke(initial_state)

    # 4. Consolidate and Normalize Output to match the _local_orchestrate format
    # This ensures the Django view doesn't break
    consolidated_itinerary = {
        'meta': {'budget': preferences.get('budget'), 'destination': preferences.get('destination'), 'days': preferences.get('Days')},
        # NOTE: Keys here must match the final structure expected by the frontend
        # The .get('key', {}) is crucial because the agent output is merged onto the state.
        'flights': final_state.get('flights', []), 
        'hotels': final_state.get('hotels', []),
        # Ensure 'weather' key matches what the local orchestrator expects
        'weather': {'forecast': final_state.get('weather_forecast', [])}, 
        'activities': final_state.get('activities', []),
        'packing_list': final_state.get('packing_list', []),
        'co2_kg': final_state.get('co2_kg', 0),  # Default to 0, not {}
        'food_culture': final_state.get('food_culture', {}),
    }

    # Replicate the Day Plan logic from _local_orchestrate
    days = int(preferences.get('Days', 3))
    acts = consolidated_itinerary['activities'] or []
    day_plan = []
    for d in range(days):
        day_plan.append({
            'day': d + 1,
            'activities': acts[d::days][:3] or ['Explore the local area'],
        })
    consolidated_itinerary['day_plan'] = day_plan

    return {'ok': True, 'itinerary': consolidated_itinerary}


def orchestrate_itinerary(request_state):
    """
    High-level orchestrator entrypoint.

    Tries to execute the LangGraph-driven planner first. If LangGraph is not available
    or execution fails, falls back to the original concurrent.futures-based orchestration.
    """
    prefs = request_state.get('preferences', {})
    if LANGGRAPH_AVAILABLE:
        try:
            result = run_langgraph(prefs)
            # Check for standard output format from run_langgraph
            if isinstance(result, dict) and 'itinerary' in result:
                return result
            # Fallback for unexpected format from a complex graph
            return {'ok': True, 'itinerary': result} 
        except Exception:
            logger.exception('LangGraph orchestration failed, falling back to local orchestrator')
            return _local_orchestrate(request_state)
    else:
        # If imports failed at startup, skip the try/except block
        return _local_orchestrate(request_state)
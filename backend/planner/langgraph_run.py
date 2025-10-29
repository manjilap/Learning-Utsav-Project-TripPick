import os
import sys
import django
from pprint import pprint
from typing import TypedDict, Optional, Dict, Any

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

try:
    from langgraph.graph import StateGraph, END
except ImportError:
    print("ERROR: LangGraph not installed. Please run: pip install langgraph langchain-core")
    sys.exit(1)

# ------------------------------------------------------------------------------
# 3. Import Node Wrappers
# NOTE: Adjust these imports if your actual function names in *_node.py differ.
# We assume each module has a 'run' function that accepts state and returns a dict.
# ------------------------------------------------------------------------------
from planner.langgraph_nodes.weather_node import run as run_weather
from planner.langgraph_nodes.packing_node import run as run_packing
from planner.langgraph_nodes.flight_node import run as run_flights
from planner.langgraph_nodes.hotel_node import run as run_hotels

# ------------------------------------------------------------------------------
# 4. Define State
# This must match the keys your agents expect to read/write.
# ------------------------------------------------------------------------------
class PlannerState(TypedDict):
    preferences: Dict[str, Any]          # Input from user
    weather_forecast: Optional[Dict]     # Output from Weather Agent
    packing_list: Optional[Dict]         # Output from Packing Agent
    # Add others as you expand:
    flights: Optional[Dict]
    hotels: Optional[Dict]
    # itinerary: Optional[Dict]

# ------------------------------------------------------------------------------
# 5. Define the Graph Workflow
# ------------------------------------------------------------------------------
def build_smoke_test_graph():
    """
    Builds a simple sequential graph: Start -> Weather -> Packing -> End
    This proves data flows correctly between nodes.
    """
    # Initialize graph with our state structure
    workflow = StateGraph(PlannerState)

    # Add nodes (register the python functions)
    workflow.add_node("weather_agent", run_weather)
    workflow.add_node("packing_agent", run_packing)
    workflow.add_node("flight_recommender", run_flights)
    workflow.add_node("hotel_recommender", run_hotels)

    # Define flow (edges)
    # 1. Start at Weather
    workflow.set_entry_point("weather_agent")
    # 2. After Weather finishes, go to Packing
    workflow.add_edge("weather_agent", "packing_agent")
    # 3. After Packing finishes, End
    workflow.add_edge("packing_agent", "flight_recommender")
    workflow.add_edge("flight_recommender", "hotel_recommender")
    workflow.add_edge("hotel_recommender", END)

    # Compile into a runnable application
    return workflow.compile()

# ------------------------------------------------------------------------------
# 6. Run the Test
# ------------------------------------------------------------------------------
def test_graph_execution():
    print("🚀 Starting LangGraph Smoke Test...")

    # 1. Define Mock Input Data
    initial_state = {
        "preferences": {
            "destination": "Paris",
            "start_date": "2025-05-01",
            "end_date": "2025-05-05",
            "Days": 5,
            "budget": 1500
        }
    }
    print(f"📥 Initial State provided: {initial_state['preferences']['destination']}")

    # 2. Build Graph
    app = build_smoke_test_graph()

    # 3. Invoke Graph
    # .invoke(state) runs the graph to completion and returns the final state.
    try:
        final_state = app.invoke(initial_state)

        print("\n✅ Smoke Test Complete! Final State Output:")
        print("-" * 40)
        # Pretty print only the relevant parts to avoid clutter
        print("🌤️ Weather Output:", final_state.get('weather_forecast', 'N/A'))
        print("🎒 Packing List Output:", final_state.get('packing_list', 'N/A'))
        print("-" * 40)

        if final_state.get('weather_forecast') and final_state.get('packing_list'):
             print("🎉 SUCCESS: Data flowed through both nodes!")
        else:
             print("⚠️ WARNING: Some nodes did not return data.")

    except Exception as e:
        print(f"\n❌ ERROR during graph execution: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_graph_execution()
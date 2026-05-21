import logging
from typing import Dict, Any, List, TypedDict
from app.pipeline.memory import spatial_memory

logger = logging.getLogger("AgentOrchestrator")

class AgentState(TypedDict):
    user_query: str
    detected_objects: List[Dict[str, Any]]
    gesture: str
    retrieved_memory: List[Dict[str, Any]]
    navigation_coords: List[float]
    agent_logs: List[Dict[str, str]]
    system_plan: List[str]
    final_response: str
    current_agent: str

class MultiAgentOrchestrator:
    def __init__(self):
        pass

    def run_vision_agent(self, state: AgentState) -> AgentState:
        """
        Vision Agent: Decodes optical layers and spatial shapes.
        """
        state["current_agent"] = "Vision"
        objects_str = ", ".join([o["label"] for o in state["detected_objects"]])
        
        log_msg = f"Optical overlay analysis complete. Bounding coordinates locked on: {objects_str}."
        state["agent_logs"].append({"agent": "Vision", "message": log_msg})
        state["system_plan"].append("Process optical coordinates through spatial vector cache.")
        return state

    def run_memory_agent(self, state: AgentState) -> AgentState:
        """
        Memory Agent: Queries Vector databases & relationships graph.
        """
        state["current_agent"] = "Memory"
        query = state["user_query"]
        
        # If user query is empty, query database for closest detected object
        if not query and state["detected_objects"]:
            query = state["detected_objects"][0]["label"]
            
        retrieved = spatial_memory.query_vector_rag(query)
        state["retrieved_memory"] = retrieved
        
        if retrieved:
            log_msg = f"Retrieved spatial RAG context for '{query}': Found '{retrieved[0]['name']}'. Coordinate anchor: {retrieved[0]['coords']}."
        else:
            log_msg = "No spatial memory anchors located for target. Generating zero-point temporary coordinate vector."
            
        state["agent_logs"].append({"agent": "Memory", "message": log_msg})
        return state

    def run_navigation_agent(self, state: AgentState) -> AgentState:
        """
        Navigation Agent: Resolves spatial coordinate pathways.
        """
        state["current_agent"] = "Navigation"
        
        target_found = False
        coords = [0.0, 0.0, 0.0]
        
        if state["retrieved_memory"]:
            coords = state["retrieved_memory"][0]["coords"]
            target_found = True
            
        state["navigation_coords"] = coords
        
        if target_found:
            log_msg = f"Navigation path resolved. Drawing laser path to anchor target at vector {coords}."
        else:
            log_msg = "HUD Navigation indicators passive. Awaiting explicit spatial targets."
            
        state["agent_logs"].append({"agent": "Navigation", "message": log_msg})
        return state

    def run_voice_agent(self, state: AgentState) -> AgentState:
        """
        Voice Agent: Synthesizes final conversational outcome and speech parameters.
        """
        state["current_agent"] = "Voice"
        
        # Construct dynamic smart-glasses dialog based on multi-agent outputs
        query = state["user_query"]
        retrieved = state["retrieved_memory"]
        
        if retrieved:
            target_name = retrieved[0]["name"]
            target_desc = retrieved[0]["description"]
            coords = retrieved[0]["coords"]
            
            response = f"I have located the {target_name} at coordinate parameters {coords}. {target_desc} Immersive laser pathway has been mapped onto your HUD."
        elif query:
            response = f"Operative command processed: '{query}'. Multi-agent planning mesh is evaluated, but no matches were found in spatial RAG."
        else:
            response = "Standing by. Point your glasses at lab nodes or query voice systems to request environmental analytics."
            
        state["final_response"] = response
        state["agent_logs"].append({
            "agent": "Voice", 
            "message": f"Response compiled. Queueing voice stream synthesis: '{response[:40]}...'"
        })
        return state

    def execute_workflow(self, user_query: str, detected_objects: List[Dict[str, Any]], gesture: str) -> Dict[str, Any]:
        """
        Executes sequential LangGraph node transitions on the AgentState dictionary.
        """
        # Initialise State
        state: AgentState = {
            "user_query": user_query,
            "detected_objects": detected_objects,
            "gesture": gesture,
            "retrieved_memory": [],
            "navigation_coords": [],
            "agent_logs": [],
            "system_plan": [],
            "final_response": "",
            "current_agent": "Idle"
        }

        # Transition sequence: Vision -> Memory -> Navigation -> Voice
        state = self.run_vision_agent(state)
        state = self.run_memory_agent(state)
        state = self.run_navigation_agent(state)
        state = self.run_voice_agent(state)
        
        return {
            "response": state["final_response"],
            "logs": state["agent_logs"],
            "navigation_coords": state["navigation_coords"],
            "active_agent": "Idle"
        }

agent_orchestrator = MultiAgentOrchestrator()

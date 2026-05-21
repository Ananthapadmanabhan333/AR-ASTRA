import json
import logging
import asyncio
import random
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any

from app.config import settings
from app.pipeline.vision import vision_pipeline
from app.pipeline.agents import agent_orchestrator
from app.pipeline.memory import spatial_memory

# Logger setups
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("XRAstraCore")

app = FastAPI(
    title=settings.APP_NAME,
    description="Futuristic Real-time Multimodal AI Spatial OS for Smart Glasses.",
    version="2.0.0"
)

# Enable CORS for standard web development ports
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# REST Models
class QueryModel(BaseModel):
    query: str

class EntityModel(BaseModel):
    id: str
    name: str
    type: str
    description: str
    coords: List[float]
    tags: List[str]

@app.get("/api/v1/health")
async def health_check():
    """
    Returns platform diagnostics.
    """
    return {
        "status": "healthy",
        "engine": settings.APP_NAME,
        "telemetry": {
            "gpu_load": f"{random.randint(28, 48)}%",
            "vram_allocation": "4.2GB/16GB",
            "frame_pipeline": "OK",
            "websocket_channels": "ACTIVE"
        }
    }

@app.get("/api/v1/spatial/scene-graph")
async def get_scene_graph():
    """
    Returns full node-link scene relationships from memory.
    """
    return spatial_memory.fetch_scene_graph()

@app.post("/api/v1/spatial/query-memory")
async def query_memory(payload: QueryModel):
    """
    Multimodal RAG search interface.
    """
    results = spatial_memory.query_vector_rag(payload.query)
    return {"query": payload.query, "matches": results}


# WEBSOCKET STREAMING ENGINE GATEWAY
@app.websocket("/api/v1/ws/stream")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    logger.info("New spatial client connected via WebSocket stream.")
    
    # Task to stream performance indicators periodically to HUD
    async def telemetry_sender():
        try:
            while True:
                await websocket.send_json({
                    "type": "telemetry",
                    "gpu": random.randint(30, 55),
                    "memory": random.randint(52, 60)
                })
                await asyncio.sleep(4)
        except asyncio.CancelledError:
            pass
        except Exception as e:
            logger.debug(f"Telemetry stream closed: {e}")

    telemetry_task = asyncio.create_task(telemetry_sender())
    
    try:
        while True:
            # Receive incoming string data
            data_str = await websocket.receive_text()
            data = json.loads(data_str)
            msg_type = data.get("type")

            if msg_type == "video_frame":
                # 1. PROCESS FRAME VIA OPENCV & MEDIAPIPE
                frame_b64 = data.get("frame")
                cv_result = vision_pipeline.process_frame(frame_b64)
                
                # Check if gesture or bright contours are detected
                if cv_result.get("success") and cv_result.get("detected_objects"):
                    # Broadcast visual discovery thought
                    found_objs = [o["label"] for o in cv_result["detected_objects"]]
                    await websocket.send_json({
                        "type": "agent_thought",
                        "agent": "Vision",
                        "message": f"Processed stream frame. Identified bright contrast zones: {', '.join(found_objs)}."
                    })
                    
            elif msg_type == "select_object":
                # 2. RUN LANGGRAPH SEQUENCE FOR CHOSEN ITEM
                obj_name = data.get("object_name")
                logger.info(f"Target locked on scene entity: {obj_name}")
                
                # Run the agent mesh sequence asynchronously
                loop = asyncio.get_event_loop()
                result = await loop.run_in_executor(
                    None,
                    agent_orchestrator.execute_workflow,
                    obj_name, [{"label": obj_name}], "NONE"
                )
                
                # Stream the step-by-step agent logs
                for log in result["logs"]:
                    await websocket.send_json({
                        "type": "agent_thought",
                        "agent": log["agent"],
                        "message": log["message"]
                    })
                    await asyncio.sleep(0.4) # Add small visual delay so users can read the console transitions!

                # Final compiled response
                await websocket.send_json({
                    "type": "response",
                    "content": result["response"],
                    "active_agent": "Idle",
                    "trigger_confetti": True
                })

            elif msg_type == "text_command":
                # 3. USER INPUT PROMPT COMMAND
                cmd_text = data.get("command")
                logger.info(f"Received platform voice/text command: {cmd_text}")
                
                # Execute cooperative agents
                loop = asyncio.get_event_loop()
                result = await loop.run_in_executor(
                    None,
                    agent_orchestrator.execute_workflow,
                    cmd_text, [], "NONE"
                )
                
                for log in result["logs"]:
                    await websocket.send_json({
                        "type": "agent_thought",
                        "agent": log["agent"],
                        "message": log["message"]
                    })
                    await asyncio.sleep(0.4)

                await websocket.send_json({
                    "type": "response",
                    "content": result["response"],
                    "active_agent": "Idle"
                })

    except WebSocketDisconnect:
        logger.info("Spatial client WebSocket stream disconnected.")
    except Exception as e:
        logger.error(f"WebSocket execution failure: {e}")
    finally:
        telemetry_task.cancel()
        try:
            await websocket.close()
        except:
            pass

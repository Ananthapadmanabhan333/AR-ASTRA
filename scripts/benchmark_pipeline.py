import time
import base64
import numpy as np
import cv2
import sys
import os

# Append project paths to resolve module references
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'ai-backend')))

from app.pipeline.vision import vision_pipeline
from app.pipeline.agents import agent_orchestrator
from app.pipeline.memory import spatial_memory

def run_benchmarks():
    print("====================================================")
    print("           XR ASTRA SYSTEM PERFORMANCE BENCHMARKS  ")
    print("====================================================")
    
    # 1. Generate standard mock frame
    img = np.zeros((480, 640, 3), dtype=np.uint8)
    cv2.putText(img, "Astra Benchmark Stream", (50, 100), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
    _, buffer = cv2.imencode('.jpg', img)
    base64_str = base64.b64encode(buffer).decode('utf-8')
    
    # Run test pipeline iteration to warm up SQLite cache and class attributes
    _ = vision_pipeline.process_frame(base64_str)
    _ = agent_orchestrator.execute_workflow("Find Sycamore CPU", [{"label": "Sycamore"}], "NONE")
    
    iterations = 50
    print(f"Executing {iterations} consecutive stream frames diagnostics...")
    
    t_vision_total = 0.0
    t_agent_total = 0.0
    t_memory_total = 0.0
    t_total = 0.0
    
    for i in range(iterations):
        t_start = time.perf_counter()
        
        # Bench vision stage
        t0 = time.perf_counter()
        cv_result = vision_pipeline.process_frame(base64_str)
        t_vision_total += (time.perf_counter() - t0)
        
        # Bench RAG memory queries
        t1 = time.perf_counter()
        _ = spatial_memory.query_vector_rag("Sycamore Quantum CPU")
        t_memory_total += (time.perf_counter() - t1)
        
        # Bench multi-agent routing
        t2 = time.perf_counter()
        _ = agent_orchestrator.execute_workflow("Sycamore Quantum CPU", [{"label": "Sycamore"}], "NONE")
        t_agent_total += (time.perf_counter() - t2)
        
        t_total += (time.perf_counter() - t_start)

    avg_vision = (t_vision_total / iterations) * 1000
    avg_mem = (t_memory_total / iterations) * 1000
    avg_agent = (t_agent_total / iterations) * 1000
    avg_total = (t_total / iterations) * 1000
    
    print("\n---------------- RESULTS TELEMETRY -----------------")
    print(f"1. OPTICAL DECODING & landmark EXTRACT: {avg_vision:.2f} ms")
    print(f"2. VECTOR RAG RETRIEVAL:               {avg_mem:.2f} ms")
    print(f"3. COGNITIVE AGENT ROUTING:            {avg_agent:.2f} ms")
    print(f"----------------------------------------------------")
    print(f"TOTAL SYSTEM LATENCY (END-TO-END):     {avg_total:.2f} ms")
    print("----------------------------------------------------")
    
    # Grade performance
    if avg_total < 50:
        print("PERFORMANCE RATING: ULTRA-LOW LATENCY OK (GRADE A+)")
    elif avg_total < 100:
        print("PERFORMANCE RATING: EDGE COMPATIBLE OK (GRADE A)")
    else:
        print("PERFORMANCE RATING: PIPELINE OK (GRADE B)")
    print("====================================================")

if __name__ == "__main__":
    run_benchmarks()

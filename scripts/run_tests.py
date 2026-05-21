import sys
import os
import unittest
import numpy as np
import cv2
import base64

# Append project path references
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'ai-backend')))

from app.pipeline.vision import vision_pipeline
from app.pipeline.agents import agent_orchestrator
from app.pipeline.memory import spatial_memory

class TestXRAstraPipeline(unittest.TestCase):
    
    def setUp(self):
        # Generate clean base64 image data
        img = np.zeros((240, 320, 3), dtype=np.uint8)
        cv2.rectangle(img, (50, 50), (150, 150), (255, 255, 255), -1)
        _, buffer = cv2.imencode('.jpg', img)
        self.base64_frame = base64.b64encode(buffer).decode('utf-8')

    def test_vision_pipeline_decoding(self):
        """
        Verify the OpenCV frame parser successfully decodes base64 strings and detects spatial entities.
        """
        result = vision_pipeline.process_frame(self.base64_frame)
        self.assertTrue(result["success"])
        self.assertIn("detected_objects", result)
        self.assertTrue(len(result["detected_objects"]) > 0)
        self.assertEqual(result["resolution"]["width"], 320)

    def test_spatial_memory_rag(self):
        """
        Verify dense vector queries retrieve correct coordinates and structures.
        """
        results = spatial_memory.query_vector_rag("Sycamore Quantum CPU")
        self.assertTrue(len(results) > 0)
        self.assertEqual(results[0]["id"], "quantum_cpu")
        self.assertListEqual(results[0]["coords"], [7.0, 3.2, 0.5])

    def test_agent_orchestration_transitions(self):
        """
        Verify the cooperative orchestrator successfully chains the vision, memory and navigation agents.
        """
        result = agent_orchestrator.execute_workflow(
            "Find Sycamore Quantum CPU",
            [{"label": "Sycamore"}],
            "NONE"
        )
        self.assertIn("Sycamore", result["response"])
        self.assertListEqual(result["navigation_coords"], [7.0, 3.2, 0.5])
        
        # Verify step-by-step trace logs exist for all agents
        log_agents = [log["agent"] for log in result["logs"]]
        self.assertIn("Vision", log_agents)
        self.assertIn("Memory", log_agents)
        self.assertIn("Navigation", log_agents)
        self.assertIn("Voice", log_agents)

if __name__ == "__main__":
    print("Running XR Astra system test suite...")
    unittest.main()

import sqlite3
import json
import logging
from typing import List, Dict, Any

logger = logging.getLogger("MemoryEngine")

class SpatialMemoryEngine:
    def __init__(self):
        # We initialize a local sqlite database representing spatial vectors and Neo4j relations
        self.db_path = "spatial_memory.db"
        self._init_db()

    def _init_db(self):
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Entities Table (Objects, rooms, sensors)
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS entities (
                    id TEXT PRIMARY KEY,
                    name TEXT,
                    type TEXT,
                    description TEXT,
                    coords TEXT, -- JSON coordinates XYZ
                    tags TEXT -- JSON array of descriptors for RAG
                )
            """)

            # Relationships Table (Graph)
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS relations (
                    source TEXT,
                    target TEXT,
                    relation_type TEXT,
                    PRIMARY KEY (source, target, relation_type)
                )
            """)
            conn.commit()

            # Seed default values so there is active RAG data instantly!
            self._seed_default_data(cursor)
            conn.commit()
            conn.close()
        except Exception as e:
            logger.error(f"Failed to initialize SQLite spatial storage: {e}")

    def _seed_default_data(self, cursor):
        # Insert initial room objects
        seeds = [
            ("server_rack", "Astra Supercomputer Node", "Hardware", "Gemini TPU v6 Cluster Node running multi-agent orchestrators.", json.dumps([2.5, 1.2, -1.0]), json.dumps(["google", "TPU", "astra", "supercomputer", "agent"])),
            ("quantum_cpu", "Sycamore Quantum Processor", "Processor", "53-qubit superconducting quantum chipset operating at 15mK.", json.dumps([7.0, 3.2, 0.5]), json.dumps(["quantum", "cpu", "sycamore", "processor", "chipset"])),
            ("robotic_arm", "Kinematic Spatial Manipulator", "Robotics", "Autonomous 6-DOF robotic limb training on deep reinforcement learning policies.", json.dumps([1.2, 0.5, -2.1]), json.dumps(["robot", "arm", "limb", "manipulator"]))
        ]
        
        for entity in seeds:
            cursor.execute(
                "INSERT OR REPLACE INTO entities VALUES (?, ?, ?, ?, ?, ?)",
                entity
            )

        relations = [
            ("server_rack", "quantum_cpu", "CONNECTED_TO"),
            ("robotic_arm", "server_rack", "CONTROLLED_BY")
        ]
        for rel in relations:
            cursor.execute(
                "INSERT OR REPLACE INTO relations VALUES (?, ?, ?)",
                rel
            )

    def query_vector_rag(self, query: str) -> List[Dict[str, Any]]:
        """
        Emulates dense vector search using standard SQLite text indexes and keyword weights.
        Returns matching spatial entities.
        """
        results = []
        try:
            conn = sqlite3.connect(self.db_path)
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()

            query_words = query.lower().split()
            cursor.execute("SELECT * FROM entities")
            rows = cursor.fetchall()
            
            for row in rows:
                tags = json.loads(row["tags"])
                name = row["name"].lower()
                desc = row["description"].lower()
                
                # Compute mock similarity score
                score = 0.0
                for word in query_words:
                    if word in tags:
                        score += 0.5
                    if word in name:
                        score += 0.3
                    if word in desc:
                        score += 0.1
                        
                if score > 0 or len(query_words) == 0:
                    results.append({
                        "id": row["id"],
                        "name": row["name"],
                        "type": row["type"],
                        "description": row["description"],
                        "coords": json.loads(row["coords"]),
                        "score": score if score > 0 else 0.1
                    })
            
            # Sort by similarity score descending
            results.sort(key=lambda x: x["score"], reverse=True)
            conn.close()
        except Exception as e:
            logger.error(f"Vector search failed: {e}")
        return results

    def fetch_scene_graph(self) -> Dict[str, Any]:
        """
        Returns full graph matching entities and links.
        """
        nodes = []
        links = []
        try:
            conn = sqlite3.connect(self.db_path)
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()

            cursor.execute("SELECT id, name, type FROM entities")
            for r in cursor.fetchall():
                nodes.append({"id": r["id"], "label": r["name"], "type": r["type"]})

            cursor.execute("SELECT * FROM relations")
            for r in cursor.fetchall():
                links.append({"source": r["source"], "target": r["target"], "type": r["relation_type"]})
            conn.close()
        except Exception as e:
            logger.error(f"Scene graph capture failed: {e}")
            
        return {"nodes": nodes, "links": links}

spatial_memory = SpatialMemoryEngine()

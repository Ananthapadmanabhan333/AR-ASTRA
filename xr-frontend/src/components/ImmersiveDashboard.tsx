import React, { useState, useRef, useEffect } from 'react';
import { Send, BarChart2, Zap, Sliders, Globe, RefreshCcw, Database } from 'lucide-react';

interface ImmersiveDashboardProps {
  onSendMessage: (msg: string) => void;
  onActionTrigger: (action: string) => void;
  gpuUsage: number;
  memoryUsage: number;
}

interface Node {
  id: string;
  label: string;
  x: number;
  y: number;
  type: 'room' | 'object' | 'agent';
}

interface Link {
  source: string;
  target: string;
}

export const ImmersiveDashboard: React.FC<ImmersiveDashboardProps> = ({
  onSendMessage,
  onActionTrigger,
  gpuUsage,
  memoryUsage
}) => {
  const [inputText, setInputText] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Graph nodes representation of the scene graph (Sycamore CPU, Astra Server, robotic limb)
  const nodes: Node[] = [
    { id: '1', label: 'Main Lab Area', x: 150, y: 80, type: 'room' },
    { id: '2', label: 'Astra Supercomputer', x: 70, y: 150, type: 'object' },
    { id: '3', label: 'Sycamore Quantum CPU', x: 230, y: 150, type: 'object' },
    { id: '4', label: 'Robotic Manipulator', x: 150, y: 220, type: 'object' }
  ];

  const links: Link[] = [
    { source: '1', target: '2' },
    { source: '1', target: '3' },
    { source: '1', target: '4' },
    { source: '2', target: '3' }
  ];

  // Draw simulated spatial scene graph
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrame: number;
    let offset = 0;

    const drawGraph = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const height = canvas.height;

      // Draw cyber space matrix grids
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.05)';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw connections
      ctx.strokeStyle = 'rgba(168, 85, 247, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 4]);
      links.forEach(link => {
        const fromNode = nodes.find(n => n.id === link.source);
        const toNode = nodes.find(n => n.id === link.target);
        if (fromNode && toNode) {
          ctx.beginPath();
          ctx.moveTo(fromNode.x, fromNode.y);
          ctx.lineTo(toNode.x, toNode.y);
          ctx.stroke();
        }
      });
      ctx.setLineDash([]);

      // Draw Nodes
      nodes.forEach(node => {
        // Glowing aura around nodes
        const isRoom = node.type === 'room';
        const nodeColor = isRoom ? '#06b6d4' : '#a855f7';
        
        ctx.beginPath();
        ctx.arc(node.x, node.y, isRoom ? 10 : 7, 0, Math.PI * 2);
        ctx.fillStyle = nodeColor;
        ctx.shadowBlur = 12;
        ctx.shadowColor = nodeColor;
        ctx.fill();
        ctx.shadowBlur = 0; // reset

        // Draw circles around nodes
        ctx.beginPath();
        ctx.arc(node.x, node.y, isRoom ? 18 : 14, 0, Math.PI * 2);
        ctx.strokeStyle = isRoom ? 'rgba(6, 182, 212, 0.25)' : 'rgba(168, 85, 247, 0.25)';
        ctx.stroke();

        // Node Label
        ctx.fillStyle = '#f3f4f6';
        ctx.font = 'bold 9px Orbitron, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(node.label.toUpperCase(), node.x, node.y - (isRoom ? 24 : 18));
      });

      offset += 0.2;
      animFrame = requestAnimationFrame(drawGraph);
    };

    drawGraph();

    return () => cancelAnimationFrame(animFrame);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  return (
    <div className="glass-panel p-4 flex flex-col gap-4">
      {/* Telemetry Dashboard Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-1">
        <div className="flex items-center gap-2">
          <BarChart2 className="w-4.5 h-4.5 text-cyan-400" />
          <span className="font-display font-bold text-xs tracking-wider text-white">SPATIAL TELEMETRY PIPELINE</span>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => onActionTrigger('reset')} 
            className="p-1 rounded bg-slate-900 text-slate-400 hover:text-white border border-white/5"
            title="Reset scene graph"
          >
            <RefreshCcw className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* 1. DYNAMIC SYSTEM PERFORMANCE METRICS */}
      <div className="grid grid-cols-2 gap-3 bg-slate-950/80 p-3 rounded-xl border border-white/5">
        <div className="flex flex-col gap-1">
          <span className="font-mono text-[9px] text-slate-500 uppercase font-bold flex items-center gap-1">
            <Zap className="w-3 h-3 text-yellow-400" /> GPU PIPELINE CORE
          </span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-xl font-bold text-white tracking-tight font-display">{gpuUsage}%</span>
            <span className="text-[10px] text-emerald-400 font-mono">ACTIVE</span>
          </div>
          <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden mt-1">
            <div className="bg-cyan-500 h-full rounded-full transition-all duration-500" style={{ width: `${gpuUsage}%` }} />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <span className="font-mono text-[9px] text-slate-500 uppercase font-bold flex items-center gap-1">
            <Sliders className="w-3 h-3 text-purple-400" /> GRAPH MEM ALLOC
          </span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-xl font-bold text-white tracking-tight font-display">{memoryUsage}%</span>
            <span className="text-[10px] text-purple-400 font-mono">4.2GB/16GB</span>
          </div>
          <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden mt-1">
            <div className="bg-purple-500 h-full rounded-full transition-all duration-500" style={{ width: `${memoryUsage}%` }} />
          </div>
        </div>
      </div>

      {/* 2. THREE.JS/CANVAS SPATIAL SCENE GRAPH VIEWPORT */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 font-bold border-b border-white/5 pb-1">
          <div className="flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-purple-400" />
            <span>ROOM ENTITY RELATIONSHIPS MAP</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-[9px] uppercase">RAG ENGAGED</span>
          </div>
        </div>
        
        {/* Canvas for node graph */}
        <div className="w-full h-44 bg-slate-950/80 rounded-xl relative overflow-hidden border border-white/5 flex items-center justify-center">
          <canvas ref={canvasRef} width="300" height="176" className="w-full h-full mix-blend-screen" />
          
          <div className="absolute top-2 left-2 font-mono text-[8px] bg-slate-900/60 px-1.5 py-0.5 rounded text-cyan-400 border border-cyan-500/10">
            ENTITIES: 4 // LINKS: 4
          </div>
        </div>
      </div>

      {/* 3. MULTIMODAL PROMPT INJECTION CONSOLE */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <div className="flex items-center gap-1 font-mono text-[10px] text-slate-400 font-bold">
          <Database className="w-3.5 h-3.5 text-cyan-400" />
          <span>PROMPT EDGE ORCHESTRATOR</span>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type environment command (e.g. Navigation)..."
            className="flex-grow bg-slate-950/90 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 transition-all font-mono"
          />
          <button
            type="submit"
            className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-3 py-2 rounded-xl transition-all flex items-center justify-center shadow-[0_0_10px_rgba(6,182,212,0.3)] active:scale-95"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>

      {/* Quick Macro Actions Triggers */}
      <div className="grid grid-cols-3 gap-1.5 font-mono text-[9px] font-bold">
        <button
          onClick={() => onActionTrigger('gesture')}
          className="bg-slate-900 hover:bg-slate-800 text-slate-300 py-1.5 px-2 rounded-lg border border-white/5 transition-all text-center"
        >
          PINCH TRACKING
        </button>
        <button
          onClick={() => onActionTrigger('path')}
          className="bg-slate-900 hover:bg-slate-800 text-slate-300 py-1.5 px-2 rounded-lg border border-white/5 transition-all text-center"
        >
          PLOT NAV PATH
        </button>
        <button
          onClick={() => onActionTrigger('query')}
          className="bg-slate-900 hover:bg-slate-800 text-slate-300 py-1.5 px-2 rounded-lg border border-white/5 transition-all text-center"
        >
          QUERY COGN MEM
        </button>
      </div>

    </div>
  );
};

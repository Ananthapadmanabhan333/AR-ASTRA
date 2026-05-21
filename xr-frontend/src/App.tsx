import React, { useState, useEffect, useCallback, useRef } from 'react';
import { CameraSimulator } from './components/CameraSimulator';
import { SmartGlassesHud } from './components/SmartGlassesHud';
import { VoiceVisualizer } from './components/VoiceVisualizer';
import { AgentOrchestratorView } from './components/AgentOrchestratorView';
import { ImmersiveDashboard } from './components/ImmersiveDashboard';
import { Sparkles, Terminal, Activity, Zap, Play, CheckCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

interface SimulatedObject {
  id: string;
  name: string;
  category: string;
  x: number;
  y: number;
  description: string;
  distance: string;
}

interface AgentLog {
  agent: string;
  message: string;
  timestamp: string;
}

export default function App() {
  // Global States
  const [selectedObject, setSelectedObject] = useState<SimulatedObject | null>(null);
  const [gesturesActive, setGesturesActive] = useState(false);
  const [navPathActive, setNavPathActive] = useState(false);
  const [agentResponseText, setAgentResponseText] = useState('Welcome back, Operative. XR Astra online. Tap objects or speak to run multi-agent diagnostics.');
  const [activeAgent, setActiveAgent] = useState('Idle');
  const [logs, setLogs] = useState<AgentLog[]>([
    { agent: 'System', message: 'Cognitive agent grid initialized. Memory database connected.', timestamp: '16:17:14' }
  ]);

  // System Stats
  const [websocketActive, setWebsocketActive] = useState(false);
  const [gpuUsage, setGpuUsage] = useState(34);
  const [memoryUsage, setMemoryUsage] = useState(58);
  const [voiceActive, setVoiceActive] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const socketRef = useRef<WebSocket | null>(null);

  // Sound cues simulation
  const playBeep = (freq = 800, dur = 0.08) => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + dur);
    } catch (e) {
      // AudioContext blocked or not supported
    }
  };

  // Connect to FastAPI WebSockets
  useEffect(() => {
    const wsUrl = `ws://${window.location.hostname}:8000/api/v1/ws/stream`;
    console.log(`Connecting to WebSocket: ${wsUrl}`);
    const ws = new WebSocket(wsUrl);
    socketRef.current = ws;

    ws.onopen = () => {
      console.log('Connected to backend WebSocket!');
      setWebsocketActive(true);
      playBeep(900, 0.15);
      addLog('System', 'Established low-latency WebSocket connection to FastAPI core.');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'telemetry') {
          setGpuUsage(data.gpu);
          setMemoryUsage(data.memory);
        } else if (data.type === 'agent_thought') {
          setActiveAgent(data.agent);
          addLog(data.agent, data.message);
        } else if (data.type === 'response') {
          setAgentResponseText(data.content);
          if (data.active_agent) setActiveAgent(data.active_agent);
          if (data.trigger_confetti) confetti();
        }
      } catch (err) {
        console.warn("WebSocket parse error: ", err);
      }
    };

    ws.onerror = (err) => {
      console.warn("WebSocket experienced an error. Enabling high-fidelity local simulator fallback.");
      setWebsocketActive(false);
    };

    ws.onclose = () => {
      console.log('WebSocket closed. Using local mock orchestration layer.');
      setWebsocketActive(false);
    };

    return () => {
      if (ws) ws.close();
    };
  }, []);

  // Performance numbers fluctuations
  useEffect(() => {
    const statsInterval = setInterval(() => {
      setGpuUsage((prev) => {
        const delta = Math.floor(Math.random() * 7) - 3;
        return Math.max(10, Math.min(95, prev + delta));
      });
      setMemoryUsage((prev) => {
        const delta = Math.floor(Math.random() * 3) - 1;
        return Math.max(10, Math.min(95, prev + delta));
      });
    }, 3000);
    return () => clearInterval(statsInterval);
  }, []);

  // Helper to push Logs
  const addLog = useCallback((agent: string, message: string) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLogs((prev) => [
      { agent, message, timestamp: timeStr },
      ...prev.slice(0, 40) // Keep last 40 logs
    ]);
  }, []);

  // Frame streaming logic
  const handleFrameCaptured = useCallback((base64Frame: string) => {
    if (websocketActive && socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type: 'video_frame',
        frame: base64Frame,
        timestamp: Date.now()
      }));
    }
  }, [websocketActive]);

  // HIGH-FIDELITY LOCAL SIMULATOR AGENTIC RESPONSE
  const runLocalSimulatedAgentOrchestrator = (inputSource: string, type: 'object' | 'prompt') => {
    playBeep(650, 0.05);
    
    // Step 1: Vision Agent
    setActiveAgent('Vision');
    const targetName = type === 'object' ? inputSource : `prompt string: "${inputSource}"`;
    addLog('Vision', `Scanning environment parameters... Identified focus on ${targetName}.`);

    // Step 2: Memory Agent (1s later)
    setTimeout(() => {
      setActiveAgent('Memory');
      addLog('Memory', `Recalling past room context from Qdrant. Found historic entities. Querying spatial graph relationships.`);
    }, 800);

    // Step 3: Navigation Agent (1.6s later)
    setTimeout(() => {
      setActiveAgent('Navigation');
      if (inputSource.toLowerCase().includes('sycamore') || inputSource.toLowerCase().includes('quantum') || type === 'object') {
        setNavPathActive(true);
        addLog('Navigation', `Target located at XYZ coordinate vectors. Drawing laser guidance pathway in spatial HUD.`);
      } else {
        addLog('Navigation', `Navigation parameters passive. No specific coordinates requested.`);
      }
    }, 1600);

    // Step 4: Voice / Action Agent Synthesis (2.4s later)
    setTimeout(() => {
      setActiveAgent('Voice');
      setVoiceActive(true);
      playBeep(880, 0.12);

      let response = '';
      if (type === 'object') {
        if (inputSource.includes('Supercomputer')) {
          response = 'This is Astra Supercomputer Node. Powered by Google TPU clusters, it acts as the primary cognitive backend orchestration engine for your current spatial HUD.';
        } else if (inputSource.includes('Sycamore')) {
          response = 'Sys diagnostic: Sycamore Quantum Processor operational at 15 milliKelvin. Entanglement coherence looks optimal for collaborative spatial tasks.';
        } else {
          response = `Target annotation: ${inputSource}. Bounding coordinates verified in spatial RAG database. Standing by for interactive query.`;
        }
      } else {
        // Parse custom user text prompt
        const prompt = inputSource.toLowerCase();
        if (prompt.includes('nav') || prompt.includes('find') || prompt.includes('go')) {
          response = 'Guidance module initialized. Vector pathway drawn on your screen pointing directly to the nearest spatial system objective.';
          setNavPathActive(true);
        } else if (prompt.includes('reset')) {
          response = 'Spatial memory graph and annotations cleared. RAG pipeline reset to zero-point telemetry.';
          setNavPathActive(false);
          setSelectedObject(null);
        } else {
          response = `Operative query processed: "${inputSource}". DeepMind LangGraph agents compiled environment constraints and recommend local active testing parameters.`;
        }
      }

      setAgentResponseText(response);
      addLog('Voice', `Voice stream synthesis active. Playback: "${response.substring(0, 45)}..."`);
    }, 2400);

    // Step 5: Wrap up (4.8s later)
    setTimeout(() => {
      setActiveAgent('Idle');
      setVoiceActive(false);
    }, 4800);
  };

  // Object selector click
  const handleObjectSelected = (obj: SimulatedObject) => {
    setSelectedObject(obj);
    if (!obj.id) return;

    if (websocketActive && socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type: 'select_object',
        object_id: obj.id,
        object_name: obj.name
      }));
    } else {
      runLocalSimulatedAgentOrchestrator(obj.name, 'object');
    }
  };

  // Send textual prompt
  const handleSendMessage = (message: string) => {
    if (websocketActive && socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type: 'text_command',
        command: message
      }));
    } else {
      runLocalSimulatedAgentOrchestrator(message, 'prompt');
    }
  };

  // Button Action macros
  const handleActionTrigger = (action: string) => {
    if (action === 'gesture') {
      setGesturesActive(!gesturesActive);
      playBeep(700, 0.08);
      addLog('System', `Toggled hand gesture tracking: ${!gesturesActive ? 'ACTIVE' : 'OFF'}`);
    } else if (action === 'path') {
      setNavPathActive(!navPathActive);
      playBeep(750, 0.08);
      addLog('System', `Toggled immersive navigation vectors: ${!navPathActive ? 'ACTIVE' : 'OFF'}`);
    } else if (action === 'query') {
      playBeep(920, 0.1);
      confetti({ particleCount: 60, spread: 50, colors: ['#06b6d4', '#a855f7'] });
      addLog('Memory', 'Scanning spatial databases... Confirmed: Zero leakage, RAG is synchronised.');
    } else if (action === 'reset') {
      setSelectedObject(null);
      setNavPathActive(false);
      setAgentResponseText('HUD parameters reset. Multi-agent state tables purged.');
      playBeep(450, 0.15);
      addLog('System', 'Purged spatial scene graphs and navigation overlay paths.');
    }
  };

  // Voice Link Toggle
  const handleToggleVoice = () => {
    if (isListening) {
      setIsListening(false);
      playBeep(500, 0.1);
      addLog('System', 'Voice channel passive.');
    } else {
      setIsListening(true);
      playBeep(900, 0.08);
      addLog('System', 'Hot-mic active. Speech-to-text listening...');
      
      // Simulate speech detection
      setTimeout(() => {
        if (socketRef.current && websocketActive) {
          socketRef.current.send(JSON.stringify({
            type: 'voice_command',
            voice: 'Simulated speech stream data'
          }));
        } else {
          setIsListening(false);
          runLocalSimulatedAgentOrchestrator('Simulated Voice Prompt', 'prompt');
        }
      }, 3000);
    }
  };

  return (
    <div className="w-full h-screen overflow-hidden flex flex-col justify-between relative">
      {/* Background Matrix Pulsing Grid */}
      <div className="grid-overlay" />

      {/* 1. TOP HEADER BRAND PANEL */}
      <header className="h-16 border-b border-white/10 bg-slate-950/70 backdrop-blur-md px-6 flex items-center justify-between z-10 relative">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.3)] border border-cyan-400/40">
            <Sparkles className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <h1 className="text-md font-black tracking-widest text-white font-display uppercase flex items-center gap-2">
              XR ASTRA <span className="text-[10px] bg-cyan-950 text-cyan-400 px-2 py-0.5 rounded-full border border-cyan-500/20 font-mono">LAB PROTOTYPE</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-mono">SPATIAL COGNITIVE OPERATING SYSTEM FOR SMART GLASSES</p>
          </div>
        </div>

        {/* Global Connection Telemetry Indicator */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-2 bg-slate-900 px-3.5 py-1.5 rounded-xl border border-white/5">
            <span className={`w-2 h-2 rounded-full ${websocketActive ? 'bg-emerald-400 animate-pulse' : 'bg-yellow-400 animate-ping'}`} />
            <span className={websocketActive ? 'text-emerald-400 font-bold' : 'text-yellow-400'}>
              {websocketActive ? 'CLOUD PIPELINE CONNECTED' : 'LOCAL EMULATOR FALLBACK'}
            </span>
          </div>
        </div>
      </header>

      {/* 2. THE THREE-COLUMN CINEMATIC OS GRID LAYOUT */}
      <main className="flex-grow p-4 grid grid-cols-1 xl:grid-cols-4 gap-4 z-10 relative overflow-hidden">
        
        {/* Left Side Menu Pane */}
        <section className="flex flex-col gap-4 overflow-y-auto">
          <VoiceVisualizer 
            voiceActive={voiceActive} 
            onToggleVoice={handleToggleVoice} 
            isListening={isListening} 
          />
          <AgentOrchestratorView 
            logs={logs} 
            activeAgent={activeAgent} 
          />
        </section>

        {/* Center Main Panoramic Smart Glasses HUD Viewport */}
        <section className="xl:col-span-2 relative flex flex-col justify-between glass-panel overflow-hidden border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.8)] rounded-3xl">
          {/* Main camera viewport simulator layer */}
          <CameraSimulator 
            onObjectSelected={handleObjectSelected} 
            selectedObject={selectedObject}
            websocketActive={websocketActive}
            onFrameCaptured={handleFrameCaptured}
          />
          
          {/* Dynamic Smart Glasses Telemetry HUD elements layer */}
          <SmartGlassesHud 
            selectedObject={selectedObject}
            gesturesActive={gesturesActive}
            navPathActive={navPathActive}
            agentResponseText={agentResponseText}
            voiceActive={voiceActive}
          />
        </section>

        {/* Right Side Telemetry & Scene Graph Pane */}
        <section className="flex flex-col gap-4 overflow-y-auto">
          <ImmersiveDashboard 
            onSendMessage={handleSendMessage}
            onActionTrigger={handleActionTrigger}
            gpuUsage={gpuUsage}
            memoryUsage={memoryUsage}
          />
        </section>
        
      </main>

      {/* 3. CORE SUBTERRANEAN STATUS BAR */}
      <footer className="h-8 bg-slate-950/90 border-t border-white/5 flex items-center justify-between px-6 text-[10px] text-slate-500 font-mono z-10 relative">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-slate-500" />
          <span>XR-OS SHELL: initialized successfully // standard port: 3000 // developer: admin</span>
        </div>
        <div className="flex items-center gap-4">
          <span>PIPELINE LOAD: <strong className="text-slate-400">0.04 ms</strong></span>
          <span>GPU NODE: <strong className="text-cyan-400">TPUv6-95C</strong></span>
          <span>SPATIAL COORD LOCK: <strong className="text-purple-400">XYZ-VECTOR4D</strong></span>
        </div>
      </footer>
    </div>
  );
}

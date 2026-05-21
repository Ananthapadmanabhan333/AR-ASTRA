import React from 'react';
import { Eye, Database, Navigation, MessageSquare, Terminal, RefreshCw, Cpu, Activity } from 'lucide-react';

interface AgentLog {
  agent: string;
  message: string;
  timestamp: string;
}

interface AgentOrchestratorViewProps {
  logs: AgentLog[];
  activeAgent: string;
}

const AGENT_DEFS = [
  { id: 'Vision', name: 'Vision Agent', desc: 'Environment mapping & CV', color: 'text-cyan-400 border-cyan-500/30', icon: Eye },
  { id: 'Memory', name: 'Memory Agent', desc: 'Vector RAG & spatial graph', color: 'text-purple-400 border-purple-500/30', icon: Database },
  { id: 'Navigation', name: 'Navigation Agent', desc: 'Pathfinding overlays', color: 'text-emerald-400 border-emerald-500/30', icon: Navigation },
  { id: 'Voice', name: 'Voice Agent', desc: 'STT & emotional speech synthesis', color: 'text-pink-400 border-pink-500/30', icon: MessageSquare }
];

export const AgentOrchestratorView: React.FC<AgentOrchestratorViewProps> = ({
  logs,
  activeAgent
}) => {
  return (
    <div className="glass-panel p-4 flex flex-col gap-4 flex-grow overflow-hidden">
      
      {/* Platform Orchestrator Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-2">
        <div className="flex items-center gap-2">
          <Activity className="w-4.5 h-4.5 text-purple-400 animate-spin-slow" />
          <span className="font-display font-bold text-xs tracking-wider text-white">COGNITIVE AGENT CONSOLE</span>
        </div>
        <div className="flex items-center gap-1.5 font-mono text-[9px] text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-500/25">
          <Cpu className="w-3 h-3 animate-pulse" />
          <span>ACTIVE FLOW: OK</span>
        </div>
      </div>

      {/* 1. INTERACTIVE MESH FLOW GRID */}
      <div className="grid grid-cols-2 gap-2">
        {AGENT_DEFS.map((agent) => {
          const isActive = activeAgent === agent.id;
          const Icon = agent.icon;
          return (
            <div
              key={agent.id}
              className={`p-2.5 rounded-xl border transition-all duration-500 flex flex-col gap-1 ${
                isActive 
                  ? 'bg-slate-900 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.25)] scale-[1.02]' 
                  : 'bg-slate-950/50 border-white/5 opacity-70'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400 animate-pulse' : 'text-slate-400'}`} />
                  <span className="font-display font-bold text-[11px] text-white">{agent.name}</span>
                </div>
                {isActive && (
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-400 font-sans leading-tight mt-0.5">{agent.desc}</p>
            </div>
          );
        })}
      </div>

      {/* 2. REAL-TIME MULTI-AGENT THOUGHT LOGS */}
      <div className="flex flex-col gap-2 flex-grow overflow-hidden">
        <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 font-bold border-b border-white/5 pb-1">
          <Terminal className="w-3.5 h-3.5 text-cyan-400" />
          <span>LANGGRAPH MEMORY WORKFLOW STREAM</span>
        </div>

        {/* Live log feed terminal */}
        <div className="flex-grow overflow-y-auto bg-slate-950/90 rounded-xl border border-white/5 p-3 font-mono text-[10px] flex flex-col gap-2.5 max-h-[220px]">
          {logs.length === 0 ? (
            <div className="text-slate-600 italic text-center py-6 flex flex-col items-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-slate-700" />
              <span>Awaiting agent execution sequences...</span>
            </div>
          ) : (
            logs.map((log, index) => {
              // Highlight based on agent type
              const isVision = log.agent === 'Vision';
              const isMemory = log.agent === 'Memory';
              const isNav = log.agent === 'Navigation';
              
              const tagColor = isVision ? 'text-cyan-400' : isMemory ? 'text-purple-400' : isNav ? 'text-emerald-400' : 'text-pink-400';
              const tagBg = isVision ? 'bg-cyan-950/40' : isMemory ? 'bg-purple-950/40' : isNav ? 'bg-emerald-950/40' : 'bg-pink-950/40';

              return (
                <div key={index} className="flex flex-col gap-1 border-b border-white/5 pb-2 last:border-0 last:pb-0">
                  <div className="flex justify-between items-center text-[9px]">
                    <span className={`px-2 py-0.5 rounded font-bold uppercase ${tagColor} ${tagBg} border border-white/5`}>
                      {log.agent} Agent
                    </span>
                    <span className="text-slate-600">{log.timestamp}</span>
                  </div>
                  <p className="text-slate-300 pl-1 leading-normal font-sans text-[11px]">{log.message}</p>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

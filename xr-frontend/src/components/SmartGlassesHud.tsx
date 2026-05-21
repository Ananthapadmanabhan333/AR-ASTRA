import React, { useEffect, useState } from 'react';
import { Battery, Compass, Wifi, Eye, Radio, Sparkles, AlertCircle } from 'lucide-react';

interface SmartGlassesHudProps {
  selectedObject: {
    id: string;
    name: string;
    category: string;
    description: string;
    distance: string;
  } | null;
  gesturesActive: boolean;
  navPathActive: boolean;
  agentResponseText: string;
  voiceActive: boolean;
}

export const SmartGlassesHud: React.FC<SmartGlassesHudProps> = ({
  selectedObject,
  gesturesActive,
  navPathActive,
  agentResponseText,
  voiceActive
}) => {
  const [time, setTime] = useState(new Date().toLocaleTimeString());
  const [batteryLevel, setBatteryLevel] = useState(94);
  const [heading, setHeading] = useState(185); // Compass heading

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);

    const compassTimer = setInterval(() => {
      // Simulate slight head movements in compass
      setHeading((prev) => {
        const delta = Math.floor(Math.random() * 3) - 1;
        return (prev + delta + 360) % 360;
      });
    }, 2000);

    return () => {
      clearInterval(timer);
      clearInterval(compassTimer);
    };
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none z-30 flex flex-col justify-between p-6">
      
      {/* 1. TOP STATUS HUD BAR */}
      <div className="flex justify-between items-start w-full">
        {/* Device Brand & Status */}
        <div className="flex items-center gap-2 bg-slate-950/80 border border-cyan-500/20 px-3 py-1.5 rounded-xl backdrop-blur-md">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span className="font-mono text-xs font-bold text-cyan-400 tracking-wider">XR ASTRA OS v2.0-BETA</span>
          <span className="text-[10px] text-slate-500 font-mono ml-2 border-l border-white/15 pl-2">DEV-PORT: 3000</span>
        </div>

        {/* Dynamic Nav Indicator (Center Top) */}
        {navPathActive && (
          <div className="flex items-center gap-2 bg-purple-950/85 border border-purple-500/40 px-4 py-2 rounded-xl backdrop-blur-md animate-bounce shadow-[0_0_15px_rgba(168,85,247,0.3)]">
            <Radio className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
            <span className="font-mono text-xs font-bold text-purple-300 tracking-wider">GUIDANCE: PLOTTING VECTOR TO SYCAMORE</span>
          </div>
        )}

        {/* Telemetry (Battery, Wifi, Time) */}
        <div className="flex items-center gap-3 bg-slate-950/80 border border-white/5 px-3 py-1.5 rounded-xl backdrop-blur-md font-mono text-[11px] text-slate-300">
          <div className="flex items-center gap-1.5">
            <Wifi className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-emerald-400">952 Mbps</span>
          </div>
          <div className="flex items-center gap-1 border-l border-white/10 pl-2">
            <Compass className="w-3.5 h-3.5 text-cyan-400 animate-spin-slow" />
            <span>{heading}° S</span>
          </div>
          <div className="flex items-center gap-1 border-l border-white/10 pl-2">
            <Battery className="w-3.5 h-3.5 text-yellow-400" />
            <span className="text-yellow-400">{batteryLevel}%</span>
          </div>
          <span className="text-white font-semibold border-l border-white/10 pl-2">{time}</span>
        </div>
      </div>

      {/* 2. DYNAMIC SPATIAL OBJECT ANNOTATION CARD (Middle Right Floating) */}
      {selectedObject && selectedObject.id && (
        <div className="absolute right-6 top-20 w-80 glass-panel border border-cyan-500/30 p-4 transition-all duration-500 translate-x-0 shadow-[0_8px_32px_rgba(6,182,212,0.15)] animate-slide-in">
          <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2 mb-2">
            <div className="flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-cyan-400" />
              <span className="font-display font-bold text-[10px] text-cyan-400 tracking-widest uppercase">SPATIAL SCANNER</span>
            </div>
            <span className="font-mono text-[10px] bg-cyan-950 text-cyan-400 px-2 py-0.5 rounded border border-cyan-500/20 uppercase font-semibold">
              {selectedObject.category}
            </span>
          </div>
          
          <h3 className="font-display text-sm font-bold text-white tracking-wide">{selectedObject.name}</h3>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">{selectedObject.description}</p>
          
          <div className="flex justify-between items-center mt-3 pt-2 border-t border-white/5 font-mono text-[10px]">
            <span className="text-slate-400">DISTANCE: <strong className="text-cyan-400">{selectedObject.distance}</strong></span>
            <span className="text-slate-400">ESTIMATED COORD: <strong className="text-purple-400">XYZ [3.2, 0.4, -1.1]</strong></span>
          </div>
        </div>
      )}

      {/* 3. AR PATH / SPATIAL ANCHORS SIMULATION GRID (Central Hud Overlays) */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        {navPathActive && (
          <svg className="w-full h-full absolute inset-0 opacity-80" viewBox="0 0 800 600" preserveAspectRatio="none">
            {/* Draw flowing laser navigation path line */}
            <path 
              d="M 400 500 Q 250 400 300 280 T 560 160" 
              fill="none" 
              stroke="url(#neon-grad)" 
              strokeWidth="6" 
              strokeLinecap="round"
              strokeDasharray="12 8"
              className="animate-[dash_2s_linear_infinite]"
            />
            {/* Nav destination ring */}
            <circle cx="560" cy="160" r="16" fill="rgba(168, 85, 247, 0.2)" stroke="#a855f7" strokeWidth="2" className="animate-pulse" />
            <circle cx="560" cy="160" r="4" fill="#a855f7" />
            <text x="590" y="165" fill="#a855f7" className="font-mono font-bold text-xs" style={{ fontFamily: 'Share Tech Mono' }}>DESTINATION: SYCAMORE CHIP</text>
            
            <defs>
              <linearGradient id="neon-grad" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="50%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#a855f7" />
              </linearGradient>
            </defs>
          </svg>
        )}
      </div>

      {/* 4. REAL-TIME MULTIMODAL SUBTITLE OVERLAY (Bottom Center HUD Glasses HUD) */}
      <div className="w-full flex flex-col items-center gap-3">
        {/* Active Hand Gesture HUD Indicator */}
        {gesturesActive && (
          <div className="flex items-center gap-2 bg-emerald-950/80 border border-emerald-500/30 px-3.5 py-1.5 rounded-full backdrop-blur-md animate-pulse">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-mono text-[10px] text-emerald-300 font-bold uppercase tracking-wider">Spatial Hand Tracking OK // Gesture: PINCH TO SCAN</span>
          </div>
        )}

        {/* AI Glass Subtitle Overlay */}
        {(agentResponseText || voiceActive) && (
          <div className="w-full max-w-2xl bg-slate-950/85 border border-cyan-500/30 rounded-2xl p-4 backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.8),0_0_20px_rgba(6,182,212,0.1)]">
            <div className="flex items-center gap-2 mb-1.5 border-b border-white/5 pb-1">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span className="font-mono text-[10px] text-cyan-400 font-bold uppercase tracking-wider">
                {voiceActive ? 'XR ASTRA LIVE RESPONSE STREAM' : 'COGNITIVE INTEL OVERLAY'}
              </span>
            </div>
            <p className="text-sm font-medium text-white leading-relaxed font-sans">
              {agentResponseText || 'Astra is parsing physical environment parameters... Speak to begin live spatial reasoning.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

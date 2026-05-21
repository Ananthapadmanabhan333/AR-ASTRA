import React, { useRef, useEffect, useState } from 'react';
import { Mic, MicOff, Volume2, Sparkles, BrainCircuit } from 'lucide-react';

interface VoiceVisualizerProps {
  voiceActive: boolean;
  onToggleVoice: () => void;
  isListening: boolean;
}

export const VoiceVisualizer: React.FC<VoiceVisualizerProps> = ({
  voiceActive,
  onToggleVoice,
  isListening
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [toneState, setToneState] = useState<'neutral' | 'curious' | 'analytical'>('analytical');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let phase = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;

      // Draw standard glowing wave base lines
      const drawSineWave = (amplitude: number, freq: number, color: string, speed: number, lineWidth: number) => {
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.shadowBlur = 15;
        ctx.shadowColor = color;

        for (let x = 0; x < width; x++) {
          // Add complex multi-harmonic sine calculations for cinematic visual feel
          const y = centerY + 
            Math.sin(x * freq + phase * speed) * amplitude * Math.sin(x * 0.005) + 
            Math.cos(x * freq * 0.5 - phase * speed * 0.8) * (amplitude * 0.3);
          
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      };

      // Increase amplitude if listening or output voice is active
      const activeAmp = isListening ? 25 : voiceActive ? 30 : 6;
      const activeSpeed = isListening ? 0.15 : voiceActive ? 0.12 : 0.04;

      // Render layered waves of different matching cyber colors (Cyan, Purple, Indigo, Pink)
      drawSineWave(activeAmp * 1.2, 0.015, 'rgba(6, 182, 212, 0.75)', activeSpeed, 2.5); // Cyan
      drawSineWave(activeAmp * 0.8, 0.025, 'rgba(168, 85, 247, 0.6)', activeSpeed * 1.3, 1.5); // Purple
      drawSineWave(activeAmp * 0.4, 0.035, 'rgba(244, 63, 94, 0.45)', activeSpeed * 0.8, 1.0); // Pink / Rose

      phase += 1;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [voiceActive, isListening]);

  return (
    <div className="glass-panel p-4 flex flex-col gap-4">
      {/* Dynamic Voice Module Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-1">
        <div className="flex items-center gap-2">
          <BrainCircuit className="w-4.5 h-4.5 text-cyan-400 animate-pulse" />
          <span className="font-display font-bold text-xs tracking-wider text-white">GEMINI LIVE AUDIO GRID</span>
        </div>
        <div className="flex items-center gap-1.5 font-mono text-[9px] bg-slate-900 px-2 py-0.5 rounded border border-white/5">
          <Sparkles className="w-2.5 h-2.5 text-purple-400" />
          <span className="text-slate-400">EMOTION ANALYSIS:</span>
          <span className="text-cyan-400 uppercase font-semibold">{toneState}</span>
        </div>
      </div>

      {/* Futuristic Audio Particle Canvas View */}
      <div className="w-full h-24 bg-slate-950/80 rounded-xl relative overflow-hidden border border-white/5 flex items-center justify-center">
        <canvas ref={canvasRef} width="350" height="96" className="w-full h-full mix-blend-screen" />
        
        {/* Absolute center indicator */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className={`w-8 h-8 rounded-full border border-white/10 flex items-center justify-center transition-all duration-500 ${
            isListening ? 'bg-cyan-950/40 border-cyan-500/30 scale-110' : voiceActive ? 'bg-purple-950/40 border-purple-500/30 scale-105' : ''
          }`}>
            <Volume2 className={`w-3.5 h-3.5 ${
              isListening ? 'text-cyan-400 animate-pulse' : voiceActive ? 'text-purple-400' : 'text-slate-500'
            }`} />
          </div>
        </div>
      </div>

      {/* Speech Action Buttons */}
      <div className="flex justify-between items-center gap-3">
        <button
          onClick={onToggleVoice}
          className={`flex-grow flex items-center justify-center gap-2 py-2.5 rounded-xl border text-xs font-mono font-bold transition-all ${
            isListening
              ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
              : voiceActive
              ? 'bg-purple-950/50 text-purple-400 border-purple-500/40 shadow-[0_0_12px_rgba(168,85,247,0.2)]'
              : 'bg-slate-900/60 text-slate-300 border-white/10 hover:border-cyan-500/30'
          }`}
        >
          {isListening ? (
            <>
              <Mic className="w-4 h-4 animate-bounce" />
              <span>COGNITIVE LISTENING</span>
            </>
          ) : voiceActive ? (
            <>
              <Mic className="w-4 h-4" />
              <span>STREAM SPEAKING</span>
            </>
          ) : (
            <>
              <MicOff className="w-4 h-4 text-slate-500" />
              <span>VOICE LINK OFFLINE</span>
            </>
          )}
        </button>

        {/* Emotion Tone Switcher (Mock Emotional tone analysis input) */}
        <div className="flex gap-1 bg-slate-900/80 p-1 rounded-lg border border-white/5">
          {(['neutral', 'curious', 'analytical'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setToneState(t)}
              className={`px-2 py-1 text-[9px] font-mono font-bold rounded uppercase transition-all ${
                toneState === t
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {t.slice(0, 4)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

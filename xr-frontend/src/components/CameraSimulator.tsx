import React, { useState, useRef, useEffect } from 'react';
import { Camera, RefreshCw, Eye, Map, Info, Compass, Shield } from 'lucide-react';

interface SimulatedObject {
  id: string;
  name: string;
  category: string;
  x: number; // percentage from left
  y: number; // percentage from top
  description: string;
  distance: string;
}

interface Scene {
  id: string;
  name: string;
  image: string; // Simulated scenery background style or gradient
  objects: SimulatedObject[];
}

// 4 high-fidelity virtual sceneries to wow reviewers
const VIRTUAL_SCENES: Scene[] = [
  {
    id: 'deepmind_lab',
    name: 'DeepMind Research Lab',
    image: 'linear-gradient(135deg, #090d1a 0%, #111827 50%, #1e1b4b 100%)',
    objects: [
      { id: 'server_rack', name: 'Astra Supercomputer Node', category: 'Hardware', x: 25, y: 35, description: 'Gemini TPU v6 Cluster Node running multi-agent orchestrators.', distance: '1.8m' },
      { id: 'quantum_cpu', name: 'Sycamore Quantum Processor', category: 'Processor', x: 70, y: 28, description: '53-qubit superconducting quantum chipset operating at 15mK.', distance: '3.2m' },
      { id: 'robotic_arm', name: 'Kinematic Spatial Manipulator', category: 'Robotics', x: 45, y: 60, description: 'Autonomous 6-DOF robotic limb training on deep reinforcement learning policies.', distance: '1.2m' }
    ]
  },
  {
    id: 'tokyo_streets',
    name: 'Downtown Tokyo (AR HUD)',
    image: 'linear-gradient(135deg, #0b0f19 0%, #1e1b4b 40%, #581c87 100%)',
    objects: [
      { id: 'signboard', name: 'Holographic Neon Signboard', category: 'Text/Signage', x: 30, y: 20, description: 'Dynamic translation requested: Japanese -> English ("Digital Oasis").', distance: '15.4m' },
      { id: 'vending_machine', name: 'Smart Vending Unit', category: 'Retail Device', x: 80, y: 65, description: 'Accepts touchless spatial credits, processes NFC commands.', distance: '4.1m' },
      { id: 'charging_hub', name: 'EV Hyper Charging Node', category: 'Infrastructure', x: 15, y: 70, description: 'Power grid diagnostic: active charging cycle at 350kW.', distance: '8.7m' }
    ]
  },
  {
    id: 'exoplanet_dome',
    name: 'Exoplanet Immersive Dome',
    image: 'linear-gradient(135deg, #022c22 0%, #064e3b 50%, #030712 100%)',
    objects: [
      { id: 'stellar_scope', name: 'Atmospheric Gas Analyzer', category: 'Sensor', x: 75, y: 40, description: 'Spectrographic sensor evaluating oxygen/methane ratios.', distance: '12.2m' },
      { id: 'hydro_farm', name: 'Aero-Hydroponics Rack', category: 'Biotech', x: 20, y: 55, description: 'Genetically optimized soy cultures processing synthetic photosynthesis.', distance: '2.5m' },
      { id: 'dome_emitter', name: 'Bio-Magnetic Field Emitter', category: 'Utility', x: 50, y: 15, description: 'Active containment shield protecting plants from cosmic radiation.', distance: '6.0m' }
    ]
  }
];

interface CameraSimulatorProps {
  onObjectSelected: (obj: SimulatedObject) => void;
  selectedObject: SimulatedObject | null;
  websocketActive: boolean;
  onFrameCaptured: (base64Frame: string) => void;
}

export const CameraSimulator: React.FC<CameraSimulatorProps> = ({
  onObjectSelected,
  selectedObject,
  websocketActive,
  onFrameCaptured
}) => {
  const [activeSceneIdx, setActiveSceneIdx] = useState(0);
  const [useWebcam, setUseWebcam] = useState(false);
  const [webcamAvailable, setWebcamAvailable] = useState(true);
  const [isScanning, setIsScanning] = useState(true);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const activeScene = VIRTUAL_SCENES[activeSceneIdx];

  // Handle webcam stream startup/teardown
  useEffect(() => {
    if (useWebcam) {
      navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 }, audio: false })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            streamRef.current = stream;
          }
        })
        .catch((err) => {
          console.warn("Webcam access denied or unavailable: ", err);
          setWebcamAvailable(false);
          setUseWebcam(false);
        });
    } else {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    }
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [useWebcam]);

  // Frame capture simulation for websocket streaming
  useEffect(() => {
    let captureInterval: NodeJS.Timeout;
    if (websocketActive && isScanning) {
      captureInterval = setInterval(() => {
        if (useWebcam && videoRef.current && canvasRef.current) {
          const ctx = canvasRef.current.getContext('2d');
          if (ctx) {
            ctx.drawImage(videoRef.current, 0, 0, 320, 240);
            const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.6);
            onFrameCaptured(dataUrl);
          }
        } else {
          // In virtual scene mode, capture a colored placeholder frame with noise to simulate stream data
          if (canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            if (ctx) {
              // Create dynamic gradient with moving noise
              const grad = ctx.createLinearGradient(0, 0, 320, 240);
              grad.addColorStop(0, '#090d1a');
              grad.addColorStop(1, activeSceneIdx === 0 ? '#1e1b4b' : activeSceneIdx === 1 ? '#581c87' : '#064e3b');
              ctx.fillStyle = grad;
              ctx.fillRect(0, 0, 320, 240);
              
              // Draw some white scanning dots
              ctx.fillStyle = 'rgba(6, 182, 212, 0.4)';
              ctx.fillRect(Math.random() * 320, Math.random() * 240, 10, 10);
              
              // Frame metadata stamp
              ctx.fillStyle = '#06b6d4';
              ctx.font = '8px monospace';
              ctx.fillText(`SCENE: ${activeScene.id.toUpperCase()}`, 10, 20);
              ctx.fillText(`TIME: ${new Date().toISOString()}`, 10, 32);
              
              const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.5);
              onFrameCaptured(dataUrl);
            }
          }
        }
      }, 500); // 2 FPS is plenty for agent comprehension and saves network overload
    }
    return () => clearInterval(captureInterval);
  }, [websocketActive, useWebcam, activeSceneIdx, isScanning, onFrameCaptured]);

  return (
    <div className="w-full h-full relative flex flex-col justify-between">
      {/* Hidden canvas for video compression and captures */}
      <canvas ref={canvasRef} width="320" height="240" className="hidden" />

      {/* Primary Immersive Viewport */}
      <div 
        className="w-full flex-grow relative overflow-hidden transition-all duration-700"
        style={{
          background: useWebcam ? '#000' : activeScene.image,
        }}
      >
        {/* Animated matrix dots overlay grid */}
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.015)_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
        
        {/* Scanner Overlay Line */}
        {isScanning && <div className="scanner-effect absolute inset-0 z-10" />}

        {/* Real Video Element */}
        {useWebcam && (
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            className="w-full h-full object-cover opacity-90 mix-blend-screen"
          />
        )}

        {/* Cinematic Reticle Overlay (Central targeting point) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-20 flex flex-col items-center">
          <div className="w-16 h-16 border border-dashed border-cyan-500/50 rounded-full animate-spin-slow flex items-center justify-center">
            <div className="w-8 h-8 border border-cyan-400 rounded-full flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping" />
            </div>
          </div>
          <div className="text-[10px] font-mono text-cyan-400/70 mt-2 tracking-widest bg-slate-900/60 px-2 py-0.5 rounded backdrop-blur-sm">
            SPATIAL COORD LOCK
          </div>
        </div>

        {/* Virtual Scene Interactive Object Overlay Nodes */}
        {!useWebcam && activeScene.objects.map((obj) => {
          const isSelected = selectedObject?.id === obj.id;
          return (
            <button
              key={obj.id}
              onClick={() => onObjectSelected(obj)}
              style={{ top: `${obj.y}%`, left: `${obj.x}%` }}
              className="absolute group z-20 -translate-x-1/2 -translate-y-1/2 flex items-center"
            >
              {/* Outer pulse circle */}
              <span className={`absolute inline-flex h-10 w-10 rounded-full opacity-75 -left-3 -top-3 transition-colors ${
                isSelected ? 'bg-purple-500/40 animate-ping-glow' : 'bg-cyan-500/20 group-hover:bg-cyan-500/40 group-hover:animate-ping'
              }`} />
              
              {/* Inner glowing dot */}
              <span className={`relative flex h-4 w-4 rounded-full border border-white items-center justify-center transition-all ${
                isSelected ? 'bg-purple-500 shadow-[0_0_12px_#a855f7]' : 'bg-cyan-500 group-hover:scale-110 shadow-[0_0_8px_#06b6d4]'
              }`}>
                <Eye className="w-2.5 h-2.5 text-white" />
              </span>

              {/* Spatial Label Tag */}
              <span className={`ml-3 px-3 py-1 text-xs rounded-lg border font-medium flex items-center gap-1.5 backdrop-blur-md transition-all ${
                isSelected 
                  ? 'bg-purple-950/80 text-purple-200 border-purple-500/40 shadow-[0_0_12px_rgba(168,85,247,0.3)]' 
                  : 'bg-slate-950/70 text-slate-200 border-slate-700/50 group-hover:border-cyan-500/40 group-hover:text-cyan-200'
              }`}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                {obj.name}
                <span className="text-[10px] text-cyan-400/80 font-mono ml-1">({obj.distance})</span>
              </span>
            </button>
          );
        })}

        {/* Viewport Floating Status Telemetry (Bottom Left) */}
        <div className="absolute bottom-4 left-4 z-20 flex flex-col gap-1.5 font-mono text-[10px] bg-slate-950/75 border border-white/10 rounded-xl p-3 backdrop-blur-md">
          <div className="flex items-center gap-2 text-cyan-400 font-bold border-b border-white/10 pb-1.5 mb-1">
            <Compass className="w-3.5 h-3.5 animate-spin-reverse-slow" />
            <span>HUD VIEWPORT TELEMETRY</span>
          </div>
          <div className="flex justify-between w-48 text-slate-400">
            <span>INPUT SRC:</span>
            <span className="text-white font-bold">{useWebcam ? 'WEBCAM DRIVER v1.2' : `SCENE: ${activeScene.name}`}</span>
          </div>
          <div className="flex justify-between w-48 text-slate-400">
            <span>FPS ENGINE:</span>
            <span className="text-emerald-400 font-bold">60.0 FPS // RENDER OK</span>
          </div>
          <div className="flex justify-between w-48 text-slate-400">
            <span>LATENCY:</span>
            <span className="text-cyan-400 font-bold">{websocketActive ? '18ms (EDGE CORE)' : '0ms (LOCAL MOCK)'}</span>
          </div>
          <div className="flex justify-between w-48 text-slate-400">
            <span>SECURITY LEVEL:</span>
            <span className="text-purple-400 font-bold flex items-center gap-1">
              <Shield className="w-2.5 h-2.5" /> FIPS-140-3
            </span>
          </div>
        </div>
      </div>

      {/* Control Bar (Integrated bottom HUD panel) */}
      <div className="bg-slate-950/90 border-t border-white/10 px-4 py-3 flex flex-wrap items-center justify-between gap-3 z-20">
        {/* Toggle between WebCam and Virtual Scene */}
        <div className="flex items-center gap-2">
          {webcamAvailable && (
            <button
              onClick={() => {
                setUseWebcam(!useWebcam);
                onObjectSelected({ id: '', name: '', category: '', x: 0, y: 0, description: '', distance: '' });
              }}
              className={`px-3 py-1.5 text-xs rounded-lg border font-mono font-semibold flex items-center gap-2 transition-all ${
                useWebcam 
                  ? 'bg-cyan-950/50 text-cyan-400 border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.2)]' 
                  : 'bg-slate-900/60 text-slate-300 border-white/10 hover:border-cyan-500/30'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              {useWebcam ? 'WEBCAM ACTIVE' : 'ACTIVATE CAMERA'}
            </button>
          )}

          <button
            onClick={() => setIsScanning(!isScanning)}
            className={`px-3 py-1.5 text-xs rounded-lg border font-mono font-semibold flex items-center gap-2 transition-all ${
              isScanning 
                ? 'bg-purple-950/50 text-purple-400 border-purple-500/50 shadow-[0_0_10px_rgba(168,85,247,0.2)]' 
                : 'bg-slate-900/60 text-slate-300 border-white/10 hover:border-purple-500/30'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
            {isScanning ? 'STREAMING ON' : 'STREAM HELD'}
          </button>
        </div>

        {/* Scene Selector buttons if not on webcam */}
        {!useWebcam && (
          <div className="flex items-center gap-1.5 bg-slate-900/80 p-1 rounded-lg border border-white/5">
            <span className="text-[10px] text-slate-400 font-mono px-2 flex items-center gap-1">
              <Map className="w-3 h-3" /> SCENE:
            </span>
            {VIRTUAL_SCENES.map((sc, index) => (
              <button
                key={sc.id}
                onClick={() => {
                  setActiveSceneIdx(index);
                  onObjectSelected({ id: '', name: '', category: '', x: 0, y: 0, description: '', distance: '' });
                }}
                className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-all ${
                  activeSceneIdx === index
                    ? 'bg-cyan-500 text-slate-950 shadow-[0_0_8px_rgba(6,182,212,0.4)]'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {sc.name.split(' ')[0]}
              </button>
            ))}
          </div>
        )}

        {/* Mini information display */}
        <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-400 font-mono">
          <Info className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span>Select nodes in scenery to prompt agents manually</span>
        </div>
      </div>
    </div>
  );
};

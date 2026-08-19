import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, Sparkles, Share2, Download, Volume2, Music } from "lucide-react";
import { Slider } from "@/components/ui/slider";

// Frequencies for classical notes (Base: C4 = 261.63 Hz)
const NOTES = {
  Sa: 261.63,
  re: 277.18, // Komal Re
  Re: 293.66,
  ga: 311.13, // Komal Ga
  Ga: 329.63,
  ma: 349.23,
  Ma: 369.99, // Teevra Ma
  Pa: 392.00,
  dha: 415.30, // Komal Dha
  Dha: 440.00,
  ni: 466.16, // Komal Ni
  Ni: 493.88,
  Sa_High: 523.25, // Higher Octave Sa
  Re_High: 587.33,
  Ga_High: 659.26,
};

// Raga scales definition
const RAGAS = {
  Yaman: {
    name: "Yaman",
    time: "Evening",
    benefit: "Peace & Devotion",
    scale: [NOTES.Sa, NOTES.Re, NOTES.Ga, NOTES.Ma, NOTES.Pa, NOTES.Dha, NOTES.Ni, NOTES.Sa_High, NOTES.Re_High, NOTES.Ga_High],
    tanpura: [NOTES.Sa / 2, NOTES.Ni / 2] // Sa and Ni drone
  },
  Bhairav: {
    name: "Bhairav",
    time: "Morning",
    benefit: "Focus & Grounding",
    scale: [NOTES.Sa, NOTES.re, NOTES.Ga, NOTES.ma, NOTES.Pa, NOTES.dha, NOTES.Ni, NOTES.Sa_High],
    tanpura: [NOTES.Sa / 2, NOTES.Pa / 2] // Sa and Pa drone
  },
  Shivaranjani: {
    name: "Shivaranjani",
    time: "Midnight",
    benefit: "Deep Healing",
    scale: [NOTES.Sa, NOTES.Re, NOTES.ga, NOTES.Pa, NOTES.Dha, NOTES.Sa_High, NOTES.Re_High],
    tanpura: [NOTES.Sa / 2, NOTES.Pa / 2]
  },
  Malkauns: {
    name: "Malkauns",
    time: "Late Night",
    benefit: "Sleep & Calm",
    scale: [NOTES.Sa, NOTES.ga, NOTES.ma, NOTES.dha, NOTES.ni, NOTES.Sa_High],
    tanpura: [NOTES.Sa / 2, NOTES.ma / 2] // Sa and Ma drone
  }
};

type RagaKey = keyof typeof RAGAS;

export function AIMusicGenerator() {
  const [activeRaga, setActiveRaga] = useState<RagaKey>("Yaman");
  const [isPlaying, setIsPlaying] = useState(false);
  const [tempo, setTempo] = useState<number>(40); // 30 (slow) to 80 (fast)
  const [mood, setMood] = useState<string>("Meditative");

  // Web Audio Refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const playStateRef = useRef<boolean>(false);
  const sequenceTimerRef = useRef<number | null>(null);
  const activeNodesRef = useRef<AudioNode[]>([]);
  const tanpuraNodesRef = useRef<OscillatorNode[]>([]);

  // Visualizer Canvas Ref
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Sync state reference to use inside event handlers & timers
  playStateRef.current = isPlaying;

  useEffect(() => {
    // Canvas animation loop
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let localAnalyser = analyserRef.current;
    const bufferLength = localAnalyser ? localAnalyser.frequencyBinCount : 128;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationFrameRef.current = requestAnimationFrame(draw);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      localAnalyser = analyserRef.current; // Re-evaluate ref in loop
      
      if (playStateRef.current && localAnalyser) {
        localAnalyser.getByteTimeDomainData(dataArray);
      }

      ctx.lineWidth = 3;
      // Beautiful teal/gold gradient for visualizer
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
      gradient.addColorStop(0, "rgba(201, 168, 76, 0.8)"); // Gold
      gradient.addColorStop(0.5, "rgba(45, 212, 191, 0.9)"); // Teal
      gradient.addColorStop(1, "rgba(201, 168, 76, 0.8)"); // Gold
      ctx.strokeStyle = gradient;
      ctx.beginPath();

      const sliceWidth = canvas.width / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        // Compute displacement
        let v = 128;
        if (playStateRef.current && localAnalyser) {
          v = dataArray[i];
        } else {
          // Subtle slow-moving idle wave
          const time = Date.now() * 0.004;
          v = 128 + Math.sin(i * 0.1 + time) * 6;
        }

        const y = (v / 256) * canvas.height;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
    };

    draw();

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, []);

  // Web Audio Engine
  const startAudio = () => {
    try {
      if (!audioCtxRef.current) {
        // Initialize AudioContext
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        audioCtxRef.current = new AudioContextClass();
      }

      const audioCtx = audioCtxRef.current;
      if (audioCtx.state === "suspended") {
        audioCtx.resume();
      }

      // Setup main gain node & analyzer
      const gainNode = audioCtx.createGain();
      gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime); // Master volume

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;

      // Connect: Synth -> MasterGain -> Analyser -> Output
      gainNode.connect(analyser);
      analyser.connect(audioCtx.destination);

      analyserRef.current = analyser;
      gainNodeRef.current = gainNode;

      // Start Tanpura Drone
      startTanpuraDrone(audioCtx, gainNode);

      // Start Sequencing Notes
      setIsPlaying(true);
      playStateRef.current = true;
      scheduleNextNote();
    } catch (err) {
      console.error("Failed to start Web Audio API:", err);
    }
  };

  const startTanpuraDrone = (audioCtx: AudioContext, outputNode: AudioNode) => {
    // Clean existing drone nodes
    tanpuraNodesRef.current.forEach(node => {
      try { node.stop(); } catch {}
    });
    tanpuraNodesRef.current = [];

    const raga = RAGAS[activeRaga];
    
    // Create 2 drone notes (Tonic Sa and Pa/Ma/Ni)
    raga.tanpura.forEach((freq, idx) => {
      const osc = audioCtx.createOscillator();
      // Triangle wave makes a warm, flute/bell-like harmonized drone
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

      const filter = audioCtx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(300, audioCtx.currentTime);

      const droneGain = audioCtx.createGain();
      // Alternating drone volume
      const droneVol = idx === 0 ? 0.08 : 0.04;
      droneGain.gain.setValueAtTime(droneVol, audioCtx.currentTime);

      osc.connect(filter);
      filter.connect(droneGain);
      droneGain.connect(outputNode);

      osc.start();
      tanpuraNodesRef.current.push(osc);
    });
  };

  // Melodic improvisation sequence generator
  let noteIndex = 0;
  let direction = 1;

  const scheduleNextNote = () => {
    if (!playStateRef.current || !audioCtxRef.current || !gainNodeRef.current) return;

    const audioCtx = audioCtxRef.current;
    const masterGain = gainNodeRef.current;
    const raga = RAGAS[activeRaga];
    const scale = raga.scale;

    // Pick note based on simple random-walk melody contour (up and down the scale)
    const contourChance = Math.random();
    if (contourChance < 0.6) {
      // Walk along scale direction
      noteIndex += direction;
      if (noteIndex >= scale.length) {
        noteIndex = scale.length - 2;
        direction = -1;
      } else if (noteIndex < 0) {
        noteIndex = 1;
        direction = 1;
      }
    } else {
      // Occasional random jump to neighbor notes
      noteIndex = Math.max(0, Math.min(scale.length - 1, noteIndex + (Math.random() > 0.5 ? 2 : -2)));
    }

    const freq = scale[noteIndex];
    playFluteNote(audioCtx, masterGain, freq);

    // Calculate delay based on tempo slider
    // tempo = 40 (Mid), interval = 60000 / 80 = 750ms
    const intervalMs = (60000 / (tempo * 2)) * (mood === "Calm" ? 1.5 : mood === "Meditative" ? 2.0 : 1.0);

    sequenceTimerRef.current = window.setTimeout(() => {
      scheduleNextNote();
    }, intervalMs);
  };

  const playFluteNote = (audioCtx: AudioContext, outputNode: AudioNode, freq: number) => {
    // 1. Oscillator for primary sound (triangle wave)
    const osc = audioCtx.createOscillator();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

    // Add gentle LFO (vibrato) for organic wooden flute characteristics
    const lfo = audioCtx.createOscillator();
    const lfoGain = audioCtx.createGain();
    lfo.frequency.setValueAtTime(6.5, audioCtx.currentTime); // 6.5 Hz vibrato
    lfoGain.gain.setValueAtTime(3.5, audioCtx.currentTime);  // Pitch variation width
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);
    lfo.start();

    // 2. Low-pass filter to round out tone
    const filter = audioCtx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(750, audioCtx.currentTime);

    // 3. Reverb Delay Node simulating sacred spaces
    const delay = audioCtx.createDelay(1.0);
    const delayGain = audioCtx.createGain();
    const feedback = audioCtx.createGain();

    delay.delayTime.setValueAtTime(0.45, audioCtx.currentTime); // 450ms delay
    delayGain.gain.setValueAtTime(0.18, audioCtx.currentTime); // Echo volume
    feedback.gain.setValueAtTime(0.35, audioCtx.currentTime);  // Echo feedback tail

    // 4. Amplitude Envelope
    const ampEnv = audioCtx.createGain();
    const now = audioCtx.currentTime;
    
    // Slow Attack: mimics gentle breath on flute
    ampEnv.gain.setValueAtTime(0, now);
    ampEnv.gain.linearRampToValueAtTime(0.22, now + 0.15); // Ramp up to volume
    
    // Slow Decay/Sustain/Release
    ampEnv.gain.setValueAtTime(0.22, now + 0.35);
    ampEnv.gain.exponentialRampToValueAtTime(0.001, now + 1.25);

    // Wire up primary signal path: Osc -> AmpEnv -> Filter -> Output
    osc.connect(ampEnv);
    ampEnv.connect(filter);
    filter.connect(outputNode);

    // Wire up delay loop: Filter -> Delay -> DelayGain -> Output (plus feedback loop)
    filter.connect(delay);
    delay.connect(feedback);
    feedback.connect(delay); // Feedback loops back into delay input
    delay.connect(delayGain);
    delayGain.connect(outputNode);

    osc.start();
    osc.stop(now + 1.3);
    lfo.stop(now + 1.3);

    activeNodesRef.current.push(osc, lfo, ampEnv, delay, delayGain, feedback);
  };

  const stopAudio = () => {
    setIsPlaying(false);
    playStateRef.current = false;

    // Clear schedule timer
    if (sequenceTimerRef.current) {
      clearTimeout(sequenceTimerRef.current);
      sequenceTimerRef.current = null;
    }

    // Stop Tanpura Drone
    tanpuraNodesRef.current.forEach(node => {
      try { node.stop(); } catch {}
    });
    tanpuraNodesRef.current = [];

    // Stop and clean up active note nodes
    activeNodesRef.current.forEach(node => {
      try {
        if (node instanceof OscillatorNode) {
          node.stop();
        }
      } catch {}
    });
    activeNodesRef.current = [];
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      stopAudio();
    } else {
      startAudio();
    }
  };

  // Re-start drone when changing raga dynamically during playback
  const handleRagaChange = (raga: RagaKey) => {
    setActiveRaga(raga);
    if (isPlaying && audioCtxRef.current && gainNodeRef.current) {
      startTanpuraDrone(audioCtxRef.current, gainNodeRef.current);
    }
  };

  const currentRagaInfo = RAGAS[activeRaga];

  return (
    <div className="flex flex-col w-full max-w-[420px] mx-auto bg-surface rounded-sheet border border-border p-6 shadow-lift text-foreground">
      
      {/* Bot Header */}
      <div className="flex items-center gap-3.5 mb-6">
        <div className="relative flex items-center justify-center w-11 h-11 rounded-full bg-cat-light border border-cat/30">
          <Music className="w-5 h-5 text-cat" />
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-cat animate-pulse border-2 border-surface" />
        </div>
        <div className="flex-1 text-left">
          <h3 className="text-sm font-semibold tracking-wider uppercase text-cat font-sans">
            AI Music Studio
          </h3>
          <p className="text-[11px] text-muted-foreground">
            Procedural Raga Improviser
          </p>
        </div>
        {isPlaying && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cat-light border border-cat/30">
            <span className="w-1.5 h-1.5 rounded-full bg-cat animate-ping" />
            <span className="text-[10px] text-cat font-bold uppercase tracking-wider">Active</span>
          </div>
        )}
      </div>

      {/* Visualizer Display Panel */}
      <div className="relative h-28 w-full bg-background rounded-btn border border-border flex items-center justify-center overflow-hidden mb-6">
        {/* Canvas visualizer */}
        <canvas 
          ref={canvasRef} 
          width={370} 
          height={112} 
          className="absolute inset-0 w-full h-full"
        />

        {/* Dynamic center info */}
        <div className="z-10 bg-surface/90 border border-border rounded-sheet px-4 py-2 text-center pointer-events-none shadow-soft max-w-[80%]">
          <p className="text-[10px] uppercase font-bold tracking-widest text-cat">
            {currentRagaInfo.time} Raga
          </p>
          <p className="text-sm font-semibold text-foreground mt-0.5">
            Raga {currentRagaInfo.name}
          </p>
          <p className="text-[10px] text-muted-foreground italic mt-0.5">
            {currentRagaInfo.benefit}
          </p>
        </div>
      </div>

      {/* Raga selector chips */}
      <div className="flex flex-col gap-2 mb-6">
        <label className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground text-left">
          Raga Base
        </label>
        <div className="grid grid-cols-2 gap-2">
          {(Object.keys(RAGAS) as RagaKey[]).map((rKey) => {
            const active = activeRaga === rKey;
            return (
              <button
                key={rKey}
                onClick={() => handleRagaChange(rKey)}
                className={`press min-h-10 rounded-btn text-xs font-semibold border transition-all duration-300 ${
                  active
                    ? "bg-cat-light border-cat text-cat shadow-soft font-bold"
                    : "bg-background border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {rKey}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sliders Area */}
      <div className="flex flex-col gap-4 mb-6 text-left">
        
        {/* Tempo Slider */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground">
              Tempo / Speed
            </span>
            <span className="text-[10px] text-cat font-semibold uppercase">
              {tempo < 35 ? "Slow (Vilambit)" : tempo > 60 ? "Fast (Drut)" : "Mid (Madhya)"}
            </span>
          </div>
          <Slider
            value={[tempo]}
            onValueChange={(val) => setTempo(val[0])}
            min={20}
            max={90}
            step={1}
            className="py-1 cursor-pointer"
          />
        </div>

        {/* Mood Selector */}
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground">
            Harmonic Mood
          </span>
          <div className="flex gap-2">
            {["Meditative", "Calm", "Divine"].map((mKey) => {
              const active = mood === mKey;
              return (
                <button
                  key={mKey}
                  onClick={() => setMood(mKey)}
                  className={`press flex-1 min-h-8 rounded-btn text-[10px] font-bold tracking-wider uppercase border transition-all duration-300 ${
                    active
                      ? "bg-cat-light border-cat text-cat shadow-soft font-bold"
                      : "bg-background border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {mKey}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Generate Music Playback Button */}
      <button
        onClick={handlePlayPause}
        className="press flex min-h-12 w-full items-center justify-center gap-2 rounded-btn bg-cat text-sm font-semibold text-cat-foreground shadow-lift hover:brightness-105 transition-all duration-300"
      >
        {isPlaying ? (
          <>
            <Pause className="w-4.5 h-4.5 fill-cat-foreground" /> Stop Healing Session
          </>
        ) : (
          <>
            <Play className="w-4.5 h-4.5 fill-cat-foreground" /> Generate Healing Melody
          </>
        )}
      </button>

      {/* Share / Download Toolbar */}
      <div className="flex justify-between items-center mt-5 pt-4 border-t border-border">
        <button className="press flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground">
          <Share2 className="w-3.5 h-3.5" /> Share
        </button>
        <button className="press flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground">
          <Download className="w-3.5 h-3.5" /> Download
        </button>
      </div>
      
    </div>
  );
}

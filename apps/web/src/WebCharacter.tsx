import { useEffect, useRef, useState } from "react";

type Mood = "normal" | "happy" | "sad";

interface WebCharacterProps {
  width?: number;
  height?: number;
  mood?: Mood;
}

/**
 * Pure SVG character for web — no react-native-reanimated dependency.
 * Mirrors the look of @radio-lingo/character but uses CSS transitions
 * and requestAnimationFrame for the oscilloscope waveform.
 */
export function WebCharacter({
  width = 200,
  height = 240,
  mood = "normal",
}: WebCharacterProps) {
  const waveRef = useRef<SVGPathElement>(null);
  const frameRef = useRef<number>(0);

  // Oscilloscope animation params by mood
  const ampMap: Record<Mood, number> = { normal: 0.2, happy: 0.7, sad: 0.05 };
  const freqMap: Record<Mood, number> = { normal: 1.5, happy: 3, sad: 0.8 };

  // Eye rotation by mood (degrees)
  const eyeRotMap: Record<Mood, number> = { normal: 0, happy: 27, sad: -27 };

  // Antenna displacement by mood (px, up from base)
  const antennaMap: Record<Mood, number> = { normal: 5, happy: 20, sad: 0 };

  useEffect(() => {
    let t = 0;
    const animate = () => {
      t += 0.05;
      const el = waveRef.current;
      if (el) {
        const A = ampMap[mood];
        const freq = freqMap[mood];
        const oscX = 45, oscW = 110, oscY = 125, oscH = 50;
        const centerY = oscY + oscH / 2;
        const samples = 24;
        const step = oscW / (samples - 1);
        let d = "";
        for (let i = 0; i < samples; i++) {
          const px = oscX + i * step;
          const nx = (i / (samples - 1)) * Math.PI * 2 * freq;
          const wave = A * (oscH / 2) * 0.8 * (Math.sin(nx + t) + 0.3 * Math.sin(nx * 2.5 + t * 1.7));
          const py = centerY - wave;
          d += i === 0 ? `M ${px},${py}` : ` L ${px},${py}`;
        }
        el.setAttribute("d", d);
      }
      frameRef.current = requestAnimationFrame(animate);
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [mood]);

  const eyeRot = eyeRotMap[mood];
  const antD = antennaMap[mood];
  const transition = "all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)";

  return (
    <svg width={width} height={height} viewBox="0 0 200 240">
      <defs>
        <linearGradient id="bodyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3A3A3A" />
          <stop offset="1" stopColor="#2A2A2A" />
        </linearGradient>
        <linearGradient id="faceGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#333333" />
          <stop offset="1" stopColor="#282828" />
        </linearGradient>
      </defs>

      {/* Antennae */}
      <line x1={65} y1={45} x2={65} y2={15 - antD}
            stroke="#777777" strokeWidth={3} strokeLinecap="round"
            style={{ transition }} />
      <circle cx={65} cy={15 - antD} r={4} fill="#DD614A"
              style={{ transition }} />
      <line x1={135} y1={45} x2={135} y2={15 - antD}
            stroke="#777777" strokeWidth={3} strokeLinecap="round"
            style={{ transition }} />
      <circle cx={135} cy={15 - antD} r={4} fill="#DD614A"
              style={{ transition }} />

      {/* Body */}
      <rect x={20} y={40} width={160} height={160}
            rx={24} ry={24}
            fill="url(#bodyGrad)" stroke="#555555" strokeWidth={2} />

      {/* Face plate */}
      <rect x={32} y={52} width={136} height={136}
            rx={16} ry={16}
            fill="url(#faceGrad)" stroke="#444444" strokeWidth={1} />

      {/* Left eye knob */}
      <circle cx={70} cy={90} r={22} fill="#2A2A2A" stroke="#555555" strokeWidth={2} />
      <circle cx={70} cy={90} r={13.2} fill="#1A1A1A" stroke="#444444" strokeWidth={1} />
      <line x1={70} y1={90}
            x2={70 + Math.cos((eyeRot - 90) * Math.PI / 180) * 15.4}
            y2={90 + Math.sin((eyeRot - 90) * Math.PI / 180) * 15.4}
            stroke="#DD614A" strokeWidth={3} strokeLinecap="round"
            style={{ transition }} />
      <circle cx={70} cy={90} r={2.64} fill="#DD614A" />

      {/* Right eye knob */}
      <circle cx={130} cy={90} r={22} fill="#2A2A2A" stroke="#555555" strokeWidth={2} />
      <circle cx={130} cy={90} r={13.2} fill="#1A1A1A" stroke="#444444" strokeWidth={1} />
      <line x1={130} y1={90}
            x2={130 + Math.cos((-eyeRot - 90) * Math.PI / 180) * 15.4}
            y2={90 + Math.sin((-eyeRot - 90) * Math.PI / 180) * 15.4}
            stroke="#DD614A" strokeWidth={3} strokeLinecap="round"
            style={{ transition }} />
      <circle cx={130} cy={90} r={2.64} fill="#DD614A" />

      {/* Oscilloscope mouth */}
      <rect x={45} y={125} width={110} height={50}
            rx={6} ry={6}
            fill="#0A1A0A" stroke="#555555" strokeWidth={2} />
      <rect x={72.5} y={125} width={0.5} height={50} fill="#1A3A1A" />
      <rect x={100} y={125} width={0.5} height={50} fill="#1A3A1A" />
      <rect x={127.5} y={125} width={0.5} height={50} fill="#1A3A1A" />
      <rect x={45} y={150} width={110} height={0.5} fill="#1A3A1A" />
      <path ref={waveRef} d="M 45,150 L 155,150"
            stroke="#73A580" strokeWidth={2.5}
            fill="none" strokeLinecap="round" strokeLinejoin="round" />

      {/* Speaker grille */}
      <rect x={30} y={205} width={140} height={30}
            rx={8} ry={8}
            fill="#2A2A2A" stroke="#444444" strokeWidth={1} />
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={`a${i}`} x={50 + i * 24} y={211} width={16} height={2} rx={1} fill="#444444" />
      ))}
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={`b${i}`} x={50 + i * 24} y={218} width={16} height={2} rx={1} fill="#444444" />
      ))}
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={`c${i}`} x={50 + i * 24} y={225} width={16} height={2} rx={1} fill="#444444" />
      ))}

      {/* Power LED */}
      <circle cx={168} cy={55} r={4} fill="#73A580" />
    </svg>
  );
}

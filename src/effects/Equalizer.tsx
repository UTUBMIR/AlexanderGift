import { useEffect, useRef } from 'react';
import { audioEngine } from '../audio/AudioEngine';

const SMOOTHING = 0.25;
const PEAK_HEIGHT = 160;

export function Equalizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const smoothed = useRef<Float32Array | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    let raf: number;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = 140;
    };
    resize();
    window.addEventListener('resize', resize);

    function ampColor(amp: number) {
      const t = Math.min(amp, 1);
      const r = 255;
      const g = Math.round(40 + 170 * t);
      const b = Math.round(40 * (1 - t) + 10 * t);
      return `rgb(${r},${g},${b})`;
    }

    const draw = () => {
      raf = requestAnimationFrame(draw);
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const raw = audioEngine.getFrequencyData();
      const half = Math.floor(w / 2);
      const freqBins = 80;
      const len = Math.min(freqBins, half, raw.length);

      if (!smoothed.current || smoothed.current.length !== len) {
        smoothed.current = new Float32Array(len);
      }
      const s = smoothed.current;

      let maxVal = 0;
      const linear = new Float32Array(len);
      for (let i = 0; i < len; i++) {
        const v = Math.pow(10, raw[i] / 20);
        linear[i] = v;
        if (v > maxVal) maxVal = v;
      }
      const scale = maxVal > 0.001 ? PEAK_HEIGHT / (maxVal * h) : 1;

      for (let i = 0; i < len; i++) {
        s[i] += (linear[i] * scale * h - s[i]) * SMOOTHING;
      }

      // gradient across full width based on frequency amplitudes
      const grad = ctx.createLinearGradient(0, 0, w, 0);

      // find max smoothed value for normalization
      let sMax = 0.001;
      for (let i = 0; i < len; i++) if (s[i] > sMax) sMax = s[i];

      // left half (mirrored): left edge → center, high→low freq
      for (let i = 0; i < half; i++) {
        const idx = Math.floor((i / half) * len);
        const v = s[Math.min(len - 1 - idx, len - 1)];
        const amp = v / sMax;
        grad.addColorStop(i / w, ampColor(amp));
      }

      // right half (mirrored): center → right edge, low→high freq
      for (let i = 0; i < half; i++) {
        const idx = Math.floor((i / half) * len);
        const v = s[Math.min(idx, len - 1)];
        const amp = v / sMax;
        grad.addColorStop((half + i) / w, ampColor(amp));
      }

      ctx.beginPath();
      ctx.moveTo(0, 0);

      for (let i = 0; i < half; i++) {
        const idx = Math.floor((i / half) * len);
        ctx.lineTo(i, Math.min(s[Math.min(len - 1 - idx, len - 1)], h));
      }

      for (let i = half - 1; i >= 0; i--) {
        const idx = Math.floor((i / half) * len);
        ctx.lineTo(w - i - 1, Math.min(s[Math.min(len - 1 - idx, len - 1)], h));
      }

      ctx.lineTo(w, 0);
      ctx.closePath();

      ctx.fillStyle = grad;
      ctx.fill();

      ctx.strokeStyle = grad;
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.7;
      ctx.stroke();
      ctx.globalAlpha = 1;
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed', top: 0, left: 0,
        width: '100%', height: 140,
        zIndex: 30,
        pointerEvents: 'none',
      }}
    />
  );
}

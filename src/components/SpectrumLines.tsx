import { useRef, useEffect } from 'react';
import { audioEngine } from '../audio/AudioEngine';

interface Props {
  intensity?: number;
  color?: string;
}

export function SpectrumLines({ intensity = 1, color = '#00ffff' }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const data = audioEngine.getFrequencyData();
      const energy = audioEngine.getEnergy() * intensity;

      const lineCount = Math.min(64, data.length);
      const spacing = canvas.height / lineCount;

      ctx.strokeStyle = color;
      ctx.lineWidth = 2 * Math.max(0.5, energy);

      for (let i = 0; i < lineCount; i++) {
        const amplitude = Math.max(0, (data[i] + 100) / 100) * energy * 100;
        const x = Math.min(amplitude, canvas.width / 2);

        ctx.globalAlpha = 0.3 + (i / lineCount) * 0.7;
        ctx.beginPath();
        ctx.moveTo(0, i * spacing);
        ctx.lineTo(x, i * spacing);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(canvas.width, i * spacing);
        ctx.lineTo(canvas.width - x, i * spacing);
        ctx.stroke();
      }

      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [intensity, color]);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'fixed', inset: 0, zIndex: 5, pointerEvents: 'none' }}
    />
  );
}

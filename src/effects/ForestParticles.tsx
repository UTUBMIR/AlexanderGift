import { useEffect, useMemo, useState } from 'react';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import type { ISourceOptions } from '@tsparticles/engine';

export function ForestParticles() {
  const [init, setInit] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => setInit(true));
  }, []);

  const options: ISourceOptions = useMemo(() => ({
    background: { color: { value: 'transparent' } },
    fpsLimit: 60,
    particles: {
      number: { value: 30, density: { enable: true } },
      color: { value: ['#FFD700', '#FF69B4', '#98FB98', '#DDA0DD', '#87CEEB', '#FF6347'] },
      shape: { type: ['circle', 'star'] },
      opacity: { value: { min: 0.4, max: 0.9 } },
      size: { value: { min: 3, max: 8 } },
      move: {
        enable: true,
        speed: { min: 1, max: 3 },
        direction: 'none' as const,
        random: true,
        outModes: { default: 'bounce' as const },
        gravity: { enable: true, acceleration: 0.3 },
      },
      rotate: {
        value: { min: 0, max: 360 },
        animation: { enable: true, speed: { min: 1, max: 5 } },
      },
    },
    interactivity: {
      events: {
        onClick: { enable: true, mode: 'push' },
      },
      modes: {
        push: { quantity: 5 },
      },
    },
    detectRetina: true,
  }), []);

  if (!init) return null;

  return (
    <Particles
      id="forest-particles"
      options={options}
      style={{ position: 'fixed', inset: 0, zIndex: 3, pointerEvents: 'none' }}
    />
  );
}

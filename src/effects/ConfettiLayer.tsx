import { useEffect, useMemo, useState } from 'react';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import { loadConfettiPreset } from '@tsparticles/preset-confetti';
import type { ISourceOptions } from '@tsparticles/engine';

export function ConfettiLayer() {
  const [init, setInit] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadConfettiPreset(engine);
    }).then(() => setInit(true));
  }, []);

  const options: ISourceOptions = useMemo(() => ({
    preset: 'confetti',
    background: { color: { value: 'transparent' } },
    particles: {
      color: { value: ['#FFD700', '#FF6347', '#00FF7F', '#00BFFF', '#FF69B4', '#FFA500'] },
      size: { value: { min: 5, max: 15 } },
    },
    emitters: {
      position: { x: 50, y: 0 },
      rate: { quantity: 5, delay: 0.1 },
      life: { count: 0, duration: 0.1 },
    },
  }), []);

  if (!init) return null;

  return (
    <Particles
      id="confetti"
      options={options}
      style={{ position: 'fixed', inset: 0, zIndex: 3, pointerEvents: 'none' }}
    />
  );
}

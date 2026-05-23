import { useEffect, useMemo, useState, useImperativeHandle, forwardRef, useRef } from 'react';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import type { ISourceOptions, Container } from '@tsparticles/engine';

export interface ExplosionLayerHandle {
  explode: () => void;
}

export const ExplosionLayer = forwardRef<ExplosionLayerHandle>(function ExplosionLayer(_props, ref) {
  const [init, setInit] = useState(false);
  const [trigger, setTrigger] = useState(0);
  const containerRef = useRef<Container | null>(null);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => setInit(true));
  }, []);

  useImperativeHandle(ref, () => ({
    explode: () => {
      setTrigger(t => t + 1);
      if (containerRef.current) {
        containerRef.current.play();
      }
    }
  }));

  const options: ISourceOptions = useMemo(() => ({
    background: { color: { value: 'transparent' } },
    fpsLimit: 60,
    particles: {
      number: { value: 0 },
      color: {
        value: ['#FFD700', '#FF6347', '#00FF7F', '#00BFFF', '#FF69B4', '#FFA500', '#fff'],
      },
      shape: { type: ['circle', 'square', 'star'] },
      opacity: {
        value: { min: 0.3, max: 1 },
        animation: { enable: true, speed: 2, sync: false },
      },
      size: {
        value: { min: 2, max: 8 },
        animation: { enable: true, speed: 5, sync: false },
      },
      move: {
        enable: true,
        speed: { min: 10, max: 30 },
        direction: 'none' as const,
        random: true,
        outModes: { default: 'destroy' as const },
        gravity: { enable: true, acceleration: 5 },
      },
      life: {
        count: 1,
        duration: { value: 3 },
      },
    },
    emitters: {
      position: { x: 50, y: 50 },
      rate: { quantity: 80, delay: 0.05 },
      size: { width: 10, height: 10 },
      life: { count: 1, duration: 0.3 },
      particles: {
        move: { speed: { min: 15, max: 40 } },
      },
    },
    detectRetina: true,
  }), [trigger]);

  if (!init) return null;

  return (
    <Particles
      id="explosion"
      key={trigger}
      options={options}
      particlesLoaded={async (container) => { containerRef.current = container ?? null; }}
      style={{ position: 'fixed', inset: 0, zIndex: 4, pointerEvents: 'none' }}
    />
  );
});

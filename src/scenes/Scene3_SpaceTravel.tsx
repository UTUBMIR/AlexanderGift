import { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { CameraShake, Sparkles } from '@react-three/drei';
import { EffectComposer, Bloom, ChromaticAberration, Noise } from '@react-three/postprocessing';
import { motion, AnimatePresence } from 'motion/react';
import * as THREE from 'three';
import { Planet } from '../components/Planet';
import { SolarWind } from '../components/SolarWind';
import { SpectrumLines } from '../components/SpectrumLines';

function StarField({ count = 8000, speed = 1 }) {
  const ref = useRef<THREE.Points>(null);

  const positions = useRef(new Float32Array(count * 3));
  const colors = useRef(new Float32Array(count * 3));
  const sizes = useRef(new Float32Array(count));

  useEffect(() => {
    for (let i = 0; i < count; i++) {
      const r = 50 + Math.random() * 200;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions.current[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions.current[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions.current[i * 3 + 2] = r * Math.cos(phi);
      const c = 0.5 + Math.random() * 0.5;
      const tint = Math.random();
      if (tint > 0.97) { colors.current[i * 3] = 1; colors.current[i * 3 + 1] = 0.6; colors.current[i * 3 + 2] = 0.2; }
      else if (tint > 0.94) { colors.current[i * 3] = 0.5; colors.current[i * 3 + 1] = 0.7; colors.current[i * 3 + 2] = 1; }
      else { colors.current[i * 3] = c; colors.current[i * 3 + 1] = c; colors.current[i * 3 + 2] = c; }
      sizes.current[i] = 0.2 + Math.random() * 0.8;
    }
  }, [count]);

  useFrame(() => {
    if (!ref.current) return;
    const pos = ref.current.geometry.attributes.position.array as Float32Array;
    const starSpeed = speed * 2;
    for (let i = 0; i < count; i++) {
      pos[i * 3 + 2] += starSpeed * 0.1;
      if (pos[i * 3 + 2] > 100) {
        const r = 50 + Math.random() * 200;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        pos[i * 3 + 2] = -200 + Math.random() * 50;
      }
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions.current, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors.current, 3]} />
        <bufferAttribute attach="attributes-size" args={[sizes.current, 1]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.3}
        vertexColors
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
}

function SpeedController({ onSpeedChange }: { onSpeedChange: (s: number) => void }) {
  const startTime = useRef(Date.now());
  const duration = 18000;

  useFrame(() => {
    const elapsed = Date.now() - startTime.current;
    const progress = Math.min(elapsed / duration, 1);
    const speed = 1 + progress * 8;
    onSpeedChange(speed);
  });

  return null;
}

interface Props {
  onComplete: () => void;
}

export function Scene3_SpaceTravel({ onComplete }: Props) {
  const [speed, setSpeed] = useState(1);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setExiting(true), 17000);
    const completeTimer = setTimeout(() => onComplete(), 20000);
    return () => { clearTimeout(timer); clearTimeout(completeTimer); };
  }, [onComplete]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{ position: 'fixed', inset: 0, zIndex: 1 }}
      >
        <Canvas camera={{ position: [0, 2, 8], fov: 70 }}>
          <color attach="background" args={['#000005']} />
          <StarField speed={speed} />
          <Sparkles count={100} scale={20} speed={0.5} color="#88aaff" size={4} noise={2} />
          <Planet position={[-15, -2, -30]} size={2} color1="#ff8844" color2="#ffcc88" seed={1} speed={0.3} />
          <Planet position={[12, 3, -50]} size={3} color1="#4488ff" color2="#88aaff" seed={2} speed={0.2} />
          <Planet position={[8, -1, -80]} size={1.5} color1="#88ff88" color2="#aaffaa" seed={3} speed={0.15} />
          <Planet position={[-10, 1, -100]} size={2.5} color1="#ff88cc" color2="#ffaadd" seed={4} speed={0.25} />
          <SolarWind position={[0, 15, 0]} count={300} intensity={speed * 0.3} />
          <SolarWind position={[0, -12, 0]} count={200} intensity={speed * 0.2} />
          <SolarWind position={[15, 5, 0]} count={150} intensity={speed * 0.15} />
          <SpeedController onSpeedChange={setSpeed} />
          <CameraShake
            maxYaw={0.03 * speed}
            maxPitch={0.03 * speed}
            maxRoll={0.02 * speed}
            intensity={speed * 0.4}
            decay={false}
          />
          <ambientLight intensity={0.2} />
          <pointLight position={[0, 15, 0]} intensity={0.5} color="#ffdd88" />
          <EffectComposer>
            <Bloom intensity={0.3 + speed * 0.08} luminanceThreshold={0.4} mipmapBlur />
            <ChromaticAberration offset={[0.002 * speed, 0.002 * speed]} />
            <Noise opacity={Math.min(0.08, speed * 0.01)} />
          </EffectComposer>
        </Canvas>
        <SpectrumLines intensity={speed * 0.3} color="#88aaff" />
        {exiting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 3 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 10,
              background: '#fff',
            }}
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
}

import { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { CameraShake } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { motion, AnimatePresence } from 'motion/react';
import * as THREE from 'three';
import { Earth } from '../components/Earth';
import { SpectrumLines } from '../components/SpectrumLines';

function makeCircleTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext('2d')!;
  const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
  gradient.addColorStop(0, 'rgba(255,255,255,1)');
  gradient.addColorStop(0.4, 'rgba(255,255,255,0.8)');
  gradient.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 32, 32);
  return new THREE.CanvasTexture(canvas);
}

const circleTexture = makeCircleTexture();

function ReentryFire({ count = 800 }) {
  const ref = useRef<THREE.Points>(null);
  const positions = useRef(new Float32Array(count * 3));
  const colors = useRef(new Float32Array(count * 3));

  useEffect(() => {
    for (let i = 0; i < count; i++) {
      positions.current[i * 3] = (Math.random() - 0.5) * 16;
      positions.current[i * 3 + 1] = (Math.random() - 0.5) * 12;
      positions.current[i * 3 + 2] = (Math.random() - 0.5) * 10 + 6;
      colors.current[i * 3] = 1;
      colors.current[i * 3 + 1] = 0.3 + Math.random() * 0.5;
      colors.current[i * 3 + 2] = Math.random() * 0.2;
    }
  }, [count]);

  useFrame(() => {
    if (!ref.current) return;
    const pos = ref.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      pos[i * 3] += (Math.random() - 0.5) * 0.05;
      pos[i * 3 + 1] += (Math.random() - 0.5) * 0.05;
      pos[i * 3 + 2] -= 0.05;
      if (pos[i * 3 + 2] < -8) {
        pos[i * 3] = (Math.random() - 0.5) * 16;
        pos[i * 3 + 1] = (Math.random() - 0.5) * 12;
        pos[i * 3 + 2] = 8;
      }
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions.current, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors.current, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.15}
        map={circleTexture}
        vertexColors
        transparent
        opacity={0.7}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
}

function EarthWrapper({ burning }: { burning: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const startTime = useRef(Date.now());

  useFrame(() => {
    if (!groupRef.current) return;
    const elapsed = (Date.now() - startTime.current) / 1000;
    const scale = 1.8 + elapsed * 0.3;
    groupRef.current.scale.setScalar(Math.min(scale, 4));
    groupRef.current.position.z = -Math.min(elapsed * 0.5, 4);
  });

  return (
    <group ref={groupRef}>
      <Earth size={1.5} atmosphereColor={burning ? '#ff4400' : '#4488ff'} />
    </group>
  );
}

interface Props {
  onComplete: () => void;
}

export function Scene4_EarthApproach({ onComplete }: Props) {
  const [burning, setBurning] = useState(false);
  const [done, setDone] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_tick, setTick] = useState(0);

  useEffect(() => {
    const t2 = setTimeout(() => setBurning(true), 7000);
    const t3 = setTimeout(() => setDone(true), 10000);
    const ct = setTimeout(() => onComplete(), 12000);
    return () => { clearTimeout(t2); clearTimeout(t3); clearTimeout(ct); };
  }, [onComplete]);

  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{ position: 'fixed', inset: 0, zIndex: 1 }}
      >
        <Canvas camera={{ position: [0, 0, 12], fov: 60 }}>
          <color attach="background" args={['#000005']} />
          <EarthWrapper burning={burning} />
          {burning && <ReentryFire />}
          <ambientLight intensity={0.3} />
          <directionalLight position={[5, 5, 5]} intensity={1} />
          <CameraShake
            maxYaw={burning ? 0.2 : 0.05}
            maxPitch={burning ? 0.2 : 0.05}
            maxRoll={burning ? 0.15 : 0.02}
            intensity={burning ? 1.5 : 0.3}
            decay={false}
          />
          <EffectComposer>
            <Bloom intensity={burning ? 2 : 0.5} luminanceThreshold={0.2} mipmapBlur />
          </EffectComposer>
        </Canvas>
        <SpectrumLines intensity={burning ? 1.5 : 0.5} color={burning ? '#ff4400' : '#4488ff'} />
        {done && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2 }}
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

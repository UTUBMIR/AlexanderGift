import { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import { CameraShake } from '@react-three/drei';
import { EffectComposer, Bloom, ChromaticAberration } from '@react-three/postprocessing';
import { motion, AnimatePresence } from 'motion/react';
import { Wormhole } from '../components/Wormhole';

function SpeedController({ onSpeedChange }: { onSpeedChange: (s: number) => void }) {
  const startTime = useRef(Date.now());
  const duration = 15000;

  useFrame(() => {
    const elapsed = Date.now() - startTime.current;
    const progress = Math.min(elapsed / duration, 1);
    const speed = 1 + progress * 5;
    onSpeedChange(speed);
  });

  return null;
}

function CameraController({ speed }: { speed: number }) {
  useFrame(({ camera }) => {
    camera.position.z = 4.5;
    camera.position.x = Math.sin(speed * 0.4) * 0.12;
    camera.position.y = Math.cos(speed * 0.35) * 0.12;
    camera.lookAt(Math.sin(speed * 0.25) * 0.25, Math.cos(speed * 0.2) * 0.18, -14);
  });
  return null;
}

interface Props {
  onComplete: () => void;
}

export function Scene2_Wormhole({ onComplete }: Props) {
  const [speed, setSpeed] = useState(1);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setExiting(true), 14000);
    const completeTimer = setTimeout(() => onComplete(), 16000);
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
        <Canvas camera={{ position: [0, 0, 4.5], fov: 78 }}>
          <color attach="background" args={['#000008']} />
          <Stars radius={120} depth={60} count={4000} factor={6} saturation={0.5} fade speed={0.5} />

          <Wormhole speed={speed} />
          <SpeedController onSpeedChange={setSpeed} />
          <CameraController speed={speed} />

          <mesh position={[0, 0, -40]}>
            <sphereGeometry args={[0.8, 16, 16]} />
            <meshBasicMaterial color="#66ddff" transparent opacity={0.5} />
          </mesh>
          <pointLight position={[0, 0, -40]} intensity={3} color="#66ddff" distance={60} />
          <mesh position={[0, 0, -45]}>
            <sphereGeometry args={[2.5, 16, 16]} />
            <meshBasicMaterial color="#4488ff" transparent opacity={0.06} />
          </mesh>

          <CameraShake
            maxYaw={0.02 * speed}
            maxPitch={0.02 * speed}
            maxRoll={0.01 * speed}
            intensity={speed * 0.3}
            decay={false}
          />

          <EffectComposer>
            <Bloom intensity={0.8 + speed * 0.15} luminanceThreshold={0.1} luminanceSmoothing={0.08} mipmapBlur />
            <ChromaticAberration offset={[0.0003 * speed, 0.0003 * speed]} />
          </EffectComposer>
        </Canvas>

        {exiting && (
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

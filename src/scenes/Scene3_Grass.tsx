import { useEffect, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { motion, AnimatePresence } from 'motion/react';
import * as THREE from 'three';

function GrassField({ count = 40000 }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useRef(new THREE.Object3D());

  const { positions, heights, phases, colors } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const h = new Float32Array(count);
    const ph = new Float32Array(count);
    const col = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 37.5;
      pos[i * 3] = Math.cos(angle) * radius;
      pos[i * 3 + 1] = 0;
      pos[i * 3 + 2] = Math.sin(angle) * radius;
      h[i] = 0.4 + Math.random() * 0.8;
      ph[i] = Math.random() * Math.PI * 2;
      col[i * 3]     = 0.1 + Math.random() * 0.25;
      col[i * 3 + 1] = 0.5 + Math.random() * 0.45;
      col[i * 3 + 2] = 0.05 + Math.random() * 0.15;
    }
    return { positions: pos, heights: h, phases: ph, colors: col };
  }, [count]);

  useEffect(() => {
    if (!meshRef.current) return;
    const attr = new THREE.InstancedBufferAttribute(colors, 3);
    meshRef.current.instanceColor = attr;
  }, [colors]);

  const bladeGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const verts = new Float32Array([
      -0.025, 0, 0,
       0.025, 0, 0,
       0,     1, 0,
    ]);
    geo.setAttribute('position', new THREE.BufferAttribute(verts, 3));
    geo.setIndex([0, 1, 2]);
    return geo;
  }, []);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.elapsedTime;
    for (let i = 0; i < count; i++) {
      const d = dummy.current;
      const x = positions[i * 3];
      const z = positions[i * 3 + 2];
      const h = heights[i];
      const phase = phases[i];
      const wind1 = Math.sin(t * 2.0 + phase + x * 0.4 + z * 0.25);
      const wind2 = Math.sin(t * 3.5 + phase * 1.7 + x * 0.6);
      const wind3 = Math.sin(t * 0.8 + phase * 0.5) * 0.3;
      const wind = (wind1 * 0.6 + wind2 * 0.3 + wind3) * 0.2;
      d.position.set(x, 0, z);
      d.scale.set(1 + wind * 0.5, h + wind * 0.15, 1);
      d.rotation.set(wind * 1.0, wind * 0.15, wind * 0.6);
      d.updateMatrix();
      meshRef.current.setMatrixAt(i, d.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[bladeGeo, undefined, count]}>
      <meshStandardMaterial side={THREE.DoubleSide} roughness={0.7} />
    </instancedMesh>
  );
}

function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
      <planeGeometry args={[80, 100]} />
      <meshStandardMaterial color="#4a8c3f" roughness={0.9} />
    </mesh>
  );
}

function SkyBox() {
  return (
    <mesh>
      <sphereGeometry args={[50, 32, 32]} />
      <meshBasicMaterial color="#5DAEE0" side={THREE.BackSide} />
    </mesh>
  );
}

function Sun() {
  return (
    <mesh position={[20, 18, -25]}>
      <sphereGeometry args={[1.5, 16, 16]} />
      <meshBasicMaterial color="#FFEE88" />
    </mesh>
  );
}

function CameraMover() {
  const startTime = useRef(Date.now());
  useFrame(({ camera }) => {
    const elapsed = Date.now() - startTime.current;
    const t = elapsed * 0.001;
    const y = 1.0 + Math.sin(t * 1.3) * 0.2;
    const speed = 2.5;
    camera.position.set(
      Math.sin(t * 0.3) * 0.4,
      y,
      -15 + t * speed,
    );
    camera.lookAt(
      Math.sin(t * 0.4) * 0.5,
      y - 0.5,
      camera.position.z + 12,
    );
  });
  return null;
}

interface Props {
  onComplete: () => void;
}

export function Scene3_Grass({ onComplete }: Props) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 13000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{ position: 'fixed', inset: 0, zIndex: 1 }}
      >
        <Canvas camera={{ position: [0, 1.2, -15], fov: 70 }}>
          <SkyBox />
          <Sun />
          <ambientLight intensity={0.5} />
          <directionalLight position={[15, 20, 5]} intensity={1.4} color="#FFF8E0" />
          <hemisphereLight args={['#87CEEB', '#4a7a3f', 0.4]} />
          <Ground />
          <GrassField />
          <CameraMover />
          <fog attach="fog" args={['#5DAEE0', 20, 45]} />
        </Canvas>
      </motion.div>
    </AnimatePresence>
  );
}

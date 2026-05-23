import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface Props {
  position: [number, number, number];
  count?: number;
  intensity?: number;
}

export function SolarWind({ position, count = 200, intensity = 1 }: Props) {
  const pointsRef = useRef<THREE.Points>(null);

  const [positions, velocities] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 0.5 + Math.random() * 2;
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
      vel[i * 3] = Math.sin(phi) * Math.cos(theta) * (0.5 + Math.random() * 2);
      vel[i * 3 + 1] = Math.sin(phi) * Math.sin(theta) * (0.5 + Math.random() * 2);
      vel[i * 3 + 2] = Math.cos(phi) * (0.5 + Math.random() * 2);
    }
    return [pos, vel];
  }, [count]);

  useFrame(({ clock }) => {
    if (!pointsRef.current) return;
    const pos = pointsRef.current.geometry.attributes.position.array as Float32Array;
    const time = clock.elapsedTime * intensity;
    for (let i = 0; i < count; i++) {
      pos[i * 3] += velocities[i * 3] * 0.02 + Math.sin(time + i) * 0.001;
      pos[i * 3 + 1] += velocities[i * 3 + 1] * 0.02 + Math.cos(time + i * 0.5) * 0.001;
      pos[i * 3 + 2] += velocities[i * 3 + 2] * 0.02 + Math.sin(time * 0.5 + i) * 0.001;
      const dist = Math.sqrt(
        pos[i * 3] ** 2 + pos[i * 3 + 1] ** 2 + pos[i * 3 + 2] ** 2
      );
      if (dist > 15) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        pos[i * 3] = Math.sin(phi) * Math.cos(theta) * 0.5;
        pos[i * 3 + 1] = Math.sin(phi) * Math.sin(theta) * 0.5;
        pos[i * 3 + 2] = Math.cos(phi) * 0.5;
      }
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef} position={position}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#ffdd88"
        size={0.04}
        transparent
        opacity={0.6 * intensity}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

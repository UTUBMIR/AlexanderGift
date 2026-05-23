import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface Props {
  intensity?: number;
}

export function BlackHole({ intensity = 1 }: Props) {
  const groupRef = useRef<THREE.Group>(null);
  const discRef = useRef<THREE.Mesh>(null);

  const discParticles = useMemo(() => {
    const count = 2000;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const radius = 1.5 + Math.random() * 3;
      const angle = Math.random() * Math.PI * 2;
      const height = (Math.random() - 0.5) * 0.5;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = height;
      positions[i * 3 + 2] = Math.sin(angle) * radius;
      const t = Math.random();
      colors[i * 3] = 1 - t * 0.5;
      colors[i * 3 + 1] = 0.4 + t * 0.3;
      colors[i * 3 + 2] = t * 0.3;
      sizes[i] = 0.02 + Math.random() * 0.04;
    }
    return { positions, colors, sizes };
  }, []);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.elapsedTime * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh>
        <sphereGeometry args={[1.2, 32, 32]} />
        <meshBasicMaterial color="#000" />
      </mesh>

      <mesh>
        <sphereGeometry args={[1.25, 32, 32]} />
        <meshBasicMaterial
          color="#ff4400"
          transparent
          opacity={0.1 * intensity}
          side={THREE.BackSide}
        />
      </mesh>

      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={discParticles.positions.length / 3}
            array={discParticles.positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={discParticles.colors.length / 3}
            array={discParticles.colors}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-size"
            count={discParticles.sizes.length}
            array={discParticles.sizes}
            itemSize={1}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.06}
          vertexColors
          transparent
          opacity={0.8 * intensity}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>

      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.4, 4, 64]} />
        <meshBasicMaterial
          color="#ff6600"
          transparent
          opacity={0.15 * intensity}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

import { useRef } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { TextureLoader } from 'three';

interface Props {
  position?: [number, number, number];
  size?: number;
  atmosphereColor?: string;
}

export function Earth({ position = [0, 0, 0], size = 2, atmosphereColor = '#4488ff' }: Props) {
  const meshRef = useRef<THREE.Mesh>(null);
  const cloudRef = useRef<THREE.Mesh>(null);
  const texture = useLoader(TextureLoader, './earth.jpg');

  useFrame(({ clock }) => {
    if (meshRef.current) meshRef.current.rotation.y = clock.elapsedTime * 0.1;
    if (cloudRef.current) {
      cloudRef.current.rotation.y = clock.elapsedTime * 0.15;
      cloudRef.current.position.y = Math.sin(clock.elapsedTime * 0.2) * 0.02;
    }
  });

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[size, 48, 48]} />
        <meshStandardMaterial map={texture} roughness={0.7} metalness={0.1} />
      </mesh>

      <mesh ref={cloudRef}>
        <sphereGeometry args={[size * 1.01, 48, 48]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.15}
          depthWrite={false}
        />
      </mesh>

      <mesh>
        <sphereGeometry args={[size * 1.03, 48, 48]} />
        <meshBasicMaterial
          color={atmosphereColor}
          transparent
          opacity={0.08}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

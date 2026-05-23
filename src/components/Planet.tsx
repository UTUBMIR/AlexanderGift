import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function generatePlanetTexture(seed: number, color1: string, color2: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  const c1 = new THREE.Color(color1);
  const c2 = new THREE.Color(color2);

  const simpleNoise = (x: number, y: number) => {
    const n = Math.sin(x * 12.9898 + y * 78.233 + seed) * 43758.5453;
    return n - Math.floor(n);
  };

  for (let y = 0; y < 128; y++) {
    for (let x = 0; x < 256; x++) {
      const n = simpleNoise(x * 0.05, y * 0.05) * 0.6 +
                simpleNoise(x * 0.1, y * 0.1 + 100) * 0.3 +
                simpleNoise(x * 0.2, y * 0.2 + 200) * 0.1;
      const color = c1.clone().lerp(c2, n);
      ctx.fillStyle = `rgb(${color.r * 255},${color.g * 255},${color.b * 255})`;
      ctx.fillRect(x, y, 1, 1);
    }
  }
  return new THREE.CanvasTexture(canvas);
}

interface Props {
  position: [number, number, number];
  size?: number;
  color1?: string;
  color2?: string;
  seed?: number;
  speed?: number;
}

export function Planet({
  position,
  size = 1,
  color1 = '#4488ff',
  color2 = '#88aaff',
  seed = 42,
  speed = 0.2,
}: Props) {
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = useMemo(() => generatePlanetTexture(seed, color1, color2), [seed, color1, color2]);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = clock.elapsedTime * speed;
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[size, 32, 32]} />
      <meshStandardMaterial map={texture} />
    </mesh>
  );
}

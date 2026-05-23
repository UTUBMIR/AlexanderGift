import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const accretionVertexShader = `
  varying vec2 vUv;
  varying vec3 vPosition;

  void main() {
    vUv = uv;
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const accretionFragmentShader = `
  precision highp float;

  uniform float uTime;
  varying vec2 vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }

  float fbm(vec2 p) {
    float sum = 0.0;
    float amp = 0.5;
    float freq = 1.0;
    for (int i = 0; i < 5; i++) {
      sum += amp * noise(p * freq);
      freq *= 2.0;
      amp *= 0.5;
    }
    return sum;
  }

  void main() {
    float angle = vUv.x * 6.2831853;
    float radius = mix(0.0, 1.0, vUv.y);

    vec2 uv = vec2(angle * 0.5 + uTime * 0.03, radius * 3.0 + uTime * 0.05);
    float n = fbm(uv);

    float diskContrast = smoothstep(0.15, 0.85, radius);
    float innerGlow = exp(-radius * 6.0) * 0.8;
    float outerFade = smoothstep(1.0, 0.5, radius) * 0.6;

    float band = sin(angle * 6.0 + uTime * 0.4 + n * 2.0) * 0.5 + 0.5;
    float intensity = diskContrast * (0.3 + band * 0.5 + n * 0.2) + innerGlow + outerFade;

    vec3 innerCol = vec3(1.0, 0.7, 0.3);
    vec3 midCol = vec3(0.8, 0.3, 0.05);
    vec3 outerCol = vec3(0.2, 0.05, 0.02);
    vec3 color = mix(innerCol, midCol, smoothstep(0.0, 0.3, radius));
    color = mix(color, outerCol, smoothstep(0.3, 0.7, radius));

    float alpha = clamp(intensity * 0.85, 0.0, 1.0);

    gl_FragColor = vec4(color * (1.0 + n * 0.3), alpha);
  }
`;

export function MisterBlackHole() {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = t;
    }
    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.06;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Black sphere core */}
      <mesh>
        <sphereGeometry args={[1.4, 32, 32]} />
        <meshBasicMaterial color="#000" />
      </mesh>

      {/* Inner glow rim */}
      <mesh>
        <sphereGeometry args={[1.5, 32, 32]} />
        <meshBasicMaterial color="#ff4400" transparent opacity={0.08} side={THREE.BackSide} />
      </mesh>

      {/* Accretion disk */}
      <mesh rotation={[Math.PI * 0.15, 0, 0]}>
        <ringGeometry args={[1.2, 4.5, 128]} />
        <shaderMaterial
          ref={materialRef}
          vertexShader={accretionVertexShader}
          fragmentShader={accretionFragmentShader}
          uniforms={{ uTime: { value: 0 } }}
          transparent
          side={THREE.DoubleSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface Props {
  speed?: number;
}

const tunnelVertexShader = `
  varying vec2 vUv;
  varying vec3 vPosition;

  void main() {
    vUv = uv;
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const tunnelFragmentShader = `
  precision highp float;

  uniform float uTime;
  uniform float uSpeed;
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

  void main() {
    float angle = vUv.x * 6.2831853;
    float depth = vUv.y;
    float flow = uTime * (0.18 + uSpeed * 0.055);
    float spiralA = sin(angle * 4.0 + depth * 42.0 - flow * 16.0);
    float spiralB = sin(angle * -7.0 + depth * 34.0 + flow * 11.0);
    float turbulence = noise(vec2(angle * 0.8, depth * 14.0 - flow * 3.0));
    float ribs = smoothstep(0.45, 1.0, spiralA * 0.5 + 0.5) * 0.65
      + smoothstep(0.62, 1.0, spiralB * 0.5 + 0.5) * 0.35;
    float centerFade = smoothstep(0.02, 0.2, depth) * smoothstep(1.0, 0.74, depth);
    float intensity = centerFade * (0.12 + ribs * 0.78 + turbulence * 0.28);
    vec3 deepBlue = vec3(0.08, 0.12, 0.35);
    vec3 electric = vec3(0.25, 0.65, 1.0);
    vec3 cyan = vec3(0.7, 0.98, 1.0);
    vec3 color = mix(deepBlue, electric, intensity);
    color = mix(color, cyan, ribs * turbulence * 0.55);

    gl_FragColor = vec4(color, clamp(intensity * 0.92, 0.0, 0.96));
  }
`;

const pointVertexShader = `
  attribute float size;
  attribute vec3 color;
  varying vec3 vColor;

  void main() {
    vColor = color;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = size * (360.0 / max(1.0, -mvPosition.z));
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const pointFragmentShader = `
  precision highp float;

  varying vec3 vColor;

  void main() {
    vec2 p = gl_PointCoord - vec2(0.5);
    float alpha = smoothstep(0.5, 0.12, length(p));

    if (alpha <= 0.01) {
      discard;
    }

    gl_FragColor = vec4(vColor, alpha);
  }
`;

export function Wormhole({ speed = 1 }: Props) {
  const tunnelRef = useRef<THREE.ShaderMaterial>(null);
  const ringsRef = useRef<THREE.InstancedMesh>(null);
  const particlesRef = useRef<THREE.Points>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const ringCount = 72;
  const particleCount = 1600;

  const particles = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 0.4 + Math.random() * 5.4;
      const z = -Math.random() * 90;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = Math.sin(angle) * radius;
      positions[i * 3 + 2] = z;
      colors[i * 3] = 0.38 + Math.random() * 0.22;
      colors[i * 3 + 1] = 0.78 + Math.random() * 0.18;
      colors[i * 3 + 2] = 1.0;
      sizes[i] = 0.18 + Math.random() * 0.42;
    }

    return { positions, colors, sizes };
  }, []);

  useFrame(({ clock }, delta) => {
    const time = clock.elapsedTime;
    const travel = Math.max(speed, 1) * 7.5;

    if (tunnelRef.current) {
      tunnelRef.current.uniforms.uTime.value = time;
      tunnelRef.current.uniforms.uSpeed.value = speed;
    }

    if (ringsRef.current) {
      for (let i = 0; i < ringCount; i++) {
        const t = i / ringCount;
        const z = (((-t * 90 + time * travel) % 90) + 90) % 90 - 86;
        const pulse = 1 + Math.sin(time * 2 + i * 0.45) * 0.035;
        const radius = 4.6 + t * 1.7;
        dummy.position.set(
          Math.sin(time * 0.45 + i) * 0.08,
          Math.cos(time * 0.38 + i * 0.7) * 0.08,
          z,
        );
        dummy.scale.setScalar(radius * pulse);
        dummy.rotation.set(0, 0, time * 0.2 + i * 0.16);
        dummy.updateMatrix();
        ringsRef.current.setMatrixAt(i, dummy.matrix);
      }
      ringsRef.current.instanceMatrix.needsUpdate = true;
    }

    if (particlesRef.current) {
      const position = particlesRef.current.geometry.attributes.position;
      const arr = position.array as Float32Array;

      for (let i = 0; i < particleCount; i++) {
        const idx = i * 3;
        arr[idx + 2] += travel * delta * (0.65 + (particles.sizes[i] - 0.18));

        if (arr[idx + 2] > 4) {
          const angle = Math.random() * Math.PI * 2;
          const radius = 0.4 + Math.random() * 5.4;
          arr[idx] = Math.cos(angle) * radius;
          arr[idx + 1] = Math.sin(angle) * radius;
          arr[idx + 2] = -88 - Math.random() * 12;
        }
      }

      position.needsUpdate = true;
    }
  });

  return (
    <group>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[6.2, 4.6, 92, 160, 64, true]} />
        <shaderMaterial
          ref={tunnelRef}
          vertexShader={tunnelVertexShader}
          fragmentShader={tunnelFragmentShader}
          uniforms={{
            uTime: { value: 0 },
            uSpeed: { value: speed },
          }}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
        />
      </mesh>

      <instancedMesh ref={ringsRef} args={[undefined, undefined, ringCount]}>
        <ringGeometry args={[0.96, 1.0, 96]} />
        <meshBasicMaterial
          color="#88ddff"
          transparent
          opacity={0.25}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </instancedMesh>

      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[particles.positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[particles.colors, 3]} />
          <bufferAttribute attach="attributes-size" args={[particles.sizes, 1]} />
        </bufferGeometry>
        <shaderMaterial
          vertexShader={pointVertexShader}
          fragmentShader={pointFragmentShader}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}

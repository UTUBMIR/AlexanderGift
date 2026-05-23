import * as THREE from 'three';
import { WebGPURenderer, MeshStandardNodeMaterial } from 'three/webgpu';
import {
    Fn, vec3, vec4, float, uniform, time, positionGeometry,
    cameraPosition, positionWorld, faceDirection, normalize, sub, mix,
    step, length, Loop, mul, texture, color, smoothstep, clamp, abs, sin, cos,
    oneMinus, div, max, negate
} from 'three/tsl';
import { whiteNoise2D, lengthSqrt, smoothRange, vecToFac, ColorRamp3_BSpline } from './tsl-utils.js';
import { generateNoiseTexture } from './textures.js';

export async function createBlackHoleScene(container, onReady) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 100);
  camera.position.set(0, 1.5, 6);

  const renderer = new WebGPURenderer({ antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  renderer.setSize(container.clientWidth, container.clientHeight);
  await renderer.init();
  container.appendChild(renderer.domElement);

  const noiseTex = generateNoiseTexture();

  // --- Black hole mesh ---
  const geometry = new THREE.SphereGeometry(1, 16, 16);
  const material = new MeshStandardNodeMaterial({ side: THREE.DoubleSide });

  const uniforms = {
    iterations: uniform(float(96)),
    stepSize: uniform(float(0.008)),
    noiseFactor: uniform(float(0.012)),
    power: uniform(float(0.35)),
    originRadius: uniform(float(0.13)),
    bandWidth: uniform(float(0.03)),
    rampCol1: uniform(color(0.95, 0.71, 0.44)),
    rampPos1: uniform(float(0.05)),
    rampCol2: uniform(color(0.14, 0.05, 0.03)),
    rampPos2: uniform(float(0.425)),
    rampCol3: uniform(color(0, 0, 0)),
    rampPos3: uniform(float(1.0)),
    rampEmission: uniform(float(2.0)),
    emissionColor: uniform(color(0.14, 0.129, 0.09)),
  };

  material.colorNode = Fn(() => {
    const _step = uniforms.stepSize;
    const noiseAmp = uniforms.noiseFactor;
    const power = uniforms.power;
    const originRadius = uniforms.originRadius;
    const bandWidth = uniforms.bandWidth;
    const iterCount = uniforms.iterations;

    const objCoords = positionGeometry.mul(vec3(1, 1, -1)).xzy;
    const isBackface = step(0.0, negate(faceDirection));
    const camPointObj = mul(cameraPosition, positionGeometry).mul(vec3(1, 1, -1)).xzy;
    const startCoords = mix(objCoords, camPointObj.xyz, isBackface);

    const viewInWorld = normalize(sub(cameraPosition, positionWorld))
      .mul(vec3(1, 1, -1)).xzy;
    const rayDir = negate(viewInWorld);

    const noiseJitter = whiteNoise2D(objCoords.xy).mul(noiseAmp);
    const jitter = rayDir.mul(noiseJitter);
    const rayPos = startCoords.sub(jitter);

    const colorAcc = vec3(0);
    const alphaAcc = float(0.0);

    Loop(iterCount, ({ i }) => {
      const rNorm = normalize(rayPos);
      const rLen = length(rayPos);
      const steerMag = _step.mul(power).div(rLen.mul(rLen));
      const rangeVal = clamp(div(sub(rLen, 0.5), sub(1.0, 0.5)), 0.0, 1.0);
      const steer = rNorm.mul(steerMag.mul(rangeVal));
      const steeredDir = normalize(rayDir.sub(steer));

      const advance = rayDir.mul(_step);
      rayPos.addAssign(advance);

      const xyLen = length(rayPos.mul(vec3(1, 1, 0)));
      const rotPhase = xyLen.mul(4.27).sub(time.mul(0.1));
      const uvAxis = vec3(0, 0, 1);
      const c = cos(rotPhase);
      const s = sin(rotPhase);
      const uvRotX = rayPos.x.mul(c).sub(rayPos.y.mul(s));
      const uvRotY = rayPos.x.mul(s).add(rayPos.y.mul(c));
      const uvRot = vec3(uvRotX, uvRotY, rayPos.z).mul(2);

      const noiseDeep = texture(noiseTex, uvRot);

      const bandMin = negate(bandWidth);
      const dz = sub(vec3(bandMin, 0.0, bandWidth), vec3(rayPos.z));
      const zQuad = dz.mul(dz).div(bandWidth);
      const zBand = max(div(sub(bandWidth, zQuad), bandWidth), 0.0);

      const noiseAmp3 = noiseDeep.mul(zBand);
      const noiseAmpLen = length(noiseAmp3);

      const uvForNormal = uvRot.mul(1.002);
      const noiseNormal = texture(noiseTex, uvForNormal).mul(zBand);
      const noiseNormalLen = length(noiseNormal);

      const rampInput = xyLen
        .add(noiseAmpLen.sub(0.780).mul(1.5))
        .add(noiseAmpLen.sub(noiseNormalLen).mul(19.750));

      const col1 = uniforms.rampCol1;
      const col2 = uniforms.rampCol2;
      const col3 = uniforms.rampCol3;
      const p1 = uniforms.rampPos1;
      const p2 = uniforms.rampPos2;
      const p3 = uniforms.rampPos3;

      const t = clamp(div(sub(rampInput, p1), sub(p2, p1)), 0.0, 1.0);
      const t2 = clamp(div(sub(rampInput, p2), sub(p3, p2)), 0.0, 1.0);
      const col12 = mix(col1, col2, smoothstep(0.0, 1.0, t));
      const baseCol = mix(col12, col3, smoothstep(0.0, 1.0, t2));
      const emissiveCol = baseCol.mul(uniforms.rampEmission).add(uniforms.emissionColor);

      const rLenNow = length(rayPos);
      const insideCore = rLenNow.lessThan(originRadius);
      const shadedCol = mix(emissiveCol, vec3(0), insideCore);

      const zAbs = abs(rayPos.z);
      const aNoise = noiseAmpLen.sub(0.750).mul(-0.60);
      const aPre = zAbs.add(aNoise);
      const aRadial = smoothstep(1.0, 0.0, clamp(xyLen, 0.0, 1.0));
      const aBand = smoothstep(bandWidth, 0.0, clamp(aPre, 0.0, bandWidth)).mul(aRadial);
      const alphaLocal = mix(aBand, 1.0, insideCore);

      const oneMinusA = oneMinus(alphaAcc);
      const weight = oneMinusA.mul(clamp(alphaLocal, 0.0, 1.0));
      const newColor = mix(colorAcc, shadedCol, weight);
      const newAlpha = mix(alphaAcc, 1.0, clamp(alphaLocal, 0.0, 1.0));

      rayPos.addAssign(advance);
      rayDir.assign(steeredDir);
      colorAcc.assign(newColor);
      alphaAcc.assign(newAlpha);
    });

    return colorAcc;
  })();

  material.emissiveNode = material.colorNode;

  const blackHole = new THREE.Mesh(geometry, material);
  scene.add(blackHole);

  // --- Stars background ---
  const starGeo = new THREE.BufferGeometry();
  const starCount = 5000;
  const starPos = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount * 3; i++) {
    starPos[i] = (Math.random() - 0.5) * 200;
  }
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
  const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.15, transparent: true, opacity: 0.8 });
  const stars = new THREE.Points(starGeo, starMat);
  scene.add(stars);

  // --- Resize ---
  const onResize = () => {
    const w = container.clientWidth;
    const h = container.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  };
  window.addEventListener('resize', onResize);

  // --- Zoom-in effect ---
  const zoomDuration = 4;
  let startTime = performance.now();
  let zoomProgress = 0;

  function animate() {
    requestAnimationFrame(animate);

    const elapsed = (performance.now() - startTime) / 1000;
    zoomProgress = Math.min(elapsed / zoomDuration, 1);
    const eased = 1 - Math.pow(1 - zoomProgress, 3);
    camera.position.z = 6 - eased * 4;
    camera.position.y = 1.5 - eased * 0.5;
    camera.lookAt(0, 0, 0);

    stars.rotation.y = elapsed * 0.02;
    renderer.render(scene, camera);
  }

  animate();

  if (onReady) onReady();

  return {
    scene, camera, renderer,
    dispose: () => {
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    }
  };
}

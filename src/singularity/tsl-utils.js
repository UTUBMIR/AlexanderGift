import {
    Fn, vec3, vec4, float, clamp, sin, dot, fract, mix,
    smoothstep, sub, mul, add, step, If, Break, Loop, overloadingFn,
    floor, max, pow, length, normalize, reflect, abs, vec2,
    mx_rgbtohsv, mx_hsvtorgb
} from 'three/tsl';

const _hash = Fn(([p]) => {
    const pp = vec3(p);
    return float(-1.0).add(mul(2.0, fract(sin(dot(pp, vec3(127.1, 311.7, 74.7))).mul(43758.5453123))));
}, { p: 'vec3', return: 'float' });

// These are the functions actually used by the black hole shader

export const whiteNoise2D = Fn(([coord]) => {
    return fract(sin(dot(coord, vec2(12.9898, 78.233))).mul(43758.5453));
}, { coord: 'vec2', return: 'float' });

export const lengthSqrt = Fn(([v]) => {
    return v.x.mul(v.x).add(v.y.mul(v.y)).add(v.z.mul(v.z)).sqrt();
}, { v: 'vec3', return: 'float' });

export const smoothRange = Fn(([value, inMin, inMax, outMin, outMax]) => {
    const t = clamp(value.sub(inMin).div(inMax.sub(inMin)), 0.0, 1.0);
    const smoothT = t.mul(t).mul(float(3.0).sub(t.mul(2.0)));
    return mix(outMin, outMax, smoothT);
}, { value: 'float', inMin: 'float', inMax: 'float', outMin: 'float', outMax: 'float', return: 'float' });

export const vecToFac = Fn(([vector]) => {
    return vector.r.mul(0.2126).add(vector.g.mul(0.7152)).add(vector.b.mul(0.0722));
}, { vector: 'vec3', return: 'float' });

const CatmulRom = Fn(([T, D, C, B, A]) => {
    return mul(0.5, mul(2.0, B).add(A.negate().add(C).mul(T)).add(mul(2.0, A).sub(mul(5.0, B)).add(mul(4.0, C)).sub(D).mul(T).mul(T)).add(A.negate().add(mul(3.0, B)).sub(mul(3.0, C)).add(D).mul(T).mul(T).mul(T)));
}, { T: 'float', D: 'vec3', C: 'vec3', B: 'vec3', A: 'vec3', return: 'vec3' });

export const ColorRamp3_BSpline = Fn(([T, A, B, C]) => {
    const AB = B.w.sub(A.w);
    const BC = C.w.sub(B.w);
    const iAB = T.sub(A.w).div(AB).saturate();
    const iBC = T.sub(B.w).div(BC).saturate();
    const p = vec3(sub(1.0, iAB), iAB.sub(iBC), iBC);
    const cA = CatmulRom(p.x, A.xyz, A.xyz, B.xyz, C.xyz);
    const cB = CatmulRom(p.y, A.xyz, B.xyz, C.xyz, C.xyz);
    const cC = C.xyz;
    If(T.lessThan(B.w), () => { return cA.xyz; });
    If(T.lessThan(C.w), () => { return cB.xyz; });
    return cC.xyz;
}, { T: 'float', A: 'vec4', B: 'vec4', C: 'vec4', return: 'vec3' });

export const linearToSrgb = Fn(([lin]) => {
    const low = lin.mul(12.92);
    const high = pow(lin, vec3(1.0 / 2.4)).mul(1.055).sub(0.055);
    return mix(low, high, step(0.0031308, lin));
}, { lin: 'vec3', return: 'vec3' });

export const srgbToLinear = Fn(([rgb]) => {
    return mix(rgb.div(12.92), pow(add(rgb, 0.055).div(1.055), vec3(2.4)), step(0.04045, rgb));
}, { rgb: 'vec3', return: 'vec3' });

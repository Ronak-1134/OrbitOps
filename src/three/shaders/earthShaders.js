// src/three/shaders/earthShaders.js

export const earthVertexShader = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec2 vUv;

  void main() {
    vNormal   = normalize(normalMatrix * normal);
    vPosition = (modelMatrix * vec4(position, 1.0)).xyz;
    vUv       = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

export const earthFragmentShader = /* glsl */ `
  uniform float uTime;
  uniform vec3  uLightDir;

  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec2 vUv;

  // ── Simple hash noise ────────────────────────────────────────
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1,0)), f.x),
      mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), f.x),
      f.y
    );
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 5; i++) {
      v += a * noise(p);
      p *= 2.1;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    // ── Diffuse lighting ──────────────────────────────────────
    vec3  norm    = normalize(vNormal);
    float diff    = max(dot(norm, normalize(uLightDir)), 0.0);
    float ambient = 0.06;

    // ── Procedural continent mask (fbm noise on UV sphere) ───
    vec2 noiseUV = vUv * vec2(6.0, 4.0);
    float landMask = smoothstep(0.44, 0.56, fbm(noiseUV));

    // ── Colours ───────────────────────────────────────────────
    vec3 oceanDeep    = vec3(0.02, 0.07, 0.18);
    vec3 oceanShallow = vec3(0.04, 0.14, 0.32);
    vec3 land         = vec3(0.09, 0.18, 0.12);
    vec3 landHigh     = vec3(0.14, 0.24, 0.16);
    vec3 ice          = vec3(0.75, 0.85, 0.90);

    // Pole ice caps
    float poleN = smoothstep(0.70,  0.90,  vUv.y);
    float poleS = smoothstep(0.30, 0.10, vUv.y);
    float pole  = max(poleN, poleS);

    // Secondary noise for land variation
    float detail = fbm(noiseUV * 2.3 + 4.7);
    vec3  landColor  = mix(land, landHigh, detail);
    vec3  oceanColor = mix(oceanDeep, oceanShallow,
                           fbm(noiseUV * 0.5) * 0.6);

    vec3 surface = mix(oceanColor, landColor, landMask);
    surface      = mix(surface, ice, pole);

    // ── Specular (ocean only) ─────────────────────────────────
    vec3  viewDir = normalize(-vPosition);
    vec3  halfV   = normalize(normalize(uLightDir) + viewDir);
    float spec    = pow(max(dot(norm, halfV), 0.0), 80.0)
                    * (1.0 - landMask) * 0.35;

    // ── Night-side city glow ──────────────────────────────────
    float night = 1.0 - smoothstep(0.0, 0.3, diff);
    float cityNoise = smoothstep(0.72, 0.78,
                        fbm(noiseUV * 4.0 + 1.5)) * (1.0 - pole);
    vec3 cityLight = vec3(0.9, 0.75, 0.4) * cityNoise * night * 0.55;

    // ── Assemble ──────────────────────────────────────────────
    vec3 color = surface * (diff + ambient) + spec + cityLight;

    // Subtle atmosphere haze at terminator
    float terminator = smoothstep(0.0, 0.15, diff);
    color = mix(color * 0.7 + vec3(0.02, 0.06, 0.12) * 0.3,
                color, terminator);

    gl_FragColor = vec4(color, 1.0);
  }
`

// ── ATMOSPHERE ────────────────────────────────────────────────────

export const atmosphereVertexShader = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vViewDir;

  void main() {
    vNormal  = normalize(normalMatrix * normal);
    vViewDir = normalize(-(modelViewMatrix * vec4(position, 1.0)).xyz);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

export const atmosphereFragmentShader = /* glsl */ `
  uniform vec3 uAtmColor;
  varying vec3 vNormal;
  varying vec3 vViewDir;

  void main() {
    float fresnel = pow(1.0 - max(dot(vNormal, vViewDir), 0.0), 3.5);
    gl_FragColor  = vec4(uAtmColor * fresnel, fresnel * 0.7);
  }
`

// ── ORBITAL GLOW LINE ─────────────────────────────────────────────

export const orbitVertexShader = /* glsl */ `
  void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

export const orbitFragmentShader = /* glsl */ `
  uniform vec3  uColor;
  uniform float uOpacity;

  void main() {
    gl_FragColor = vec4(uColor, uOpacity);
  }
`
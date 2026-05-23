// src/three/EarthGlobe.jsx
import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import {
  earthVertexShader, earthFragmentShader,
  atmosphereVertexShader, atmosphereFragmentShader,
} from './shaders/earthShaders'

const LIGHT_DIR = new THREE.Vector3(3, 2, 3).normalize()

// ── ISS orbit parameters ──────────────────────────────────────────
const ISS_INCLINATION = 51.6 * (Math.PI / 180)
const ISS_ORBIT_R     = 1.065  // slightly above Earth radius 1.0
const ISS_PERIOD      = 18     // seconds per orbit (visual)

function buildOrbitPoints(r, inc, segments = 256) {
  const pts = []
  for (let i = 0; i <= segments; i++) {
    const t   = (i / segments) * Math.PI * 2
    const x   = r * Math.cos(t)
    const y   = r * Math.sin(t) * Math.sin(inc)
    const z   = r * Math.sin(t) * Math.cos(inc)
    pts.push(new THREE.Vector3(x, y, z))
  }
  return pts
}

// ── Sub-components ─────────────────────────────────────────────────

function Earth() {
  const meshRef = useRef()
  const uniforms = useMemo(() => ({
    uTime:     { value: 0 },
    uLightDir: { value: LIGHT_DIR },
  }), [])

  useFrame((_, delta) => {
    uniforms.uTime.value += delta
    if (meshRef.current) meshRef.current.rotation.y += delta * 0.04
  })

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1, 96, 96]} />
      <shaderMaterial
        vertexShader={earthVertexShader}
        fragmentShader={earthFragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  )
}

function Atmosphere() {
  const uniforms = useMemo(() => ({
    uAtmColor: { value: new THREE.Color(0.1, 0.5, 1.0) },
  }), [])

  return (
    <mesh>
      <sphereGeometry args={[1.06, 64, 64]} />
      <shaderMaterial
        vertexShader={atmosphereVertexShader}
        fragmentShader={atmosphereFragmentShader}
        uniforms={uniforms}
        side={THREE.BackSide}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  )
}

function AtmosphereInner() {
  const uniforms = useMemo(() => ({
    uAtmColor: { value: new THREE.Color(0.05, 0.3, 0.7) },
  }), [])

  return (
    <mesh>
      <sphereGeometry args={[1.015, 64, 64]} />
      <shaderMaterial
        vertexShader={atmosphereVertexShader}
        fragmentShader={atmosphereFragmentShader}
        uniforms={uniforms}
        side={THREE.FrontSide}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  )
}

function ISSOrbit() {
  const issRef  = useRef()
  const trailRef = useRef()

  const orbitPoints = useMemo(() =>
    buildOrbitPoints(ISS_ORBIT_R, ISS_INCLINATION), [])

  const orbitGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry().setFromPoints(orbitPoints)
    return geo
  }, [orbitPoints])

  // ISS dot follows the path
  useFrame(({ clock }) => {
    if (!issRef.current) return
    const t   = (clock.getElapsedTime() / ISS_PERIOD) * Math.PI * 2
    const x   = ISS_ORBIT_R * Math.cos(t)
    const y   = ISS_ORBIT_R * Math.sin(t) * Math.sin(ISS_INCLINATION)
    const z   = ISS_ORBIT_R * Math.sin(t) * Math.cos(ISS_INCLINATION)
    issRef.current.position.set(x, y, z)
  })

  return (
    <group>
      {/* Orbit ring */}
      <line geometry={orbitGeometry}>
        <lineBasicMaterial
          color={0x00d4ff}
          opacity={0.18}
          transparent
          depthWrite={false}
        />
      </line>

      {/* ISS dot */}
      <group ref={issRef}>
        {/* Glow halo */}
        <mesh>
          <sphereGeometry args={[0.018, 8, 8]} />
          <meshBasicMaterial
            color={0x00d4ff}
            transparent
            opacity={0.15}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
        {/* Core */}
        <mesh>
          <sphereGeometry args={[0.008, 8, 8]} />
          <meshBasicMaterial color={0x33eeff} />
        </mesh>
      </group>
    </group>
  )
}

function Stars() {
  const geo = useMemo(() => {
    const count = 4000
    const pos   = new Float32Array(count * 3)
    const sizes = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi   = Math.acos(2 * Math.random() - 1)
      const r     = 80 + Math.random() * 20
      pos[i * 3]     = r * Math.sin(phi) * Math.cos(theta)
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      pos[i * 3 + 2] = r * Math.cos(phi)
      sizes[i] = Math.random() * 2.5 + 0.5
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    g.setAttribute('size',     new THREE.BufferAttribute(sizes, 1))
    return g
  }, [])

  return (
    <points geometry={geo}>
      <pointsMaterial
        color={0xffffff}
        size={0.12}
        sizeAttenuation
        transparent
        opacity={0.75}
        depthWrite={false}
      />
    </points>
  )
}

// ── Secondary orbit rings (decorative) ────────────────────────────
function DecorativeOrbits() {
  const rings = useMemo(() => [
    { r: 1.22, inc: 28  * Math.PI / 180, color: 0xf5a623, opacity: 0.10 },
    { r: 1.38, inc: -15 * Math.PI / 180, color: 0x00e5a0, opacity: 0.07 },
  ], [])

  return (
    <>
      {rings.map((ring, i) => {
        const pts = buildOrbitPoints(ring.r, ring.inc)
        const geo = new THREE.BufferGeometry().setFromPoints(pts)
        return (
          <line key={i} geometry={geo}>
            <lineBasicMaterial
              color={ring.color}
              opacity={ring.opacity}
              transparent
              depthWrite={false}
            />
          </line>
        )
      })}
    </>
  )
}

// ── EXPORTED SCENE ─────────────────────────────────────────────────
export default function EarthGlobe() {
  const groupRef = useRef()

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x, -0.15, delta * 0.5
      )
    }
  })

  return (
    <group ref={groupRef}>
      <Stars />
      <Earth />
      <AtmosphereInner />
      <Atmosphere />
      <ISSOrbit />
      <DecorativeOrbits />
      {/* Subtle directional light for specular */}
      <directionalLight position={[3, 2, 3]} intensity={0.0} />
    </group>
  )
}
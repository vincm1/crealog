<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as THREE from 'three'

const el = ref<HTMLDivElement | null>(null)

// ── Tuning constants ──────────────────────────────────────────────────────────
const N           = 36        // node count
const RADIUS      = 3.8       // sphere radius
const CONNECT_D   = 2.35      // max distance for a connection
const ORBIT_SPEED = 0.024     // rad/s  — full rotation ≈ 4.4 min
const MOUSE_TILT  = 0.18      // max group tilt from mouse (rad)
const LERP_MOUSE  = 0.032     // mouse smoothing (lower = laggier / more organic)

interface NodeMeta {
  base:  THREE.Vector3   // resting position (on init sphere)
  phase: THREE.Vector3   // random oscillation phase per axis
  freq:  THREE.Vector3   // oscillation freq per axis (rad/s)
  amp:   number          // drift amplitude
}

// Mutable state kept outside Vue reactivity for zero overhead
let raf       = 0
let renderer: THREE.WebGLRenderer
let camera:   THREE.PerspectiveCamera
let scene:    THREE.Scene
let group:    THREE.Group
let meta:     NodeMeta[]
let pairs:    [number, number][]
let nodePos:  THREE.BufferAttribute
let linePos:  THREE.BufferAttribute
let cleanupFn: (() => void) | null = null

const mT = { x: 0, y: 0 }   // mouse target (raw)
const mS = { x: 0, y: 0 }   // mouse smoothed

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Even distribution across a sphere via Fibonacci lattice */
function fibSphere(n: number, r: number): THREE.Vector3[] {
  const phi = Math.PI * (3 - Math.sqrt(5))
  return Array.from({ length: n }, (_, i) => {
    const y    = 1 - (i / (n - 1)) * 2
    const rho  = Math.sqrt(Math.max(0, 1 - y * y))
    const th   = phi * i
    // Vary the radial distance so nodes fill a volume, not just the surface
    const scale = r * (0.22 + 0.78 * Math.cbrt(Math.random()))
    return new THREE.Vector3(Math.cos(th) * rho * scale, y * scale, Math.sin(th) * rho * scale)
  })
}

/** Radial gradient canvas texture for soft-glow sprite */
function glowTex(r: number, g: number, b: number, size = 64): THREE.CanvasTexture {
  const c  = document.createElement('canvas')
  c.width  = size
  c.height = size
  const cx = c.getContext('2d')!
  const gd = cx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  gd.addColorStop(0,    `rgba(${r},${g},${b},1)`)
  gd.addColorStop(0.28, `rgba(${r},${g},${b},0.55)`)
  gd.addColorStop(0.65, `rgba(${r},${g},${b},0.12)`)
  gd.addColorStop(1,    `rgba(${r},${g},${b},0)`)
  cx.fillStyle = gd
  cx.fillRect(0, 0, size, size)
  return new THREE.CanvasTexture(c)
}

// ── Lifecycle ─────────────────────────────────────────────────────────────────

onMounted(() => {
  if (!el.value) return
  const W = el.value.clientWidth
  const H = el.value.clientHeight

  // Renderer ──────────────────────────────────────────────────────────────────
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: false,
    powerPreference: 'high-performance',
  })
  renderer.setSize(W, H)
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75))
  renderer.setClearColor(0x050a0f, 1)
  el.value.appendChild(renderer.domElement)

  // Scene & Camera ────────────────────────────────────────────────────────────
  scene  = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 120)
  camera.position.z = 11

  group = new THREE.Group()
  scene.add(group)

  // Nodes ─────────────────────────────────────────────────────────────────────
  const positions = fibSphere(N, RADIUS)
  meta = positions.map(base => ({
    base:  base.clone(),
    phase: new THREE.Vector3(Math.random() * Math.PI * 2, Math.random() * Math.PI * 2, Math.random() * Math.PI * 2),
    freq:  new THREE.Vector3(0.10 + Math.random() * 0.16, 0.08 + Math.random() * 0.13, 0.09 + Math.random() * 0.15),
    amp:   0.06 + Math.random() * 0.14,
  }))

  // Shared Float32 buffer — updated every frame
  const nArr = new Float32Array(N * 3)
  for (let i = 0; i < N; i++) {
    nArr[i * 3]     = meta[i].base.x
    nArr[i * 3 + 1] = meta[i].base.y
    nArr[i * 3 + 2] = meta[i].base.z
  }

  // Outer glow  (large soft sprite, additive)
  const glowGeo = new THREE.BufferGeometry()
  nodePos       = new THREE.BufferAttribute(nArr, 3)
  nodePos.setUsage(THREE.DynamicDrawUsage)
  glowGeo.setAttribute('position', nodePos)
  group.add(new THREE.Points(glowGeo, new THREE.PointsMaterial({
    size:          0.60,
    map:           glowTex(48, 168, 255),   // sky-ish blue
    transparent:   true,
    blending:      THREE.AdditiveBlending,
    depthWrite:    false,
    sizeAttenuation: true,
  })))

  // Inner core  (tiny bright white-blue dot)
  const coreGeo = new THREE.BufferGeometry()
  coreGeo.setAttribute('position', nodePos)   // ← same buffer, zero copy
  group.add(new THREE.Points(coreGeo, new THREE.PointsMaterial({
    size:          0.11,
    map:           glowTex(210, 238, 255),   // near-white-blue
    transparent:   true,
    blending:      THREE.AdditiveBlending,
    depthWrite:    false,
    sizeAttenuation: true,
  })))

  // Connections ───────────────────────────────────────────────────────────────
  pairs = []
  for (let i = 0; i < N; i++)
    for (let j = i + 1; j < N; j++)
      if (meta[i].base.distanceTo(meta[j].base) < CONNECT_D)
        pairs.push([i, j])

  const lArr   = new Float32Array(pairs.length * 6)
  const lineGeo = new THREE.BufferGeometry()
  linePos       = new THREE.BufferAttribute(lArr, 3)
  linePos.setUsage(THREE.DynamicDrawUsage)
  lineGeo.setAttribute('position', linePos)
  group.add(new THREE.LineSegments(lineGeo, new THREE.LineBasicMaterial({
    color:       0x1a3a6e,
    transparent: true,
    opacity:     0.28,
    blending:    THREE.AdditiveBlending,
    depthWrite:  false,
  })))

  // Distant star field (static — no update needed) ────────────────────────────
  const starCount = 220
  const sArr      = new Float32Array(starCount * 3)
  for (let i = 0; i < starCount; i++) {
    const th  = Math.random() * Math.PI * 2
    const ph  = Math.acos(2 * Math.random() - 1)
    const r   = 10 + Math.random() * 8
    sArr[i * 3]     = r * Math.sin(ph) * Math.cos(th)
    sArr[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th)
    sArr[i * 3 + 2] = r * Math.cos(ph)
  }
  const starGeo = new THREE.BufferGeometry()
  starGeo.setAttribute('position', new THREE.BufferAttribute(sArr, 3))
  scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({
    size:        0.038,
    color:       0x3a5a80,
    transparent: true,
    opacity:     0.55,
    sizeAttenuation: true,
  })))

  // Render loop ───────────────────────────────────────────────────────────────
  const tick = (ms: number) => {
    raf = requestAnimationFrame(tick)
    const t = ms * 0.001   // seconds

    // Smooth mouse
    mS.x += (mT.x - mS.x) * LERP_MOUSE
    mS.y += (mT.y - mS.y) * LERP_MOUSE

    // Animate node positions
    const na = nodePos.array as Float32Array
    for (let i = 0; i < N; i++) {
      const m = meta[i]
      na[i * 3]     = m.base.x + Math.sin(t * m.freq.x + m.phase.x) * m.amp
      na[i * 3 + 1] = m.base.y + Math.sin(t * m.freq.y + m.phase.y) * m.amp
      na[i * 3 + 2] = m.base.z + Math.sin(t * m.freq.z + m.phase.z) * m.amp
    }
    nodePos.needsUpdate = true

    // Pull line endpoints from the same buffer
    const la = linePos.array as Float32Array
    for (let k = 0; k < pairs.length; k++) {
      const [a, b] = pairs[k]
      la[k * 6]     = na[a * 3];     la[k * 6 + 1] = na[a * 3 + 1]; la[k * 6 + 2] = na[a * 3 + 2]
      la[k * 6 + 3] = na[b * 3];     la[k * 6 + 4] = na[b * 3 + 1]; la[k * 6 + 5] = na[b * 3 + 2]
    }
    linePos.needsUpdate = true

    // Group transform: slow orbit + mouse parallax
    group.rotation.y = t * ORBIT_SPEED + mS.x * MOUSE_TILT
    group.rotation.x = mS.y * (MOUSE_TILT * 0.65)

    renderer.render(scene, camera)
  }
  raf = requestAnimationFrame(tick)

  // Event handlers ────────────────────────────────────────────────────────────
  const onMove = (e: MouseEvent) => {
    if (!el.value) return
    const rect = el.value.getBoundingClientRect()
    mT.x =  ((e.clientX - rect.left) / rect.width  - 0.5) * 2
    mT.y = -((e.clientY - rect.top)  / rect.height - 0.5) * 2
  }
  const onResize = () => {
    if (!el.value) return
    const w = el.value.clientWidth
    const h = el.value.clientHeight
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    renderer.setSize(w, h)
  }

  el.value.addEventListener('mousemove', onMove)
  window.addEventListener('resize', onResize)

  cleanupFn = () => {
    el.value?.removeEventListener('mousemove', onMove)
    window.removeEventListener('resize', onResize)
  }
})

onBeforeUnmount(() => {
  cancelAnimationFrame(raf)
  cleanupFn?.()
  renderer?.dispose()
})
</script>

<template>
  <div ref="el" class="w-full h-full" />
</template>

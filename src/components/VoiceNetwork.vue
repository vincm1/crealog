<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as THREE from 'three'

// ── Props ─────────────────────────────────────────────────────────────────────
const props = withDefaults(defineProps<{
  offsetX?: number   // world-space X offset to shift the cluster (positive = right)
  offsetY?: number
}>(), { offsetX: 0, offsetY: 0 })

const el = ref<HTMLDivElement | null>(null)

// ── Constants ─────────────────────────────────────────────────────────────────
const N           = 36
const RADIUS      = 3.6
const CONNECT_D   = 2.3
const ORBIT_SPEED = 0.024     // rad/s
const MOUSE_TILT  = 0.16
const LERP_MOUSE  = 0.030
const RING_PERIOD = 3.8       // seconds per full ring cycle
const RING_COUNT  = 4         // staggered rings

interface NodeMeta {
  base:  THREE.Vector3
  phase: THREE.Vector3
  freq:  THREE.Vector3
  amp:   number
}

interface RingData {
  line: THREE.Line
  mat:  THREE.LineBasicMaterial
  phase: number
}

let raf       = 0
let renderer: THREE.WebGLRenderer
let camera:   THREE.PerspectiveCamera
let scene:    THREE.Scene
let group:    THREE.Group
let meta:     NodeMeta[]
let pairs:    [number, number][]
let nodePos:  THREE.BufferAttribute
let linePos:  THREE.BufferAttribute
let ringData: RingData[]
let cleanupFn: (() => void) | null = null

const mT = { x: 0, y: 0 }
const mS = { x: 0, y: 0 }

// ── Helpers ───────────────────────────────────────────────────────────────────

function fibSphere(n: number, r: number): THREE.Vector3[] {
  const phi = Math.PI * (3 - Math.sqrt(5))
  return Array.from({ length: n }, (_, i) => {
    const y   = 1 - (i / (n - 1)) * 2
    const rho = Math.sqrt(Math.max(0, 1 - y * y))
    const th  = phi * i
    const s   = r * (0.22 + 0.78 * Math.cbrt(Math.random()))
    return new THREE.Vector3(Math.cos(th) * rho * s, y * s, Math.sin(th) * rho * s)
  })
}

function glowTex(r: number, g: number, b: number, size = 64): THREE.CanvasTexture {
  const c  = document.createElement('canvas')
  c.width  = size; c.height = size
  const cx = c.getContext('2d')!
  const gd = cx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2)
  gd.addColorStop(0,    `rgba(${r},${g},${b},1)`)
  gd.addColorStop(0.28, `rgba(${r},${g},${b},0.55)`)
  gd.addColorStop(0.65, `rgba(${r},${g},${b},0.12)`)
  gd.addColorStop(1,    `rgba(${r},${g},${b},0)`)
  cx.fillStyle = gd; cx.fillRect(0, 0, size, size)
  return new THREE.CanvasTexture(c)
}

/** Unit circle as a closed LineLoop — cloned per ring so geometry is shared */
function makeCircleGeo(segments = 96): THREE.BufferGeometry {
  const pts = Array.from({ length: segments + 1 }, (_, i) => {
    const a = (i / segments) * Math.PI * 2
    return new THREE.Vector3(Math.cos(a), Math.sin(a), 0)
  })
  return new THREE.BufferGeometry().setFromPoints(pts)
}

// ── Setup ─────────────────────────────────────────────────────────────────────

onMounted(() => {
  if (!el.value) return
  const W = el.value.clientWidth
  const H = el.value.clientHeight

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' })
  renderer.setSize(W, H)
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75))
  renderer.setClearColor(0x050a0f, 1)
  el.value.appendChild(renderer.domElement)

  // Scene & Camera
  scene  = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 120)
  camera.position.z = 11

  group = new THREE.Group()
  group.position.set(props.offsetX, props.offsetY, 0)
  scene.add(group)

  // ── Nodes ──────────────────────────────────────────────────────────────────
  const positions = fibSphere(N, RADIUS)
  meta = positions.map(base => ({
    base:  base.clone(),
    phase: new THREE.Vector3(Math.random() * Math.PI * 2, Math.random() * Math.PI * 2, Math.random() * Math.PI * 2),
    freq:  new THREE.Vector3(0.10 + Math.random() * 0.16, 0.08 + Math.random() * 0.13, 0.09 + Math.random() * 0.15),
    amp:   0.06 + Math.random() * 0.14,
  }))

  const nArr = new Float32Array(N * 3)
  for (let i = 0; i < N; i++) {
    nArr[i * 3] = meta[i].base.x; nArr[i * 3 + 1] = meta[i].base.y; nArr[i * 3 + 2] = meta[i].base.z
  }

  // Glow layer (outer, additive, large) — cyan-teal for AI feel
  const glowGeo = new THREE.BufferGeometry()
  nodePos       = new THREE.BufferAttribute(nArr, 3)
  nodePos.setUsage(THREE.DynamicDrawUsage)
  glowGeo.setAttribute('position', nodePos)
  group.add(new THREE.Points(glowGeo, new THREE.PointsMaterial({
    size: 0.58, map: glowTex(40, 190, 255),
    transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true,
  })))

  // Core layer (inner, bright near-white)
  const coreGeo = new THREE.BufferGeometry()
  coreGeo.setAttribute('position', nodePos)
  group.add(new THREE.Points(coreGeo, new THREE.PointsMaterial({
    size: 0.10, map: glowTex(210, 240, 255),
    transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true,
  })))

  // ── Connections ─────────────────────────────────────────────────────────────
  pairs = []
  for (let i = 0; i < N; i++)
    for (let j = i + 1; j < N; j++)
      if (meta[i].base.distanceTo(meta[j].base) < CONNECT_D) pairs.push([i, j])

  const lArr    = new Float32Array(pairs.length * 6)
  const lineGeo = new THREE.BufferGeometry()
  linePos       = new THREE.BufferAttribute(lArr, 3)
  linePos.setUsage(THREE.DynamicDrawUsage)
  lineGeo.setAttribute('position', linePos)
  group.add(new THREE.LineSegments(lineGeo, new THREE.LineBasicMaterial({
    color: 0x1a4080, transparent: true, opacity: 0.26,
    blending: THREE.AdditiveBlending, depthWrite: false,
  })))

  // ── Voice AI: sonar pulse rings ─────────────────────────────────────────────
  // Rings sit at the origin of the group and expand outward, simulating
  // audio/voice signal propagation. Three planes give depth.
  const circleGeo = makeCircleGeo()

  const RING_PLANES = [
    { rx: 0,                     ry: 0,    rz: 0 },               // XY  — front-facing
    { rx: Math.PI / 2,           ry: 0,    rz: 0 },               // XZ  — horizontal
    { rx: Math.PI / 4,           ry: 0.4,  rz: 0 },               // tilted — gives depth
  ]

  ringData = []
  for (let ri = 0; ri < RING_COUNT; ri++) {
    const plane = RING_PLANES[ri % RING_PLANES.length]
    const mat   = new THREE.LineBasicMaterial({
      color: 0x30aaff, transparent: true, opacity: 0,
      blending: THREE.AdditiveBlending, depthWrite: false,
    })
    const line = new THREE.Line(circleGeo, mat)
    line.rotation.set(plane.rx, plane.ry, plane.rz)
    group.add(line)
    ringData.push({ line, mat, phase: (ri / RING_COUNT) * RING_PERIOD })
  }

  // ── Central nucleus glow (the "voice source") ───────────────────────────────
  const nucleusArr = new Float32Array([0, 0, 0])
  const nucleusGeo = new THREE.BufferGeometry()
  nucleusGeo.setAttribute('position', new THREE.BufferAttribute(nucleusArr, 3))
  // Outer halo
  group.add(new THREE.Points(nucleusGeo, new THREE.PointsMaterial({
    size: 1.2, map: glowTex(80, 200, 255, 128),
    transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true,
  })))
  // Bright core
  const nucleusCoreGeo = new THREE.BufferGeometry()
  nucleusCoreGeo.setAttribute('position', new THREE.BufferAttribute(nucleusArr, 3))
  group.add(new THREE.Points(nucleusCoreGeo, new THREE.PointsMaterial({
    size: 0.28, map: glowTex(220, 245, 255),
    transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true,
  })))

  // ── Background star field ───────────────────────────────────────────────────
  const SC = 220, sArr = new Float32Array(SC * 3)
  for (let i = 0; i < SC; i++) {
    const th = Math.random() * Math.PI * 2, ph = Math.acos(2 * Math.random() - 1), r = 10 + Math.random() * 9
    sArr[i*3] = r * Math.sin(ph) * Math.cos(th); sArr[i*3+1] = r * Math.sin(ph) * Math.sin(th); sArr[i*3+2] = r * Math.cos(ph)
  }
  const sGeo = new THREE.BufferGeometry()
  sGeo.setAttribute('position', new THREE.BufferAttribute(sArr, 3))
  scene.add(new THREE.Points(sGeo, new THREE.PointsMaterial({
    size: 0.038, color: 0x3a5a80, transparent: true, opacity: 0.5, sizeAttenuation: true,
  })))

  // ── Render loop ─────────────────────────────────────────────────────────────
  const tick = (ms: number) => {
    raf = requestAnimationFrame(tick)
    const t = ms * 0.001

    // Smooth mouse
    mS.x += (mT.x - mS.x) * LERP_MOUSE
    mS.y += (mT.y - mS.y) * LERP_MOUSE

    // Animate node positions
    const na = nodePos.array as Float32Array
    for (let i = 0; i < N; i++) {
      const m = meta[i]
      na[i*3]   = m.base.x + Math.sin(t * m.freq.x + m.phase.x) * m.amp
      na[i*3+1] = m.base.y + Math.sin(t * m.freq.y + m.phase.y) * m.amp
      na[i*3+2] = m.base.z + Math.sin(t * m.freq.z + m.phase.z) * m.amp
    }
    nodePos.needsUpdate = true

    // Update connection endpoints
    const la = linePos.array as Float32Array
    for (let k = 0; k < pairs.length; k++) {
      const [a, b] = pairs[k]
      la[k*6]   = na[a*3];   la[k*6+1] = na[a*3+1]; la[k*6+2] = na[a*3+2]
      la[k*6+3] = na[b*3];   la[k*6+4] = na[b*3+1]; la[k*6+5] = na[b*3+2]
    }
    linePos.needsUpdate = true

    // Animate sonar pulse rings
    for (const r of ringData) {
      const prog = ((t + r.phase) % RING_PERIOD) / RING_PERIOD   // 0 → 1
      const scale = 0.15 + prog * 5.0                             // expands outward
      r.line.scale.setScalar(scale)
      // Opaque near center, fades as it expands; cubic falloff feels more physical
      r.mat.opacity = Math.max(0, 0.38 * Math.pow(1 - prog, 2.2))
    }

    // Group transform: slow orbit + mouse parallax
    group.rotation.y = t * ORBIT_SPEED + mS.x * MOUSE_TILT
    group.rotation.x = mS.y * (MOUSE_TILT * 0.6)

    renderer.render(scene, camera)
  }
  raf = requestAnimationFrame(tick)

  // Events
  const onMove = (e: MouseEvent) => {
    if (!el.value) return
    const rect = el.value.getBoundingClientRect()
    mT.x =  ((e.clientX - rect.left) / rect.width  - 0.5) * 2
    mT.y = -((e.clientY - rect.top)  / rect.height - 0.5) * 2
  }
  const onResize = () => {
    if (!el.value) return
    const w = el.value.clientWidth, h = el.value.clientHeight
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

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
const N           = 58        // endpoints in the network
const RADIUS      = 4.0
const CONNECT_D   = 1.95      // max distance for an automatic link
const MIN_LINKS   = 2         // guarantee every node is reachable (routing needs this)
const PACKETS     = 42        // simultaneous signals travelling the network
const PKT_SPEED   = [1.3, 2.4] // world units / second (min, max)
const ORBIT_SPEED = 0.022     // rad/s — full rotation ≈ 4.8 min
const MOUSE_TILT  = 0.15
const LERP_MOUSE  = 0.030
const RING_PERIOD = 4.2        // seconds per sonar-ring cycle
const RING_COUNT  = 3

interface NodeMeta {
  base:  THREE.Vector3
  phase: THREE.Vector3
  freq:  THREE.Vector3
  amp:   number
}

interface Packet {
  from:  number   // node index the signal departed from
  to:    number   // node index it is heading toward
  t:     number   // 0 → 1 progress along the edge
  speed: number   // world units / sec
}

interface RingData {
  line:  THREE.Line
  mat:   THREE.LineBasicMaterial
  phase: number
}

let raf       = 0
let lastMs    = 0
let renderer: THREE.WebGLRenderer
let camera:   THREE.PerspectiveCamera
let scene:    THREE.Scene
let group:    THREE.Group
let meta:     NodeMeta[]
let pairs:    [number, number][]
let adj:      number[][]          // adjacency list for routing
let edgeLen:  Map<number, number> // base length per node-pair key (speed normalisation)
let packets:  Packet[]
let nodePos:  THREE.BufferAttribute
let brightAt: THREE.BufferAttribute
let bright:   Float32Array
let linePos:  THREE.BufferAttribute
let pktPos:   THREE.BufferAttribute
let nodeMat:  THREE.ShaderMaterial
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
    const s   = r * (0.24 + 0.76 * Math.cbrt(Math.random()))
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

function makeCircleGeo(segments = 96): THREE.BufferGeometry {
  const pts = Array.from({ length: segments + 1 }, (_, i) => {
    const a = (i / segments) * Math.PI * 2
    return new THREE.Vector3(Math.cos(a), Math.sin(a), 0)
  })
  return new THREE.BufferGeometry().setFromPoints(pts)
}

const edgeKey = (i: number, j: number) => (i < j ? i * 1000 + j : j * 1000 + i)

// ── Setup ─────────────────────────────────────────────────────────────────────

onMounted(() => {
  if (!el.value) return
  const W = el.value.clientWidth
  const H = el.value.clientHeight

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' })
  renderer.setSize(W, H)
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75))
  renderer.setClearColor(0x050a0f, 1)
  el.value.appendChild(renderer.domElement)

  scene  = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 120)
  camera.position.z = 11

  group = new THREE.Group()
  group.position.set(props.offsetX, props.offsetY, 0)
  scene.add(group)

  // ── Grounding glow ──────────────────────────────────────────────────────────
  // A large, soft pool of light sitting behind the cluster so it reads as a
  // deliberate, anchored object instead of floating in the void.
  const groundGeo = new THREE.BufferGeometry()
  groundGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([0, 0, -2.5]), 3))
  group.add(new THREE.Points(groundGeo, new THREE.PointsMaterial({
    size: 13, map: glowTex(22, 70, 138, 256),
    transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true,
  })))

  // ── Nodes ──────────────────────────────────────────────────────────────────
  const positions = fibSphere(N, RADIUS)
  meta = positions.map(base => ({
    base:  base.clone(),
    phase: new THREE.Vector3(Math.random() * Math.PI * 2, Math.random() * Math.PI * 2, Math.random() * Math.PI * 2),
    freq:  new THREE.Vector3(0.10 + Math.random() * 0.16, 0.08 + Math.random() * 0.13, 0.09 + Math.random() * 0.15),
    amp:   0.05 + Math.random() * 0.13,
  }))

  const nArr = new Float32Array(N * 3)
  for (let i = 0; i < N; i++) {
    nArr[i*3] = meta[i].base.x; nArr[i*3+1] = meta[i].base.y; nArr[i*3+2] = meta[i].base.z
  }
  nodePos = new THREE.BufferAttribute(nArr, 3)
  nodePos.setUsage(THREE.DynamicDrawUsage)

  // Per-node brightness (flashes when a signal arrives) drives the node shader
  bright   = new Float32Array(N).fill(0.1)
  brightAt = new THREE.BufferAttribute(bright, 1)
  brightAt.setUsage(THREE.DynamicDrawUsage)

  // Soft atmospheric halo (shared buffer, additive)
  const haloGeo = new THREE.BufferGeometry()
  haloGeo.setAttribute('position', nodePos)
  group.add(new THREE.Points(haloGeo, new THREE.PointsMaterial({
    size: 0.36, map: glowTex(40, 150, 235),
    transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true,
  })))

  // Reactive node cores — custom shader: size + colour scale with brightness
  nodeMat = new THREE.ShaderMaterial({
    uniforms: { uScale: { value: H * 0.5 } },
    transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
    vertexShader: /* glsl */`
      attribute float aBright;
      uniform float uScale;
      varying float vBright;
      void main() {
        vBright = aBright;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        float worldSize = mix(0.10, 0.66, clamp(vBright, 0.0, 1.0));
        gl_PointSize = worldSize * uScale / -mv.z;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */`
      precision mediump float;
      varying float vBright;
      void main() {
        vec2 uv = gl_PointCoord - 0.5;
        float d = length(uv);
        float disc = smoothstep(0.5, 0.0, d);
        float glow = pow(disc, 1.6);
        vec3 idle = vec3(0.13, 0.58, 1.0);   // calm cyan-blue
        vec3 hot  = vec3(0.85, 0.94, 1.0);   // hot near-white on signal
        vec3 col  = mix(idle, hot, clamp(vBright, 0.0, 1.0));
        float a   = glow * (0.5 + 0.5 * clamp(vBright, 0.0, 1.0));
        if (a < 0.01) discard;
        gl_FragColor = vec4(col, a);
      }`,
  })
  const coreGeo = new THREE.BufferGeometry()
  coreGeo.setAttribute('position', nodePos)
  coreGeo.setAttribute('aBright', brightAt)
  group.add(new THREE.Points(coreGeo, nodeMat))

  // ── Edges + adjacency (the communication topology) ──────────────────────────
  pairs   = []
  adj     = Array.from({ length: N }, () => [] as number[])
  edgeLen = new Map()
  const seen = new Set<number>()
  const addEdge = (i: number, j: number) => {
    if (i === j) return
    const k = edgeKey(i, j)
    if (seen.has(k)) return
    seen.add(k)
    pairs.push([i, j])
    adj[i].push(j); adj[j].push(i)
    edgeLen.set(k, meta[i].base.distanceTo(meta[j].base))
  }
  // proximity links
  for (let i = 0; i < N; i++)
    for (let j = i + 1; j < N; j++)
      if (meta[i].base.distanceTo(meta[j].base) < CONNECT_D) addEdge(i, j)
  // guarantee minimum connectivity so signals never strand
  for (let i = 0; i < N; i++) {
    if (adj[i].length >= MIN_LINKS) continue
    const near = meta
      .map((m, j) => ({ j, d: meta[i].base.distanceTo(m.base) }))
      .filter(o => o.j !== i)
      .sort((a, b) => a.d - b.d)
    for (let n = 0; n < MIN_LINKS && n < near.length; n++) addEdge(i, near[n].j)
  }

  const lArr   = new Float32Array(pairs.length * 6)
  const lineGeo = new THREE.BufferGeometry()
  linePos       = new THREE.BufferAttribute(lArr, 3)
  linePos.setUsage(THREE.DynamicDrawUsage)
  lineGeo.setAttribute('position', linePos)
  group.add(new THREE.LineSegments(lineGeo, new THREE.LineBasicMaterial({
    color: 0x1c4a8c, transparent: true, opacity: 0.22,
    blending: THREE.AdditiveBlending, depthWrite: false,
  })))

  // ── Signals / packets routed through the network ────────────────────────────
  packets = Array.from({ length: PACKETS }, () => {
    const [a, b] = pairs[(Math.random() * pairs.length) | 0]
    const fwd = Math.random() < 0.5
    return {
      from:  fwd ? a : b,
      to:    fwd ? b : a,
      t:     Math.random(),
      speed: PKT_SPEED[0] + Math.random() * (PKT_SPEED[1] - PKT_SPEED[0]),
    }
  })

  const pArr   = new Float32Array(PACKETS * 3)
  const pktGeo = new THREE.BufferGeometry()
  pktPos       = new THREE.BufferAttribute(pArr, 3)
  pktPos.setUsage(THREE.DynamicDrawUsage)
  pktGeo.setAttribute('position', pktPos)
  // outer glow of the signal
  group.add(new THREE.Points(pktGeo, new THREE.PointsMaterial({
    size: 0.34, map: glowTex(120, 210, 255),
    transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true,
  })))
  // bright sparkle core of the signal (shares the same buffer)
  const pktCoreGeo = new THREE.BufferGeometry()
  pktCoreGeo.setAttribute('position', pktPos)
  group.add(new THREE.Points(pktCoreGeo, new THREE.PointsMaterial({
    size: 0.13, map: glowTex(235, 248, 255),
    transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true,
  })))

  // ── Sonar broadcast rings from the hub ──────────────────────────────────────
  const circleGeo = makeCircleGeo()
  const RING_PLANES = [
    { rx: 0,           ry: 0,   rz: 0 },
    { rx: Math.PI / 2, ry: 0,   rz: 0 },
    { rx: Math.PI / 4, ry: 0.4, rz: 0 },
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

  // ── Central hub glow (the "voice core") ─────────────────────────────────────
  const hubArr = new Float32Array([0, 0, 0])
  const hubGeo = new THREE.BufferGeometry()
  hubGeo.setAttribute('position', new THREE.BufferAttribute(hubArr, 3))
  group.add(new THREE.Points(hubGeo, new THREE.PointsMaterial({
    size: 1.0, map: glowTex(70, 190, 255, 128),
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
  lastMs = performance.now()
  const tmpA = new THREE.Vector3(), tmpB = new THREE.Vector3()

  const tick = (ms: number) => {
    raf = requestAnimationFrame(tick)
    const t  = ms * 0.001
    const dt = Math.min(0.05, (ms - lastMs) / 1000)
    lastMs = ms

    // Smooth mouse
    mS.x += (mT.x - mS.x) * LERP_MOUSE
    mS.y += (mT.y - mS.y) * LERP_MOUSE

    // Animate node positions (slow organic drift)
    const na = nodePos.array as Float32Array
    for (let i = 0; i < N; i++) {
      const m = meta[i]
      na[i*3]   = m.base.x + Math.sin(t * m.freq.x + m.phase.x) * m.amp
      na[i*3+1] = m.base.y + Math.sin(t * m.freq.y + m.phase.y) * m.amp
      na[i*3+2] = m.base.z + Math.sin(t * m.freq.z + m.phase.z) * m.amp
    }
    nodePos.needsUpdate = true

    // Decay node brightness toward a gently shimmering idle baseline
    for (let i = 0; i < N; i++) {
      const baseline = 0.08 + 0.045 * (0.5 + 0.5 * Math.sin(t * 0.7 + i * 1.3))
      bright[i] = Math.max(baseline, bright[i] * 0.93)
    }

    // Advance signals; on arrival flash the node and route onward
    const pa = pktPos.array as Float32Array
    for (let p = 0; p < PACKETS; p++) {
      const pk  = packets[p]
      const len = edgeLen.get(edgeKey(pk.from, pk.to)) || 1
      pk.t += (pk.speed * dt) / len

      while (pk.t >= 1) {
        pk.t -= 1
        bright[pk.to] = 1.0                       // node lights up — signal received
        const nbrs = adj[pk.to]
        let next = nbrs[(Math.random() * nbrs.length) | 0]
        if (nbrs.length > 1) {                    // prefer not to bounce straight back
          let guard = 0
          while (next === pk.from && guard++ < 4) next = nbrs[(Math.random() * nbrs.length) | 0]
        }
        pk.from = pk.to
        pk.to   = next
      }

      tmpA.set(na[pk.from*3], na[pk.from*3+1], na[pk.from*3+2])
      tmpB.set(na[pk.to*3],   na[pk.to*3+1],   na[pk.to*3+2])
      tmpA.lerp(tmpB, pk.t)
      pa[p*3] = tmpA.x; pa[p*3+1] = tmpA.y; pa[p*3+2] = tmpA.z
    }
    pktPos.needsUpdate = true
    brightAt.needsUpdate = true

    // Update connection endpoints
    const la = linePos.array as Float32Array
    for (let k = 0; k < pairs.length; k++) {
      const [a, b] = pairs[k]
      la[k*6]   = na[a*3];   la[k*6+1] = na[a*3+1]; la[k*6+2] = na[a*3+2]
      la[k*6+3] = na[b*3];   la[k*6+4] = na[b*3+1]; la[k*6+5] = na[b*3+2]
    }
    linePos.needsUpdate = true

    // Sonar broadcast rings
    for (const r of ringData) {
      const prog = ((t + r.phase) % RING_PERIOD) / RING_PERIOD
      r.line.scale.setScalar(0.15 + prog * 5.0)
      r.mat.opacity = Math.max(0, 0.30 * Math.pow(1 - prog, 2.2))
    }

    // Slow orbit + mouse parallax
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
    nodeMat.uniforms.uScale.value = renderer.getDrawingBufferSize(new THREE.Vector2()).y * 0.5
  }
  onResize()
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

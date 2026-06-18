<template>
  <div ref="el" class="w-full h-full" aria-hidden="true" />
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as THREE from 'three'

const el = ref<HTMLDivElement | null>(null)

let raf = 0
let renderer: THREE.WebGLRenderer | null = null
let camera: THREE.OrthographicCamera
let scene: THREE.Scene
let material: THREE.ShaderMaterial
let mesh: THREE.Mesh
let resizeObs: ResizeObserver | null = null
let intersectObs: IntersectionObserver | null = null
let startTime = 0
let visible = true
let reducedMotion = false

// ── Shaders ───────────────────────────────────────────────────────────────────
// Fullscreen quad — the ribbons are drawn entirely in the fragment shader as
// soft signed-distance bands around animated sine centerlines. This gives the
// airbrushed, grainy look (handhold.io style) that thin geometry strips can't.
const vertexShader = /* glsl */`
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`

const fragmentShader = /* glsl */`
  precision highp float;

  uniform float uTime;
  uniform float uAspect;

  varying vec2 vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  // Ribbon field: returns (coverage, cross-band coord -1..1, twist -1..1).
  // The half-width pinches with |twist| so the band looks like a silk ribbon
  // turning edge-on as it crosses itself.
  vec3 ribbonField(
    vec2 p, float t,
    float baseY, float amp, float freq, float phase, float speed, float thick
  ) {
    float x = p.x;

    // amplitude envelope along x — big swells, then calm stretches
    float env = 0.70 + 0.30 * sin(0.55 * x + phase * 1.9 + t * speed * 0.5);

    float yc = baseY
      + amp * env * sin(freq * x + phase + t * speed)
      + amp * 0.18 * sin(freq * 1.7 * x - phase * 0.7 + t * speed * 0.74 + 1.7);

    float twist = sin(freq * 0.9 * x + phase * 2.4 + t * speed * 0.9);
    float halfw = thick * (0.18 + 0.82 * abs(twist));

    float d = (p.y - yc) / max(halfw, 1e-4);
    float cover = 1.0 - smoothstep(0.60, 1.0, abs(d)); // solid core, short soft edge

    return vec3(cover, clamp(d, -1.0, 1.0), twist);
  }

  // pale buttery gold — the ribbon's front face
  const vec3 GOLD_DEEP = vec3(0.851, 0.635, 0.286); // #D9A249
  const vec3 GOLD_BODY = vec3(0.945, 0.847, 0.604); // #F1D89A
  const vec3 GOLD_LITE = vec3(0.992, 0.980, 0.937); // #FDFAEF

  // vivid azure — the ribbon's back face, revealed at the twists
  const vec3 BLUE_DEEP = vec3(0.184, 0.435, 0.949); // #2F6FF2
  const vec3 BLUE_BODY = vec3(0.376, 0.604, 0.949); // #609AF2
  const vec3 BLUE_LITE = vec3(0.788, 0.871, 0.980); // #C9DEFA

  // One ribbon, two faces: gold front, blue underside. Where the twist flips
  // the band over (twist < 0) the blue back shows through and smears into the
  // gold — this is what creates handhold's concentrated blue patches.
  vec3 ribbonColor(vec3 f, float blueAmt) {
    float side = f.y * 0.5 + 0.5; // 0 = bottom face, 1 = top face

    vec3 gold = mix(GOLD_DEEP, GOLD_BODY, smoothstep(0.15, 0.70, side));
    gold = mix(gold, GOLD_LITE, smoothstep(0.60, 0.98, side));

    vec3 blue = mix(BLUE_DEEP, BLUE_BODY, smoothstep(0.05, 0.60, side));
    blue = mix(blue, BLUE_LITE, smoothstep(0.65, 0.98, side));

    float m = smoothstep(0.35, 0.75, -f.z) * blueAmt;
    vec3 col = mix(gold, blue, m);

    // edge-on sections catch the light → wash toward white
    vec3 lite = mix(GOLD_LITE, BLUE_LITE, m);
    col = mix(col, lite, (1.0 - abs(f.z)) * 0.28);
    return col;
  }

  // front-to-back "over" compositing, premultiplied
  void comp(inout vec4 acc, vec3 col, float cov) {
    float w = (1.0 - acc.a) * cov;
    acc.rgb += col * w;
    acc.a += w;
  }

  void main() {
    vec2 p = vec2((vUv.x * 2.0 - 1.0) * uAspect, vUv.y * 2.0 - 1.0);
    float t = uTime;

    vec4 acc = vec4(0.0);

    // front: main ribbon — wide, strong blue flashes at its twists
    vec3 f1 = ribbonField(p, t, 0.02, 0.40, 0.90, 3.1, 0.18, 0.46);
    comp(acc, ribbonColor(f1, 0.95), f1.x);

    // middle: second strand weaving close behind, blue at other positions
    vec3 f2 = ribbonField(p, t, 0.05, 0.36, 1.05, 4.4, 0.22, 0.30);
    comp(acc, ribbonColor(f2, 0.75), f2.x);

    // back: slim strand, mostly gold
    vec3 f3 = ribbonField(p, t, -0.05, 0.34, 1.25, 5.6, 0.26, 0.22);
    comp(acc, ribbonColor(f3, 0.35), f3.x);

    // film grain — static, dithers both colour and the alpha falloff
    float g = hash(gl_FragCoord.xy);
    vec3 rgb = acc.rgb / max(acc.a, 1e-4);
    rgb += (g - 0.5) * 0.13;
    float alpha = clamp(acc.a * (0.92 + 0.16 * g), 0.0, 1.0);

    gl_FragColor = vec4(rgb, alpha);
  }
`

// ── Init ──────────────────────────────────────────────────────────────────────
function renderFrame() {
  if (!renderer) return
  material.uniforms.uTime.value = (performance.now() - startTime) / 1000
  renderer.render(scene, camera)
}

function loop() {
  renderFrame()
  raf = requestAnimationFrame(loop)
}

function startLoop() {
  cancelAnimationFrame(raf)
  if (reducedMotion) {
    renderFrame() // single static frame
  } else {
    raf = requestAnimationFrame(loop)
  }
}

function init() {
  if (!el.value) return
  const W = el.value.clientWidth
  const H = el.value.clientHeight

  reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setSize(W, H)
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
  renderer.setClearColor(0x000000, 0)
  el.value.appendChild(renderer.domElement)

  // dummy camera — the quad bypasses projection in the vertex shader
  camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10)
  camera.position.z = 1

  scene = new THREE.Scene()

  material = new THREE.ShaderMaterial({
    uniforms: {
      uTime:   { value: 0 },
      uAspect: { value: W / H },
    },
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
  })
  mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material)
  scene.add(mesh)

  startTime = performance.now()

  resizeObs = new ResizeObserver(() => {
    if (!el.value || !renderer) return
    const W2 = el.value.clientWidth
    const H2 = el.value.clientHeight
    renderer.setSize(W2, H2)
    material.uniforms.uAspect.value = W2 / H2
    if (reducedMotion) renderFrame()
  })
  resizeObs.observe(el.value)

  // pause rendering while scrolled out of view
  intersectObs = new IntersectionObserver(([entry]) => {
    const nowVisible = entry.isIntersecting
    if (nowVisible === visible) return
    visible = nowVisible
    if (visible) startLoop()
    else cancelAnimationFrame(raf)
  })
  intersectObs.observe(el.value)

  startLoop()
}

onMounted(init)
onBeforeUnmount(() => {
  cancelAnimationFrame(raf)
  resizeObs?.disconnect()
  intersectObs?.disconnect()
  mesh?.geometry.dispose()
  material?.dispose()
  renderer?.dispose()
  renderer = null
})
</script>

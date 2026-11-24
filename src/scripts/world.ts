// The home page as one 3D world: a dark gallery on still water at dusk. Her renders stand as lit
// slabs (four of them moving, animated from her own renders), her drawings glow on the floor under
// them, and the camera glides from station to station as you scroll. One scroll value drives the
// camera, the copy and the chapter bar, so scrolling back restores every scene exactly.
import * as THREE from 'three';
import { Reflector } from 'three/examples/jsm/objects/Reflector.js';

export type Station = {
  kind: 'arrival' | 'slab' | 'iva' | 'materials' | 'close';
  img?: string; video?: string; aspect?: number;
  floor?: string; floorAspect?: number; logo?: string; logoAspect?: number;
  massing?: boolean; mats?: string[]; side?: 1 | -1;
};

const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const smooth = (x: number) => { x = clamp(x); return x * x * (3 - 2 * x); };
const inOut = (x: number) => { x = clamp(x); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const INK = new THREE.Color(0x120d09);
const WARM = new THREE.Color(0xffc38a);
const RED = new THREE.Color(0xd23a40);

function radialTexture(inner = 'rgba(255,205,150,1)', outer = 'rgba(255,205,150,0)') {
  const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d')!;
  const gr = g.createRadialGradient(128, 128, 0, 128, 128, 128); gr.addColorStop(0, inner); gr.addColorStop(1, outer);
  g.fillStyle = gr; g.fillRect(0, 0, 256, 256);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

// a drawing on paper, turned into glowing line work: ink becomes light, paper becomes nothing
function inkMaterial(tex: THREE.Texture, color: THREE.Color, strength = 1) {
  return new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { map: { value: tex }, color: { value: color }, k: { value: 0 }, strength: { value: strength } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }',
    fragmentShader: `uniform sampler2D map; uniform vec3 color; uniform float k; uniform float strength; varying vec2 vUv;
      void main(){ vec4 t = texture2D(map, vUv); float lum = dot(t.rgb, vec3(.299,.587,.114));
        float ink = smoothstep(.05, .55, 1. - lum) * t.a; float edge = smoothstep(0.,.04,vUv.x)*smoothstep(1.,.96,vUv.x)*smoothstep(0.,.04,vUv.y)*smoothstep(1.,.96,vUv.y);
        gl_FragColor = vec4(color * ink * strength * k * edge, 1.); }`,
  });
}

export async function mountWorld(canvas: HTMLCanvasElement, stations: Station[], opts: { mobile: boolean; plate: string; plateNight: string }) {
  const { mobile } = opts;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !mobile, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, mobile ? 1.5 : 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  const scene = new THREE.Scene();
  scene.background = INK.clone();
  scene.fog = new THREE.FogExp2(INK.getHex(), mobile ? 0.0105 : 0.0095);
  const cam = new THREE.PerspectiveCamera(mobile ? 58 : 42, 1, 0.1, 900);

  const loader = new THREE.TextureLoader();
  const tex = (url: string) => loader.loadAsync(url).then((t) => { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = renderer.capabilities.getMaxAnisotropy(); return t; });
  const glow = radialTexture();

  // --- floor: still dark water that reflects every lit slab
  const W = mobile ? 512 : 1024;
  const water = new Reflector(new THREE.PlaneGeometry(1200, 1200), { textureWidth: W, textureHeight: W, color: 0x8a8580, clipBias: 0.003 });
  water.rotation.x = -Math.PI / 2; scene.add(water);
  const tint = new THREE.Mesh(new THREE.PlaneGeometry(1200, 1200), new THREE.MeshBasicMaterial({ color: INK, transparent: true, opacity: 0.72, depthWrite: false }));
  tint.rotation.x = -Math.PI / 2; tint.position.y = 0.02; scene.add(tint);

  // --- the horizon: her own dusk sky (the generated empty-park plate) as a distant curved screen
  const [plateT, nightT] = await Promise.all([tex(opts.plate), tex(opts.plateNight)]);
  // only the sky, mountains and the far city of the plate: the lawn would sit under the water line
  [plateT, nightT].forEach((t) => { t.repeat.set(1, 0.5); t.offset.set(0, 0.5); });
  const horizonMat = new THREE.MeshBasicMaterial({ map: plateT, fog: false, side: THREE.BackSide, transparent: true, opacity: 1, color: 0xa39689 });
  const nightMat = new THREE.MeshBasicMaterial({ map: nightT, fog: false, side: THREE.BackSide, transparent: true, opacity: 0, color: 0xb0a8a0 });
  const R = 520, horizonGeo = new THREE.CylinderGeometry(R, R, 190, 64, 1, true, Math.PI * 0.6, Math.PI * 0.8);
  const horizon = new THREE.Mesh(horizonGeo, horizonMat), horizonNight = new THREE.Mesh(horizonGeo, nightMat);
  [horizon, horizonNight].forEach((m) => { m.position.set(0, 88, -120); scene.add(m); });

  // --- dust in the air, catching the light
  const N = mobile ? 500 : 1100, pos = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) { pos[i * 3] = (Math.random() - 0.5) * 160; pos[i * 3 + 1] = Math.random() * 40; pos[i * 3 + 2] = 40 - Math.random() * 520; }
  const dustGeo = new THREE.BufferGeometry(); dustGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({ map: glow, size: 0.35, transparent: true, opacity: 0.55, depthWrite: false, blending: THREE.AdditiveBlending, color: 0xffd9b0 }));
  scene.add(dust);

  scene.add(new THREE.HemisphereLight(0xffe2c4, 0x1a120c, 0.6));

  // --- stations
  const GAP = 46;
  type Built = { focus: THREE.Vector3; side: number; size: number; video?: HTMLVideoElement; ink: THREE.ShaderMaterial[]; group: THREE.Group; slabMat?: THREE.MeshBasicMaterial; massing?: THREE.Group };
  const built: Built[] = [];
  const videos: HTMLVideoElement[] = [];

  const makeVideo = (src: string) => {
    const v = document.createElement('video');
    Object.assign(v, { src, muted: true, loop: true, playsInline: true, preload: 'none', crossOrigin: 'anonymous' });
    v.setAttribute('muted', ''); v.setAttribute('playsinline', ''); videos.push(v); return v;
  };

  const slab = async (g: THREE.Group, url: string | undefined, video: string | undefined, aspect: number, h: number) => {
    const w = h * aspect;
    let map: THREE.Texture | undefined; let v: HTMLVideoElement | undefined;
    if (video) { v = makeVideo(video); map = new THREE.VideoTexture(v); map.colorSpace = THREE.SRGBColorSpace; if (url) { const still = await tex(url); (map as any).__still = still; } }
    else if (url) map = await tex(url);
    const mat = new THREE.MeshBasicMaterial({ map: video && url ? (map as any).__still : map, toneMapped: false });
    if (video) (mat as any).__video = map;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); m.position.y = h / 2 + 1.2; g.add(m);
    // thin bronze frame and a stand
    const fr = new THREE.MeshBasicMaterial({ color: 0x6b5238 });
    const t = 0.18;
    [[0, h + t / 2, w + t * 2, t], [0, -t / 2, w + t * 2, t], [-w / 2 - t / 2, h / 2, t, h], [w / 2 + t / 2, h / 2, t, h]].forEach(([x, y, ww, hh]) => {
      const b = new THREE.Mesh(new THREE.BoxGeometry(ww, hh, 0.12), fr); b.position.set(x, y + 1.2, -0.04); g.add(b);
    });
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.16, 1.2, 0.16), fr); leg.position.set(0, 0.6, -0.1); g.add(leg);
    // light it throws: a halo behind, a pool on the water
    const halo = new THREE.Mesh(new THREE.PlaneGeometry(w * 2.1, h * 2.3), new THREE.MeshBasicMaterial({ map: glow, transparent: true, opacity: 0.16, depthWrite: false, blending: THREE.AdditiveBlending }));
    halo.position.set(0, h / 2 + 1.2, -0.6); g.add(halo);
    const pool = new THREE.Mesh(new THREE.PlaneGeometry(w * 1.6, w * 0.9), new THREE.MeshBasicMaterial({ map: glow, transparent: true, opacity: 0.22, depthWrite: false, blending: THREE.AdditiveBlending }));
    pool.rotation.x = -Math.PI / 2; pool.position.set(0, 0.05, w * 0.28); g.add(pool);
    return { mat, v, w, h };
  };

  const floorInk = async (g: THREE.Group, url: string, aspect: number, width: number, z: number, color = RED, strength = 1.4) => {
    const t = await tex(url); const m = inkMaterial(t, color, strength);
    const p = new THREE.Mesh(new THREE.PlaneGeometry(width, width / aspect), m); p.rotation.x = -Math.PI / 2; p.position.set(0, 0.06, z); g.add(p); return m;
  };

  const auraMassing = () => {
    const grp = new THREE.Group();
    const line = (o: number) => new THREE.LineBasicMaterial({ color: RED, transparent: true, opacity: o });
    const fp = new THREE.Shape(); fp.moveTo(0, 0); fp.lineTo(26, 0); fp.quadraticCurveTo(46, 3, 62, 14); fp.lineTo(112, 14); fp.lineTo(112, 28); fp.lineTo(0, 28); fp.lineTo(0, 0);
    const H = 6; const geo = new THREE.ExtrudeGeometry(fp, { depth: H, bevelEnabled: false, curveSegments: 28 }); geo.rotateX(-Math.PI / 2);
    grp.add(new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: 0xd23a40, transparent: true, opacity: 0.07, depthWrite: false, side: THREE.DoubleSide })));
    grp.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo, 20), line(0.95)));
    const colGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3(0, H, 0)]);
    fp.getSpacedPoints(84).forEach((p) => { const c = new THREE.Line(colGeo, line(0.45)); c.position.set(p.x, 0, -p.y); grp.add(c); });
    const Rr = 9.5, RH = 3.6, circle = (y: number) => new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(new THREE.EllipseCurve(0, 0, Rr, Rr).getSpacedPoints(100).map((v) => new THREE.Vector3(v.x, y, v.y))), line(1));
    const ring = new THREE.Group(); ring.add(circle(0), circle(RH));
    for (let a = 0; a < 64; a++) { const t = (a / 64) * Math.PI * 2; ring.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(Math.cos(t) * Rr, 0, Math.sin(t) * Rr), new THREE.Vector3(Math.cos(t) * Rr, RH, Math.sin(t) * Rr)]), line(0.4))); }
    ring.position.set(17, H, -16); grp.add(ring);
    grp.scale.setScalar(0.16); grp.position.set(-9, 0.05, 9); grp.rotation.y = 0.35;
    return grp;
  };

  let z = 0;
  for (let i = 0; i < stations.length; i++) {
    const s = stations[i]; const g = new THREE.Group(); scene.add(g);
    const side = s.side ?? (i % 2 ? -1 : 1);
    const b: Built = { focus: new THREE.Vector3(), side, size: 10, ink: [], group: g };
    if (s.kind === 'arrival') {
      g.position.set(0, 0, 30); b.focus.set(0, 6, -60); b.size = 40;
    } else if (s.kind === 'close') {
      g.position.set(0, 0, z - GAP * 0.6); b.focus.set(0, 5, z * 0.5); b.size = 120;
    } else {
      z -= GAP; const x = side * (mobile ? 3 : 7);
      g.position.set(x, 0, z); g.rotation.y = -side * 0.18;
      if (s.kind === 'slab' || s.kind === 'iva') {
        const h = s.kind === 'iva' ? 10 : 9.5;
        const r = await slab(g, s.img, s.video, s.aspect ?? 1.4, h);
        b.slabMat = r.mat; b.video = r.v; b.size = Math.max(r.w, r.h * 1.4);
        b.focus.set(x, h / 2 + 1.2, z);
        if (s.floor) b.ink.push(await floorInk(g, s.floor, s.floorAspect ?? 1.4, Math.min(22, r.w * 1.25), r.w * 0.55 + 4));
        if (s.logo) b.ink.push(await floorInk(g, s.logo, s.logoAspect ?? 3, 18, 8, WARM, 0.9));
        if (s.massing) { const ms = auraMassing(); g.add(ms); b.massing = ms; }
      } else if (s.kind === 'materials') {
        const ts = await Promise.all((s.mats ?? []).map(tex));
        ts.forEach((t, k) => {
          const blk = new THREE.Mesh(new THREE.BoxGeometry(2.6, 6 + (k % 2) * 1.6, 2.6), new THREE.MeshStandardMaterial({ map: t, roughness: 0.75, metalness: 0 }));
          blk.position.set((k - 1.5) * 3.6, (6 + (k % 2) * 1.6) / 2, (k % 2) * 1.2); blk.rotation.y = (k - 1.5) * 0.12; g.add(blk);
        });
        const lamp = new THREE.PointLight(0xffb070, 140, 34, 1.6); lamp.position.set(-3, 9, 7); g.add(lamp);
        const lamp2 = new THREE.PointLight(0xffd6a8, 40, 30, 1.8); lamp2.position.set(6, 4, 9); g.add(lamp2);
        if (s.logo) b.ink.push(await floorInk(g, s.logo, s.logoAspect ?? 1, 11, 9, WARM, 0.9));
        b.focus.set(x, 4, z); b.size = 16;
      }
    }
    built.push(b);
  }

  // --- camera rig: each station has a resting viewpoint; travel arcs a little upward between them
  const aspect = () => canvas.clientWidth / Math.max(1, canvas.clientHeight);
  const view = (i: number) => {
    const b = built[i]; const s = stations[i];
    if (s.kind === 'arrival') return { pos: new THREE.Vector3(mobile ? 0 : -6, mobile ? 16 : 12, 46), at: new THREE.Vector3(mobile ? 0 : 8, 7, -160) };
    if (s.kind === 'close') return { pos: new THREE.Vector3(mobile ? 0 : -18, 46, built[1].group.position.z + 70), at: new THREE.Vector3(0, 2, z * 0.55) };
    const f = b.focus; const a = aspect();
    const vfov = THREE.MathUtils.degToRad(cam.fov);
    // distance so the slab fills ~62% of the height (desktop) or ~44% (phone, copy sits below)
    const need = mobile ? b.size / 1.4 / 0.42 : b.size / 1.4 / 0.66;
    let d = need / (2 * Math.tan(vfov / 2)); if (!mobile && a < 1.3) d *= 1.15;
    const dir = new THREE.Vector3(Math.sin(-b.side * 0.18), 0, Math.cos(-b.side * 0.18));
    const pos = f.clone().addScaledVector(dir, d); pos.y += mobile ? 2.6 : 1.4;
    // desktop: push the slab to the right third so the copy has the left; phone: push it up
    const right = new THREE.Vector3(dir.z, 0, -dir.x);
    const at = f.clone();
    if (mobile) at.y -= b.size / 1.4 * 0.36; else at.addScaledVector(right, -b.size * 0.24);
    return { pos, at };
  };
  let views = stations.map((_, i) => view(i));

  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
    addEventListener('pointermove', (e) => { pointer.tx = e.clientX / innerWidth - 0.5; pointer.ty = e.clientY / innerHeight - 0.5; }, { passive: true });
  }

  const resize = () => {
    const w = canvas.clientWidth, h = canvas.clientHeight; renderer.setSize(w, h, false);
    cam.aspect = w / h; cam.updateProjectionMatrix(); views = stations.map((_, i) => view(i));
  };
  new ResizeObserver(resize).observe(canvas); resize();

  let S = 0; // continuous station index
  const camPos = new THREE.Vector3(), camAt = new THREE.Vector3();
  const place = (s: number) => {
    const n = stations.length - 1; s = clamp(s, 0, n);
    const i = Math.min(n - 1, Math.floor(s)), f = s - i;
    const t = inOut(clamp((f - 0.42) / 0.58));            // rest for the first 42% of each step, then travel
    const A = views[i], B = views[i + 1];
    camPos.lerpVectors(A.pos, B.pos, t); camAt.lerpVectors(A.at, B.at, t);
    camPos.y += Math.sin(Math.PI * t) * 5;                // a soft rise mid-flight
    return { i, t };
  };

  // things that wake up as the camera arrives
  const reveal = () => {
    built.forEach((b, k) => {
      const near = clamp(1 - Math.abs(S - k) / 0.9);
      b.ink.forEach((m) => (m.uniforms.k.value = smooth(near)));
      if (b.massing) b.massing.scale.y = Math.max(0.001, smooth(clamp((near - 0.2) / 0.8)) * 0.16);
      if (b.video && b.slabMat) {
        const want = Math.abs(S - k) < 1.2;
        if (want && b.video.paused) { b.video.play().then(() => { b.slabMat!.map = (b.slabMat as any).__video; b.slabMat!.needsUpdate = true; }).catch(() => {}); }
        if (!want && !b.video.paused) b.video.pause();
      }
    });
    const night = smooth(clamp((S - (stations.length - 2)) / 1));
    nightMat.opacity = night; horizonMat.opacity = 1 - night * 0.6;
    renderer.toneMappingExposure = 1.05 - night * 0.15;
  };

  let running = true, last = performance.now();
  const frame = (now: number) => {
    if (!running) return;
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    place(S);
    pointer.x += (pointer.tx - pointer.x) * 0.05; pointer.y += (pointer.ty - pointer.y) * 0.05;
    cam.position.copy(camPos).add(new THREE.Vector3(pointer.x * 2.2, -pointer.y * 1.2, 0));
    cam.lookAt(camAt);
    reveal();
    const p = dustGeo.attributes.position as THREE.BufferAttribute;
    for (let k = 0; k < N; k++) { let y = p.getY(k) + dt * 0.35; if (y > 40) y = 0; p.setY(k, y); }
    p.needsUpdate = true;
    renderer.render(scene, cam);
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
  document.addEventListener('visibilitychange', () => { const was = running; running = !document.hidden; if (running && !was) { last = performance.now(); requestAnimationFrame(frame); } if (!running) videos.forEach((v) => v.pause()); });

  return { set: (s: number) => { S = s; }, stations: stations.length };
}

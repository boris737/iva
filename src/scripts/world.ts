// Home as one 3D world: her renders stand as large lit panels on dark water at dusk, the camera glides
// from one to the next as you scroll. At each project it rests on the main render, then turns to a row
// of her other renders of that project, then rises and flies on. Every panel can be tapped to open it
// full screen. One eased scroll value drives camera, copy and chapter bar, so scrolling back restores
// every scene exactly. Media: her renders; the moving ones are camera and light animated from her
// render with Higgsfield.
import * as THREE from 'three';
import { Water } from 'three/examples/jsm/objects/Water.js';

export type Extra = { img: string; video?: string; aspect: number; label?: string };
export type Station = {
  kind: 'arrival' | 'slab' | 'iva' | 'materials' | 'close';
  img?: string; video?: string; aspect?: number; label?: string;
  floor?: string; floorAspect?: number; logo?: string; logoAspect?: number;
  massing?: boolean; mats?: string[]; side?: 1 | -1;
  night?: string;
  extras?: Extra[];
};
export type Open = (m: { img: string; video?: string; label?: string }) => void;

const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const smooth = (x: number) => { x = clamp(x); return x * x * (3 - 2 * x); };
const inOut = (x: number) => { x = clamp(x); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const RED = new THREE.Color(0xe0484e);
const WARM = new THREE.Color(0xffd2a4);

// browsers differ: VP9 WebM for Chromium/Firefox/Electron, H.264 MP4 for Safari
const videoExt = (() => {
  const v = document.createElement('video');
  return v.canPlayType('video/webm; codecs="vp9"') ? '.webm' : '.mp4';
})();
export const videoUrl = (base: string) => base.replace(/\.(mp4|webm)$/, '') + videoExt;

function radialTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d')!;
  const gr = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  gr.addColorStop(0, 'rgba(255,214,170,1)'); gr.addColorStop(0.4, 'rgba(255,214,170,.35)'); gr.addColorStop(1, 'rgba(255,214,170,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 256, 256);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

// tileable ripple normals, drawn once on a canvas (no external texture to load)
function waterNormals(size = 256) {
  const c = document.createElement('canvas'); c.width = c.height = size; const g = c.getContext('2d')!;
  const h = new Float32Array(size * size);
  const waves = Array.from({ length: 14 }, () => ({ kx: Math.round((Math.random() - 0.5) * 16), ky: Math.round((Math.random() - 0.5) * 16), p: Math.random() * 6.28, a: 0.3 + Math.random() }));
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    let v = 0; for (const w of waves) v += w.a * Math.sin(((w.kx * x + w.ky * y) / size) * 6.2832 + w.p); h[y * size + x] = v;
  }
  const img = g.createImageData(size, size);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const l = h[y * size + ((x - 1 + size) % size)], r = h[y * size + ((x + 1) % size)], u = h[((y - 1 + size) % size) * size + x], d = h[((y + 1) % size) * size + x];
    const nx = (l - r) * 0.18, ny = (u - d) * 0.18, nz = 1, len = Math.hypot(nx, ny, nz), i = (y * size + x) * 4;
    img.data[i] = (nx / len * 0.5 + 0.5) * 255; img.data[i + 1] = (ny / len * 0.5 + 0.5) * 255; img.data[i + 2] = (nz / len * 0.5 + 0.5) * 255; img.data[i + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}

// a drawing on paper becomes glowing line work that draws itself in from the left
function inkMaterial(tex: THREE.Texture, color: THREE.Color, strength = 1) {
  return new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { map: { value: tex }, color: { value: color }, k: { value: 0 }, strength: { value: strength } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }',
    fragmentShader: `uniform sampler2D map; uniform vec3 color; uniform float k; uniform float strength; varying vec2 vUv;
      void main(){ vec4 t = texture2D(map, vUv); float lum = dot(t.rgb, vec3(.299,.587,.114));
        float ink = smoothstep(.08, .6, 1. - lum) * t.a; float edge = smoothstep(0.,.04,vUv.x)*smoothstep(1.,.96,vUv.x)*smoothstep(0.,.04,vUv.y)*smoothstep(1.,.96,vUv.y);
        float d = k * 1.18 - .09; float drawn = 1. - smoothstep(d - .06, d, vUv.x); float pen = exp(-pow((vUv.x - d) * 38., 2.)) * step(.001, k) * (1. - step(.999, k));
        gl_FragColor = vec4(color * ink * edge * strength * (drawn * min(1., k * 1.6) + pen * 2.), 1.); }`,
  });
}

export async function mountWorld(canvas: HTMLCanvasElement, stations: Station[], opts: { mobile: boolean; open: Open }) {
  const { mobile } = opts;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, mobile ? 1.6 : 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0;
  const scene = new THREE.Scene();
  const FOG = new THREE.Color(0x141826);
  scene.fog = new THREE.FogExp2(FOG.getHex(), mobile ? 0.0085 : 0.0072);
  const cam = new THREE.PerspectiveCamera(mobile ? 56 : 38, 1, 0.1, 1600);

  const loader = new THREE.TextureLoader();
  const tex = (url: string) => loader.loadAsync(url).then((t) => { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy()); return t; });
  const glow = radialTexture();

  // --- sky: a dusk gradient with a warm band at the horizon; night pulls the glow down and adds stars
  const skyU = { night: { value: 0 } };
  const sky = new THREE.Mesh(new THREE.SphereGeometry(900, 48, 24), new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false, uniforms: skyU,
    vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }',
    fragmentShader: `uniform float night; varying vec3 vP;
      void main(){ float y = vP.y; float az = atan(vP.x, -vP.z);
        vec3 zen = mix(vec3(.05,.07,.14), vec3(.015,.02,.05), night);
        vec3 mid = mix(vec3(.17,.19,.30), vec3(.04,.05,.11), night);
        vec3 hor = mix(vec3(.98,.58,.34), vec3(.28,.18,.30), night);
        float sun = exp(-pow(az * 1.4, 2.)) * (1. - night * .8);
        vec3 c = mix(mid, zen, smoothstep(.05, .55, y));
        c = mix(c, hor, exp(-max(y, 0.) * (16. - sun * 7.)) * (.75 + sun * .5));
        c = mix(c, vec3(.05,.06,.09), smoothstep(0., -.06, y));
        gl_FragColor = vec4(c, 1.); }`,
  }));
  scene.add(sky);
  const starGeo = new THREE.BufferGeometry(); const sp: number[] = [];
  for (let i = 0; i < 900; i++) { const t = Math.random() * 6.28, y = 0.08 + Math.random() * 0.9, r = 850; sp.push(Math.cos(t) * r * Math.sqrt(1 - y * y), y * r, Math.sin(t) * r * Math.sqrt(1 - y * y)); }
  starGeo.setAttribute('position', new THREE.Float32BufferAttribute(sp, 3));
  const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 1.6, sizeAttenuation: false, transparent: true, opacity: 0, fog: false, depthWrite: false });
  scene.add(new THREE.Points(starGeo, starMat));

  // --- far ridges, dark against the glow (a nod to the Skopje valley in her renders)
  const ridge = (r: number, h: number, col: number, seed: number) => {
    const n = 220, pos: number[] = [], idx: number[] = [];
    for (let i = 0; i <= n; i++) {
      const a = Math.PI * 0.15 + (i / n) * Math.PI * 1.7, x = Math.sin(a) * r, z = -Math.cos(a) * r;
      const u = i / n * 6.283; const hh = h * (0.55 + 0.25 * Math.sin(u * 3 + seed) + 0.14 * Math.sin(u * 7.3 + seed * 2) + 0.05 * Math.sin(u * 19 + seed * 3));
      pos.push(x, -2, z, x, Math.max(6, hh), z);
      if (i < n) { const k = i * 2; idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2); }
    }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx);
    scene.add(new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: col, side: THREE.DoubleSide, fog: true })));
  };
  void ridge;

  // --- water: rippled, reflecting every lit panel
  const water = new Water(new THREE.PlaneGeometry(2400, 2400), {
    textureWidth: mobile ? 512 : 1024, textureHeight: mobile ? 512 : 1024, waterNormals: waterNormals(),
    sunDirection: new THREE.Vector3(0, 0.25, -1).normalize(), sunColor: 0xffc79a, waterColor: 0x0a0f18, distortionScale: 0.7, fog: true,
  });
  water.rotation.x = -Math.PI / 2; (water.material as THREE.ShaderMaterial).uniforms.size.value = 6; scene.add(water);

  // --- dust catching the light
  const N = mobile ? 380 : 800, dpos = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) { dpos[i * 3] = (Math.random() - 0.5) * 180; dpos[i * 3 + 1] = Math.random() * 30; dpos[i * 3 + 2] = 40 - Math.random() * 560; }
  const dustGeo = new THREE.BufferGeometry(); dustGeo.setAttribute('position', new THREE.BufferAttribute(dpos, 3));
  scene.add(new THREE.Points(dustGeo, new THREE.PointsMaterial({ map: glow, size: 0.28, transparent: true, opacity: 0.45, depthWrite: false, blending: THREE.AdditiveBlending, color: 0xffe0c0 })));

  // --- media
  const videos: HTMLVideoElement[] = [];
  const makeVideo = (base: string) => {
    const v = document.createElement('video');
    v.muted = true; v.loop = true; v.playsInline = true; v.preload = 'auto';
    v.setAttribute('muted', ''); v.setAttribute('playsinline', ''); v.setAttribute('webkit-playsinline', '');
    v.src = videoUrl(base); videos.push(v); (window as any).__vids = videos; return v;
  };

  type Panel = { mesh: THREE.Mesh; mat: THREE.MeshBasicMaterial; vtex?: THREE.VideoTexture; v?: HTMLVideoElement; live: boolean;
    sheen: THREE.ShaderMaterial; halo: THREE.Mesh; pool: THREE.Mesh; edge: THREE.MeshBasicMaterial; w: number; h: number; media: { img: string; video?: string; label?: string } };
  const panels: Panel[] = [];
  const clickable: THREE.Object3D[] = [];

  const makePanel = async (parent: THREE.Object3D, media: { img: string; video?: string; label?: string }, aspect: number, h: number, lift = 1.6): Promise<Panel> => {
    const w = h * aspect;
    const still = await tex(media.img);
    const mat = new THREE.MeshBasicMaterial({ map: still, toneMapped: false });
    mat.color.setScalar(0.62);
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); mesh.position.y = h / 2 + lift; parent.add(mesh);
    // hairline of light around the edge instead of a frame
    const edge = new THREE.MeshBasicMaterial({ color: 0xffe6cc, transparent: true, opacity: 0.25, toneMapped: false });
    const t = Math.max(0.03, h * 0.004);
    [[0, h / 2 + t / 2, w + t * 2, t], [0, -h / 2 - t / 2, w + t * 2, t], [-w / 2 - t / 2, 0, t, h], [w / 2 + t / 2, 0, t, h]].forEach(([x, y, ww, hh]) => {
      const b = new THREE.Mesh(new THREE.PlaneGeometry(ww, hh), edge); b.position.set(x, y, 0.005); mesh.add(b);
    });
    const sheen = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: { x: { value: -1 }, a: { value: 0 } },
      vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }',
      fragmentShader: 'uniform float x; uniform float a; varying vec2 vUv; void main(){ float d = (vUv.x + vUv.y * .35) - x; float b = exp(-d*d*120.); gl_FragColor = vec4(vec3(1.,.94,.86) * b * a * .18, 1.); }' });
    const sh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), sheen); sh.position.z = 0.01; mesh.add(sh);
    const halo = new THREE.Mesh(new THREE.PlaneGeometry(w * 1.9, h * 2.2), new THREE.MeshBasicMaterial({ map: glow, transparent: true, opacity: 0.08, depthWrite: false, blending: THREE.AdditiveBlending }));
    halo.position.set(0, 0, -0.5); mesh.add(halo);
    const pool = new THREE.Mesh(new THREE.PlaneGeometry(w * 1.5, w * 0.7), new THREE.MeshBasicMaterial({ map: glow, transparent: true, opacity: 0.1, depthWrite: false, blending: THREE.AdditiveBlending }));
    pool.rotation.x = -Math.PI / 2; pool.position.set(0, 0.06, w * 0.22); parent.add(pool);
    const p: Panel = { mesh, mat, live: false, sheen, halo, pool, edge, w, h, media };
    if (media.video) {
      p.v = makeVideo(media.video);
      p.v.addEventListener('playing', () => {
        if (!p.vtex) { p.vtex = new THREE.VideoTexture(p.v!); p.vtex.colorSpace = THREE.SRGBColorSpace; }
        p.mat.map = p.vtex; p.mat.needsUpdate = true; p.live = true;
      });
    }
    (mesh as any).__panel = p; clickable.push(mesh); panels.push(p);
    return p;
  };

  const floorInk = async (g: THREE.Group, url: string, aspect: number, width: number, z: number, color = RED, strength = 1.1) => {
    const t = await tex(url); const m = inkMaterial(t, color, strength);
    const p = new THREE.Mesh(new THREE.PlaneGeometry(width, width / aspect), m); p.rotation.x = -Math.PI / 2; p.position.set(0, 0.08, z); g.add(p); return m;
  };

  const auraMassing = () => {
    const grp = new THREE.Group();
    const line = (o: number) => new THREE.LineBasicMaterial({ color: RED, transparent: true, opacity: o });
    const fp = new THREE.Shape(); fp.moveTo(0, 0); fp.lineTo(26, 0); fp.quadraticCurveTo(46, 3, 62, 14); fp.lineTo(112, 14); fp.lineTo(112, 28); fp.lineTo(0, 28); fp.lineTo(0, 0);
    const H = 6; const geo = new THREE.ExtrudeGeometry(fp, { depth: H, bevelEnabled: false, curveSegments: 28 }); geo.rotateX(-Math.PI / 2);
    grp.add(new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: 0xe0484e, transparent: true, opacity: 0.08, depthWrite: false, side: THREE.DoubleSide })));
    grp.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo, 20), line(0.95)));
    const colGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3(0, H, 0)]);
    fp.getSpacedPoints(84).forEach((p) => { const c = new THREE.Line(colGeo, line(0.4)); c.position.set(p.x, 0, -p.y); grp.add(c); });
    const Rr = 9.5, RH = 3.6, circle = (y: number) => new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(new THREE.EllipseCurve(0, 0, Rr, Rr).getSpacedPoints(100).map((v) => new THREE.Vector3(v.x, y, v.y))), line(1));
    const ring = new THREE.Group(); ring.add(circle(0), circle(RH));
    for (let a = 0; a < 64; a++) { const t = (a / 64) * Math.PI * 2; ring.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(Math.cos(t) * Rr, 0, Math.sin(t) * Rr), new THREE.Vector3(Math.cos(t) * Rr, RH, Math.sin(t) * Rr)]), line(0.35))); }
    ring.position.set(17, H, -16); grp.add(ring);
    grp.scale.setScalar(0.16); grp.position.set(-9, 0.05, 10); grp.rotation.y = 0.35;
    return grp;
  };

  // --- stations along the water
  const GAP = mobile ? 42 : 50;
  type Built = { focus: THREE.Vector3; side: number; size: number; w: number; h: number; group: THREE.Group; ink: THREE.ShaderMaterial[];
    main?: Panel; more: Panel[]; row?: { center: THREE.Vector3; w: number; h: number }; massing?: THREE.Group; night?: THREE.MeshBasicMaterial; lit: number };
  const built: Built[] = [];
  let z = 0;
  for (let i = 0; i < stations.length; i++) {
    const s = stations[i]; const g = new THREE.Group(); scene.add(g);
    const side = s.side ?? (i % 2 ? -1 : 1);
    const b: Built = { focus: new THREE.Vector3(), side, size: 10, w: 10, h: 10, group: g, ink: [], more: [], lit: 0 };
    if (s.kind === 'arrival' || s.kind === 'close') {
      b.focus.set(0, 6, z);
    } else {
      z -= GAP; const x = side * (mobile ? 4 : 9);
      g.position.set(x, 0, z); g.rotation.y = -side * 0.12;
      if (s.kind === 'slab' || s.kind === 'iva') {
        const h = 9;
        const p = await makePanel(g, { img: s.img!, video: s.video, label: s.label }, s.aspect ?? 1.4, h);
        b.main = p; b.w = p.w; b.h = p.h; b.size = Math.max(p.w, p.h * 1.4);
        b.focus.set(x, h / 2 + 1.6, z);
        if (s.floor) b.ink.push(await floorInk(g, s.floor, s.floorAspect ?? 1.4, Math.min(20, p.w * 1.15), p.w * 0.5 + 5));
        if (s.logo) b.ink.push(await floorInk(g, s.logo, s.logoAspect ?? 3, 16, 8, WARM, 0.8));
        if (s.massing) { const ms = auraMassing(); g.add(ms); b.massing = ms; }
        if (s.night) {
          const nm = new THREE.MeshBasicMaterial({ map: await tex(s.night), transparent: true, opacity: 0, toneMapped: false, depthWrite: false });
          const np = new THREE.Mesh(new THREE.PlaneGeometry(p.w, p.h), nm); np.position.z = 0.003; p.mesh.add(np); b.night = nm;
        }
        // her other renders: a row on the open side, set a little back, at eye level
        if (s.extras?.length) {
          const row = new THREE.Group(); scene.add(row);
          const eh = mobile ? 4.6 : 5.2, gap = 0.9;
          const widths = s.extras.map((e) => eh * e.aspect), total = widths.reduce((a, c) => a + c, 0) + gap * (widths.length - 1);
          let cx = -total / 2;
          for (let e = 0; e < s.extras.length; e++) {
            const holder = new THREE.Group(); holder.position.x = cx + widths[e] / 2; row.add(holder); cx += widths[e] + gap;
            b.more.push(await makePanel(holder, s.extras[e], s.extras[e].aspect, eh, 2.2));
          }
          const rx = x - side * (p.w / 2 + 7 + total / 2), rz = z - 8;
          row.position.set(rx, 0, rz); row.rotation.y = side * 0.18;
          b.row = { center: new THREE.Vector3(rx, eh / 2 + 2.2, rz), w: total, h: eh };
        }
      } else if (s.kind === 'materials') {
        const ts = await Promise.all((s.mats ?? []).map(tex));
        ts.forEach((t, k) => {
          const hh = 6 + (k % 2) * 1.8;
          const blk = new THREE.Mesh(new THREE.BoxGeometry(2.8, hh, 2.8), new THREE.MeshStandardMaterial({ map: t, roughness: 0.7, metalness: 0 }));
          blk.position.set((k - 1.5) * 3.9, hh / 2 + 0.3, (k % 2) * 1.2); blk.rotation.y = (k - 1.5) * 0.14; g.add(blk);
        });
        const lamp = new THREE.PointLight(0xffb070, 160, 36, 1.6); lamp.position.set(-3, 10, 8); g.add(lamp);
        const lamp2 = new THREE.PointLight(0xffd6a8, 50, 30, 1.8); lamp2.position.set(7, 4, 10); g.add(lamp2);
        g.add(new THREE.HemisphereLight(0xffe2c4, 0x10131c, 0.35));
        if (s.logo) b.ink.push(await floorInk(g, s.logo, s.logoAspect ?? 1, 10, 9, WARM, 0.8));
        b.focus.set(x, 4.2, z); b.size = 17; b.w = 17; b.h = 9;
      }
    }
    built.push(b);
  }
  const zEnd = z;

  // --- viewpoints
  const aspect = () => canvas.clientWidth / Math.max(1, canvas.clientHeight);
  type Key = { pos: THREE.Vector3; at: THREE.Vector3; s0: number; s1: number };
  const frame = (focus: THREE.Vector3, w: number, h: number, yaw: number, fillH: number, fillW: number, shiftRight: number, shiftUp: number) => {
    const a = aspect(), vfov = THREE.MathUtils.degToRad(cam.fov), hf = 2 * Math.atan(Math.tan(vfov / 2) * a);
    const d = Math.max((h / fillH) / (2 * Math.tan(vfov / 2)), (w / fillW) / (2 * Math.tan(hf / 2)));
    const dir = new THREE.Vector3(Math.sin(yaw), 0, Math.cos(yaw));
    const pos = focus.clone().addScaledVector(dir, d); pos.y += 0.6;
    const right = new THREE.Vector3(dir.z, 0, -dir.x);
    const at = focus.clone();
    at.addScaledVector(right, -shiftRight * 2 * Math.tan(hf / 2) * d);   // positive shiftRight moves the subject right of centre
    at.y -= shiftUp * 2 * Math.tan(vfov / 2) * d;                         // positive shiftUp moves the subject up
    return { pos, at };
  };
  const keys = (): Key[] => {
    const K: Key[] = [];
    built.forEach((b, i) => {
      const s = stations[i];
      if (s.kind === 'arrival') { K.push({ pos: new THREE.Vector3(mobile ? 0 : -4, mobile ? 11 : 9, 40), at: new THREE.Vector3(mobile ? 0 : 6, 7, -180), s0: i, s1: i + 0.12 }); }
      else if (s.kind === 'close') {
        K.push({ pos: new THREE.Vector3(mobile ? -2 : -12, mobile ? 28 : 26, zEnd * 0.35 + (mobile ? 45 : 60)), at: new THREE.Vector3(mobile ? 0 : 8, 3, zEnd * 0.8), s0: i - 0.05, s1: i + 1 });
      } else {
        const yaw = -b.side * 0.12;
        const rest = mobile ? frame(b.focus, b.w, b.h, yaw, 0.46, 0.94, 0, 0.2) : frame(b.focus, b.w, b.h, yaw, 0.8, 0.62, 0.16, 0);
        const hasRow = !!b.row;
        K.push({ ...rest, s0: i, s1: i + (hasRow ? 0.22 : 0.34) });
        if (b.row) {
          const rv = mobile ? frame(b.row.center, b.row.w, b.row.h, b.side * 0.18, 0.4, 0.96, 0, 0.18) : frame(b.row.center, b.row.w, b.row.h, b.side * 0.18, 0.5, 0.84, 0.04, -0.06);
          K.push({ ...rv, s0: i + 0.44, s1: i + 0.6 });
        }
        // rise over and swing to the open side before the next station
        const next = built[i + 1];
        const from = hasRow ? K[K.length - 1].pos : rest.pos;
        const mid = from.clone().lerp(next && stations[i + 1].kind !== 'close' ? next.focus : new THREE.Vector3(0, 8, zEnd), 0.45);
        mid.y = Math.max(mid.y, 15); mid.x = lerp(mid.x, b.group.position.x - b.side * 18, 0.5);
        K.push({ pos: mid, at: (next?.focus ?? b.focus).clone(), s0: i + 0.8, s1: i + 0.8 });
      }
    });
    return K;
  };
  let K = keys(), posCurve!: THREE.CatmullRomCurve3, atCurve!: THREE.CatmullRomCurve3;
  const curves = () => { posCurve = new THREE.CatmullRomCurve3(K.map((k) => k.pos), false, 'centripetal'); atCurve = new THREE.CatmullRomCurve3(K.map((k) => k.at), false, 'centripetal'); };
  curves();
  const uAt = (s: number) => {                      // scroll value -> curve parameter, holding still inside each dwell
    const n = K.length - 1;
    if (s <= K[0].s1) return 0;
    for (let k = 0; k < n; k++) {
      if (s <= K[k + 1].s0) { const f = (s - K[k].s1) / Math.max(1e-6, K[k + 1].s0 - K[k].s1); return (k + inOut(f)) / n; }
      if (s <= K[k + 1].s1) return (k + 1) / n;
    }
    return 1;
  };

  // --- tap a panel to open it
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(); let down: { x: number; y: number; t: number } | null = null;
  addEventListener('pointerdown', (e) => { down = { x: e.clientX, y: e.clientY, t: performance.now() }; }, { passive: true });
  addEventListener('pointerup', (e) => {
    if (!down || Math.hypot(e.clientX - down.x, e.clientY - down.y) > 8 || performance.now() - down.t > 450) return;
    if ((e.target as HTMLElement).closest('a,button,[data-cb],dialog,.site-head,.site-foot')) return;
    ndc.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1); ray.setFromCamera(ndc, cam);
    const hit = ray.intersectObjects(clickable, false)[0]; if (hit) opts.open((hit.object as any).__panel.media);
  });
  addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    ndc.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1); ray.setFromCamera(ndc, cam);
    document.documentElement.style.cursor = ray.intersectObjects(clickable, false).length && !(e.target as HTMLElement).closest('a,button') ? 'pointer' : '';
  }, { passive: true });

  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  if (matchMedia('(hover: hover) and (pointer: fine)').matches) addEventListener('pointermove', (e) => { pointer.tx = e.clientX / innerWidth - 0.5; pointer.ty = e.clientY / innerHeight - 0.5; }, { passive: true });

  const resize = () => {
    const w = canvas.clientWidth, h = canvas.clientHeight; renderer.setSize(w, h, false);
    cam.aspect = w / h; cam.updateProjectionMatrix(); K = keys(); curves();
  };
  new ResizeObserver(resize).observe(canvas); resize();

  // --- per-frame
  let S = 0, Sd = 0, time = 0;
  const camPos = new THREE.Vector3(), camAt = new THREE.Vector3(), tmp = new THREE.Vector3();
  const wake = (p: Panel, e: number, want: boolean) => {
    p.mat.color.setScalar(0.62 + 0.38 * e);
    (p.halo.material as THREE.MeshBasicMaterial).opacity = 0.03 + 0.09 * e;
    (p.pool.material as THREE.MeshBasicMaterial).opacity = 0.03 + 0.12 * e;
    p.edge.opacity = 0.1 + 0.3 * e;
    p.sheen.uniforms.x.value = lerp(-0.3, 1.5, e); p.sheen.uniforms.a.value = Math.sin(Math.PI * e);
    if (p.v) {
      if (want && p.v.paused) p.v.play().catch(() => {});
      if (!want && !p.v.paused) p.v.pause();
    }
  };
  const update = () => {
    built.forEach((b, k) => {
      const near = clamp(1 - Math.abs(Sd - k) / 0.9), e = smooth(near);
      b.lit += (e - b.lit) * 0.1;
      b.ink.forEach((m) => (m.uniforms.k.value = e));
      if (b.massing) b.massing.scale.y = Math.max(0.001, smooth(clamp((near - 0.25) / 0.75)) * 0.16);
      if (b.main) { wake(b.main, b.lit, Sd > k - 0.9 && Sd < k + 0.75); b.group.position.y = Math.sin(time * 0.5 + k * 1.7) * 0.1; }
      const rowE = smooth(clamp(1 - Math.abs(Sd - (k + 0.52)) / 0.45));
      b.more.forEach((p, j) => wake(p, smooth(clamp(rowE * 1.25 - j * 0.12)), Sd > k + 0.05 && Sd < k + 0.95));
      if (b.night) b.night.opacity = smooth(clamp((Sd - (stations.length - 2.2)) / 1));
    });
    const night = smooth(clamp((Sd - (stations.length - 2.2)) / 1));
    skyU.night.value = night; starMat.opacity = night * 0.9;
    (scene.fog as THREE.FogExp2).color.copy(FOG).lerp(new THREE.Color(0x070910), night);
    renderer.toneMappingExposure = 1.0 - night * 0.1;
  };

  let running = true, last = performance.now();
  const loop = (now: number) => {
    if (!running) return;
    const dt = Math.min(0.05, (now - last) / 1000); last = now; time += dt;
    Sd += (S - Sd) * (1 - Math.exp(-dt * 3.2)); if (Math.abs(S - Sd) < 1e-4) Sd = S;
    const u = uAt(Sd); posCurve.getPoint(u, camPos); atCurve.getPoint(u, camAt);
    pointer.x += (pointer.tx - pointer.x) * 0.05; pointer.y += (pointer.ty - pointer.y) * 0.05;
    cam.position.copy(camPos).add(tmp.set(pointer.x * 1.6, -pointer.y * 0.9, 0)); cam.lookAt(camAt);
    update();
    (water.material as THREE.ShaderMaterial).uniforms.time.value = time * 0.35;
    const dp = dustGeo.attributes.position as THREE.BufferAttribute;
    for (let k = 0; k < N; k++) { let y = dp.getY(k) + dt * 0.3; if (y > 30) y = 0; dp.setY(k, y); } dp.needsUpdate = true;
    renderer.render(scene, cam);
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
  document.addEventListener('visibilitychange', () => {
    const was = running; running = !document.hidden;
    if (running && !was) { last = performance.now(); requestAnimationFrame(loop); }
    if (!running) videos.forEach((v) => v.pause());
  });

  return { set: (s: number) => { S = s; }, stations: stations.length, pauseAll: () => videos.forEach((v) => v.pause()) };
}

// Aura Theatre massing diagram, simplified from Iva's plans, site plan and red massing study.
// Not to scale. Drawn as red linework on paper, with an axonometric (orthographic) camera.
import * as THREE from 'three';

const RED = 0xc4313a;
const PAPER = 0xe8e1d6;

type Part = { obj: THREE.Object3D; from: { y?: number; sy?: number; o?: number }; at: number };

export function mountMassing(host: HTMLElement) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, -500, 500);
  const pivot = new THREE.Group();
  scene.add(pivot);
  const model = new THREE.Group();
  pivot.add(model);

  const line = (o = 1) => new THREE.LineBasicMaterial({ color: RED, transparent: true, opacity: o });
  const fill = (c: number, o: number) => new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: o, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1, depthWrite: false });
  const parts: Part[] = [];

  // Footprint: square pavilion, a curved neck, then the long wing (from her axonometry and site plan)
  const fp = new THREE.Shape();
  fp.moveTo(0, 0); fp.lineTo(40, 0);
  fp.quadraticCurveTo(46, 14, 58, 16);
  fp.lineTo(112, 16); fp.lineTo(112, 36); fp.lineTo(0, 36); fp.lineTo(0, 0);

  const H = 7.5;
  // ground plane outline
  const ground = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.ShapeGeometry(fp, 24)), line(0.55));
  ground.rotation.x = -Math.PI / 2;
  model.add(ground); parts.push({ obj: ground, from: { o: 0 }, at: 0 });

  // glass volume: faint fill + edges
  const vol = new THREE.ExtrudeGeometry(fp, { depth: H, bevelEnabled: false, curveSegments: 24 });
  vol.rotateX(-Math.PI / 2);
  const glass = new THREE.Group();
  glass.add(new THREE.Mesh(vol, fill(0xd9a7a0, 0.18)));
  glass.add(new THREE.LineSegments(new THREE.EdgesGeometry(vol, 20), line(0.45)));
  model.add(glass); parts.push({ obj: glass, from: { sy: 0.001 }, at: 0.1 });

  // slender columns along the edges
  const cols = new THREE.Group();
  const colGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, H, 0)]);
  const pts = fp.getSpacedPoints(70);
  pts.forEach((p) => { const c = new THREE.Line(colGeo, line(0.9)); c.position.set(p.x, 0, -p.y); cols.add(c); });
  model.add(cols); parts.push({ obj: cols, from: { sy: 0.001 }, at: 0.2 });

  // thin roof slab with overhang
  const roofShape = new THREE.Shape(fp.getPoints(24).map((p) => new THREE.Vector2(p.x, p.y)));
  const roofGeo = new THREE.ExtrudeGeometry(roofShape, { depth: 0.6, bevelEnabled: false });
  roofGeo.rotateX(-Math.PI / 2); roofGeo.scale(1.03, 1, 1.05); roofGeo.translate(-1.2, 0, 0.9);
  const roof = new THREE.Group();
  roof.add(new THREE.Mesh(roofGeo, fill(PAPER, 0.85)));
  roof.add(new THREE.LineSegments(new THREE.EdgesGeometry(roofGeo, 20), line(1)));
  roof.position.y = H;
  model.add(roof); parts.push({ obj: roof, from: { y: H + 14, o: 0 }, at: 0.38 });

  // the ring: an open timber drum on the roof, around the auditorium
  const ring = new THREE.Group();
  const R = 12.5, RH = 4.2;
  const drum = new THREE.CylinderGeometry(R, R, RH, 72, 1, true);
  ring.add(new THREE.Mesh(drum, fill(0xc4313a, 0.16)));
  const circle = (y: number, r: number) => { const g = new THREE.BufferGeometry().setFromPoints(new THREE.EllipseCurve(0, 0, r, r).getSpacedPoints(96).map((v) => new THREE.Vector3(v.x, y, v.y))); return new THREE.LineLoop(g, line(1)); };
  ring.add(circle(-RH / 2, R), circle(RH / 2, R), circle(RH / 2, R - 1.4));
  for (let a = 0; a < 72; a++) { // vertical slats
    const t = (a / 72) * Math.PI * 2; const g = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(Math.cos(t) * R, -RH / 2, Math.sin(t) * R), new THREE.Vector3(Math.cos(t) * R, RH / 2, Math.sin(t) * R)]);
    ring.add(new THREE.Line(g, line(0.5)));
  }
  ring.position.set(19, H + 0.6 + RH / 2, -18);
  model.add(ring); parts.push({ obj: ring, from: { y: ring.position.y + 22, o: 0 }, at: 0.55 });

  // centre the model on its pivot
  const box = new THREE.Box3().setFromObject(model); const c = box.getCenter(new THREE.Vector3());
  model.position.set(-c.x, -box.min.y - 6, -c.z);

  // remember rest state for each part
  const rest = parts.map((p) => ({ y: p.obj.position.y, sy: p.obj.scale.y }));
  const setOpacity = (o: THREE.Object3D, k: number) => o.traverse((n: any) => { if (n.material) { n.material.userData.base ??= n.material.opacity; n.material.opacity = n.material.userData.base * k; } });

  let assemble = 1, spin = 0, drag = 0;
  const resize = () => {
    const w = host.clientWidth, h = host.clientHeight; renderer.setSize(w, h, false);
    const a = w / h; const span = Math.max(66, 128 / a);
    cam.left = -span * a / 2; cam.right = span * a / 2; cam.top = span / 2; cam.bottom = -span / 2; cam.updateProjectionMatrix();
  };
  const ease = (x: number) => 1 - Math.pow(1 - Math.max(0, Math.min(1, x)), 3);
  const render = () => {
    parts.forEach((p, i) => {
      const k = ease((assemble - p.at) / 0.35);
      if (p.from.y !== undefined) p.obj.position.y = p.from.y + (rest[i].y - p.from.y) * k;
      if (p.from.sy !== undefined) p.obj.scale.y = p.from.sy + (rest[i].sy - p.from.sy) * k;
      if (p.from.o !== undefined || p.from.y !== undefined) setOpacity(p.obj, p.from.o === undefined ? 1 : k);
      p.obj.visible = k > 0.001 || p.at === 0;
    });
    // axonometric view: 30° tilt, rotating with scroll and drag
    pivot.rotation.set(0, 0, 0);
    cam.position.set(0, 0, 0);
    const yaw = THREE.MathUtils.degToRad(-38 + spin * 64 + drag);
    cam.position.set(Math.sin(yaw) * 200, 175, Math.cos(yaw) * 200);
    cam.lookAt(0, 0, 0);
    renderer.render(scene, cam);
  };

  // drag to turn (pointer), with a gentle return
  let down = false, lx = 0;
  host.addEventListener('pointerdown', (e) => { down = true; lx = e.clientX; host.setPointerCapture(e.pointerId); });
  host.addEventListener('pointermove', (e) => { if (!down) return; drag += (e.clientX - lx) * 0.35; lx = e.clientX; render(); });
  host.addEventListener('pointerup', () => { down = false; });
  host.addEventListener('keydown', (e) => { if (e.key === 'ArrowLeft') { drag -= 8; render(); } if (e.key === 'ArrowRight') { drag += 8; render(); } });

  new ResizeObserver(() => { resize(); render(); }).observe(host);
  resize(); render();
  return {
    set(a: number, s: number) { assemble = a; spin = s; render(); },
    dispose() { renderer.dispose(); },
  };
}

// The peak's signature move: Iva's ground floor plan lies flat, the massing rises out of it,
// and the camera swings round to the angle of her render. Massing is simplified from her plan
// (footprint proportions measured from the drawing), not to scale.
import * as THREE from 'three';

const ease = (x: number) => { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); };
const span = (p: number, a: number, b: number) => ease((p - a) / (b - a));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export async function mountPeak(canvas: HTMLCanvasElement, planUrl: string) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);
  const scene = new THREE.Scene();
  const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, -1000, 1000);
  const model = new THREE.Group();
  scene.add(model);

  const RED = new THREE.Color(0xc4313a), GLOW = new THREE.Color(0xffb27a);
  const lineMats: THREE.LineBasicMaterial[] = [];
  const line = (o = 1) => { const m = new THREE.LineBasicMaterial({ color: RED.clone(), transparent: true, opacity: o }); m.userData.base = o; lineMats.push(m); return m; };
  const fill = (c: number, o: number) => new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: o, side: THREE.DoubleSide, depthWrite: false, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 });

  // her plan, on the ground. Building occupies u .08–.88, v .12–.92 of the drawing.
  const tex = await new THREE.TextureLoader().loadAsync(planUrl);
  tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
  const planMat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false });
  const planMesh = new THREE.Mesh(new THREE.PlaneGeometry(140, 35), planMat);
  planMesh.rotation.x = -Math.PI / 2; planMesh.position.set(-11.2 + 70, 0.02, (-32.2 + 2.8) / 2);
  model.add(planMesh);

  // footprint traced from the plan: full-depth pavilion, curved edge, half-depth wing
  const fp = new THREE.Shape();
  fp.moveTo(0, 0); fp.lineTo(26, 0); fp.quadraticCurveTo(46, 3, 62, 14); fp.lineTo(112, 14); fp.lineTo(112, 28); fp.lineTo(0, 28); fp.lineTo(0, 0);
  const H = 6;
  const geo = new THREE.ExtrudeGeometry(fp, { depth: H, bevelEnabled: false, curveSegments: 28 }); geo.rotateX(-Math.PI / 2);
  const walls = new THREE.Group();
  walls.add(new THREE.Mesh(geo, fill(0xd9a7a0, 0.14)), new THREE.LineSegments(new THREE.EdgesGeometry(geo, 20), line(0.75)));
  const colGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3(0, H, 0)]);
  fp.getSpacedPoints(84).forEach((p) => { const c = new THREE.Line(colGeo, line(0.5)); c.position.set(p.x, 0, -p.y); walls.add(c); });
  model.add(walls);

  const roofGeo = new THREE.ExtrudeGeometry(new THREE.Shape(fp.getPoints(28)), { depth: 0.5, bevelEnabled: false });
  roofGeo.rotateX(-Math.PI / 2); roofGeo.scale(1.035, 1, 1.08); roofGeo.translate(-1.6, 0, 1.1);
  const roof = new THREE.Group();
  const roofFill = fill(0xe8e1d6, 0.55);
  roof.add(new THREE.Mesh(roofGeo, roofFill), new THREE.LineSegments(new THREE.EdgesGeometry(roofGeo, 20), line(1)));
  model.add(roof);

  const ring = new THREE.Group(); const R = 9.5, RH = 3.6;
  ring.add(new THREE.Mesh(new THREE.CylinderGeometry(R, R, RH, 80, 1, true), fill(0xc4313a, 0.12)));
  const circle = (y: number, r: number) => new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(new THREE.EllipseCurve(0, 0, r, r).getSpacedPoints(100).map((v) => new THREE.Vector3(v.x, y, v.y))), line(1));
  ring.add(circle(-RH / 2, R), circle(RH / 2, R), circle(RH / 2, R - 1.2));
  for (let a = 0; a < 80; a++) { const t = (a / 80) * Math.PI * 2; ring.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(Math.cos(t) * R, -RH / 2, Math.sin(t) * R), new THREE.Vector3(Math.cos(t) * R, RH / 2, Math.sin(t) * R)]), line(0.45))); }
  ring.position.set(17, H + 0.5 + RH / 2, -16);
  model.add(ring);

  const c = new THREE.Box3().setFromObject(walls).getCenter(new THREE.Vector3());
  model.position.set(-c.x, 0, -c.z);
  const fade = (g: THREE.Object3D, k: number) => g.traverse((n: any) => { if (n.material) { n.material.userData.base ??= n.material.opacity; n.material.opacity = n.material.userData.base * k; } });

  let W = 1, Hh = 1;
  const resize = () => { W = canvas.clientWidth; Hh = canvas.clientHeight; renderer.setSize(W, Hh, false); };
  new ResizeObserver(() => { resize(); draw(last); }).observe(canvas);
  resize();

  let last = 0;
  function draw(p: number) {
    last = p;
    const a = W / Hh, mob = a < 1;
    // phases: plan (0–.15) · tilt (.1–.45) · rise (.22–.62) · roof (.5–.7) · ring (.6–.78) · swing (.62–1)
    const tilt = span(p, 0.1, 0.45), swing = span(p, 0.62, 1);
    const el = THREE.MathUtils.degToRad(lerp(89.4, 36, tilt) - 4 * swing);
    const yaw = THREE.MathUtils.degToRad(lerp(0, -32, tilt) + 6 * swing);
    cam.position.set(Math.sin(yaw) * Math.cos(el) * 300, Math.sin(el) * 300, Math.cos(yaw) * Math.cos(el) * 300);
    cam.up.set(0, 1, 0); cam.lookAt(0, mob ? 2 : 6, mob ? 0 : -4);
    const zoom = lerp(mob ? 168 : 200, mob ? 150 : 172, tilt) * lerp(1, 0.86, swing);
    const half = mob ? zoom / 2 : (zoom / a) / 2;
    cam.left = mob ? -zoom / 2 : -half * a; cam.right = -cam.left; cam.top = mob ? zoom / a / 2 : half; cam.bottom = -cam.top;
    cam.updateProjectionMatrix();

    const rise = span(p, 0.22, 0.62);
    walls.scale.y = Math.max(0.001, rise); walls.visible = rise > 0.002; fade(walls, rise);
    const r1 = span(p, 0.5, 0.7); roof.position.y = lerp(H + 18, H, r1); roof.visible = r1 > 0.002; fade(roof, r1);
    const r2 = span(p, 0.6, 0.78); ring.position.y = lerp(H + 26, H + 0.5 + RH / 2, r2); ring.visible = r2 > 0.002; fade(ring, r2);
    planMat.opacity = lerp(1, 0.35, rise);
    // dusk: lines warm towards lamplight, roof fill darkens with the page
    const dusk = span(p, 0.66, 0.95);
    lineMats.forEach((m) => m.color.copy(RED).lerp(GLOW, dusk));
    roofFill.color.setRGB(lerp(0.91, 0.2, dusk), lerp(0.88, 0.14, dusk), lerp(0.84, 0.1, dusk));
    renderer.render(scene, cam);
  }
  draw(0);
  return { draw };
}

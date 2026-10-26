// Little 3D dogs that roam along the bottom of the screen, fetch a thrown ball,
// and say an English idiom when clicked. Dogs are built from simple shapes,
// so there are no model files to download.
import {
  WebGLRenderer, Scene, OrthographicCamera, Group, Mesh, MeshToonMaterial, SphereGeometry,
  CapsuleGeometry, ConeGeometry, CylinderGeometry, HemisphereLight, DirectionalLight, Raycaster,
  Vector2, Object3D, Color,
} from 'three';
import { idioms } from '../data/idioms';

interface Breed { fur: number; belly: number; ear: 'flop' | 'pointy'; scale: number; name: string }

const BREEDS: Breed[] = [
  { name: 'Biscuit', fur: 0xd9a066, belly: 0xfff1dc, ear: 'flop', scale: 1 },
  { name: 'Luna', fur: 0x3b3230, belly: 0xf3ece2, ear: 'pointy', scale: 0.9 },
  { name: 'Bruno', fur: 0xf6efe6, belly: 0xf6efe6, ear: 'flop', scale: 0.8 },
];

type State = 'run' | 'sit' | 'fetch' | 'return' | 'jump';

interface Dog {
  root: Group; // positioned in screen space
  yaw: Group; // turns to face direction
  body: Group;
  head: Group;
  legs: Group[];
  tail: Group;
  breed: Breed;
  x: number;
  y: number;
  tx: number;
  ty: number;
  speed: number;
  state: State;
  timer: number;
  phase: number;
  facing: number;
  jumpT: number;
  hasBall: boolean;
}

const toon = (color: number) => new MeshToonMaterial({ color });

function makeDog(breed: Breed): Dog {
  const fur = toon(breed.fur);
  const belly = toon(breed.belly);
  const dark = toon(0x1d1b2e);
  const pink = toon(0xff7a7a);

  const root = new Group();
  const yaw = new Group();
  const body = new Group();
  root.add(yaw);
  yaw.add(body);

  const torso = new Mesh(new CapsuleGeometry(0.42, 0.9, 6, 12), fur);
  torso.rotation.z = Math.PI / 2;
  body.add(torso);
  const chest = new Mesh(new SphereGeometry(0.38, 12, 10), belly);
  chest.position.set(0.45, -0.08, 0);
  chest.scale.set(1, 1, 0.95);
  body.add(chest);

  const head = new Group();
  head.position.set(0.85, 0.45, 0);
  const skull = new Mesh(new SphereGeometry(0.42, 16, 12), fur);
  head.add(skull);
  const snout = new Mesh(new SphereGeometry(0.24, 12, 10), belly);
  snout.position.set(0.32, -0.1, 0);
  snout.scale.set(1.2, 0.85, 0.95);
  head.add(snout);
  const nose = new Mesh(new SphereGeometry(0.08, 10, 8), dark);
  nose.position.set(0.6, -0.02, 0);
  head.add(nose);
  for (const z of [-0.18, 0.18]) {
    const eye = new Mesh(new SphereGeometry(0.065, 10, 8), dark);
    eye.position.set(0.3, 0.12, z);
    head.add(eye);
    const ear = breed.ear === 'pointy'
      ? new Mesh(new ConeGeometry(0.14, 0.38, 8), fur)
      : new Mesh(new SphereGeometry(0.2, 10, 8), toon(new Color(breed.fur).multiplyScalar(0.8).getHex()));
    if (breed.ear === 'pointy') ear.position.set(-0.05, 0.42, z * 1.4);
    else { ear.scale.set(0.6, 1.3, 0.4); ear.position.set(-0.08, 0.05, z * 2.2); }
    head.add(ear);
  }
  const tongue = new Mesh(new SphereGeometry(0.07, 8, 6), pink);
  tongue.scale.set(1, 0.4, 1.3);
  tongue.position.set(0.42, -0.3, 0);
  head.add(tongue);
  body.add(head);

  const legs: Group[] = [];
  for (const [x, z] of [[0.45, 0.22], [0.45, -0.22], [-0.45, 0.22], [-0.45, -0.22]]) {
    const pivot = new Group();
    pivot.position.set(x, -0.2, z);
    const leg = new Mesh(new CylinderGeometry(0.1, 0.09, 0.5, 8), fur);
    leg.position.y = -0.25;
    const paw = new Mesh(new SphereGeometry(0.12, 8, 6), belly);
    paw.position.set(0.04, -0.5, 0);
    paw.scale.set(1.3, 0.7, 1);
    pivot.add(leg, paw);
    body.add(pivot);
    legs.push(pivot);
  }

  const tail = new Group();
  tail.position.set(-0.85, 0.2, 0);
  const tailMesh = new Mesh(new CapsuleGeometry(0.07, 0.4, 4, 8), fur);
  tailMesh.position.y = 0.22;
  tail.add(tailMesh);
  tail.rotation.z = -0.6;
  body.add(tail);

  const s = 46 * breed.scale;
  root.scale.setScalar(s);
  root.rotation.x = 0.35; // look slightly down on the dogs

  return {
    root, yaw, body, head, legs, tail, breed,
    x: 0, y: 0, tx: 0, ty: 0, speed: 0, state: 'run', timer: 0, phase: Math.random() * 10, facing: 1, jumpT: 0, hasBall: false,
  };
}

export interface DogSceneOptions {
  canvas: HTMLCanvasElement;
  count: number;
  bubble: HTMLElement;
}

export function startDogScene({ canvas, count, bubble }: DogSceneOptions) {
  const renderer = new WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  const scene = new Scene();
  const camera = new OrthographicCamera(0, 1, 0, -1, -1000, 1000);
  scene.add(new HemisphereLight(0xffffff, 0xffe2c4, 2.2));
  const sun = new DirectionalLight(0xffffff, 1.6);
  sun.position.set(0.4, 1, 0.8);
  scene.add(sun);

  let W = 0, H = 0;
  function resize() {
    W = innerWidth; H = innerHeight;
    renderer.setSize(W, H, false);
    camera.right = W; camera.bottom = -H;
    camera.updateProjectionMatrix();
  }
  resize();
  addEventListener('resize', resize);

  // Dogs roam in a band along the bottom of the viewport so they don't cover text.
  const band = () => ({ top: H - Math.min(150, H * 0.22), bottom: H - 40 });
  const randomTarget = (d: Dog) => {
    const b = band();
    d.tx = 40 + Math.random() * (W - 80);
    d.ty = b.top + Math.random() * (b.bottom - b.top);
  };

  const dogs: Dog[] = BREEDS.slice(0, count).map((breed, i) => {
    const d = makeDog(breed);
    d.x = ((i + 1) / (count + 1)) * innerWidth;
    d.y = band().bottom - i * 25;
    randomTarget(d);
    scene.add(d.root);
    return d;
  });

  const ball = new Mesh(new SphereGeometry(11, 16, 12), toon(0xe9f05a));
  ball.visible = false;
  scene.add(ball);
  const ballState = { active: false, x: 0, y: 0, vx: 0, vy: 0, floor: 0, landed: false, carrier: null as Dog | null };

  function throwBall(toX: number, toY: number) {
    const fromX = 40, fromY = H - 40;
    ballState.active = true;
    ballState.landed = false;
    ballState.carrier = null;
    ballState.x = fromX; ballState.y = fromY;
    ballState.floor = Math.min(Math.max(toY, 80), H - 30);
    const t = 0.9;
    ballState.vx = (toX - fromX) / t;
    ballState.vy = (ballState.floor - fromY) / t - 0.5 * 1400 * t;
    ball.visible = true;
    // The nearest free dog goes for it
    const chaser = dogs.reduce((a, b) => (Math.hypot(a.x - toX, a.y - toY) < Math.hypot(b.x - toX, b.y - toY) ? a : b));
    dogs.forEach((d) => { if (d.state === 'fetch') d.state = 'run'; });
    chaser.state = 'fetch';
  }

  let bubbleTimer = 0;
  let bubbleDog: Dog | null = null;
  function say(d: Dog) {
    const idiom = idioms[Math.floor(Math.random() * idioms.length)];
    bubble.replaceChildren();
    const b = document.createElement('b');
    b.textContent = `Woof! ${idiom.phrase}`;
    const p = document.createElement('span');
    p.className = 'block text-xs text-muted';
    p.textContent = idiom.meaning;
    bubble.append(b, p);
    bubble.hidden = false;
    bubbleDog = d;
    bubbleTimer = 4;
  }

  function jump(d: Dog) {
    if (d.state === 'jump') return;
    d.state = 'jump';
    d.jumpT = 0;
  }

  // Picking: the canvas ignores pointer events, so we raycast on window events.
  const ray = new Raycaster();
  const ndc = new Vector2();
  function hitDog(cx: number, cy: number): Dog | null {
    ndc.set((cx / W) * 2 - 1, -(cy / H) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const hits = ray.intersectObjects(dogs.map((d) => d.root), true);
    if (!hits.length) return null;
    let o: Object3D | null = hits[0].object;
    while (o && !dogs.some((d) => d.root === o)) o = o.parent;
    return dogs.find((d) => d.root === o) ?? null;
  }

  let throwMode = false;
  let mouse = { x: W / 2, y: H / 2 };
  function onPointerMove(e: PointerEvent) {
    mouse = { x: e.clientX, y: e.clientY };
    document.documentElement.style.cursor = throwMode ? 'crosshair' : hitDog(e.clientX, e.clientY) ? 'pointer' : '';
  }
  function onClick(e: MouseEvent) {
    if (throwMode) {
      e.preventDefault();
      e.stopPropagation();
      throwMode = false;
      document.documentElement.style.cursor = '';
      dispatchEvent(new CustomEvent('dogs:throwmode', { detail: false }));
      throwBall(e.clientX, e.clientY);
      return;
    }
    const d = hitDog(e.clientX, e.clientY);
    if (d) {
      e.preventDefault();
      jump(d);
      say(d);
    }
  }
  addEventListener('pointermove', onPointerMove, { passive: true });
  addEventListener('click', onClick, true);

  let lastScroll = scrollY;
  function onScroll() {
    const dy = scrollY - lastScroll;
    lastScroll = scrollY;
    if (Math.abs(dy) < 4) return;
    // A dog gets excited and runs across when you scroll
    const d = dogs[0];
    if (d.state === 'sit' || d.state === 'run') {
      d.state = 'run';
      d.tx = dy > 0 ? W - 60 : 60;
      d.speed = 320;
    }
  }
  addEventListener('scroll', onScroll, { passive: true });

  const onThrowRequest = () => {
    throwMode = !throwMode;
    document.documentElement.style.cursor = throwMode ? 'crosshair' : '';
    dispatchEvent(new CustomEvent('dogs:throwmode', { detail: throwMode }));
  };
  const onCelebrate = () => dogs.forEach((d, i) => setTimeout(() => jump(d), i * 150));
  addEventListener('dogs:throw', onThrowRequest);
  addEventListener('dogs:celebrate', onCelebrate);

  let last = performance.now();
  let raf = 0;
  let running = true;

  function step(d: Dog, dt: number) {
    d.phase += dt;
    let moving = false;

    if (d.state === 'fetch' && ballState.active) {
      d.tx = ballState.x; d.ty = ballState.landed ? ballState.y : ballState.floor;
    }
    if (d.state === 'run' || d.state === 'fetch' || d.state === 'return') {
      const dx = d.tx - d.x, dy = d.ty - d.y;
      const dist = Math.hypot(dx, dy);
      const target = d.state === 'run' ? Math.max(d.speed, 140) : 300;
      d.speed += (target - d.speed) * Math.min(1, dt * 3);
      if (dist > 6) {
        const v = Math.min(dist, d.speed * dt);
        d.x += (dx / dist) * v; d.y += (dy / dist) * v;
        if (Math.abs(dx) > 2) d.facing = Math.sign(dx);
        moving = true;
      } else if (d.state === 'fetch' && ballState.landed) {
        d.hasBall = true;
        ballState.carrier = d;
        d.state = 'return';
        randomTarget(d);
        d.tx = 80;
      } else if (d.state === 'return') {
        d.hasBall = false;
        ballState.active = false;
        ballState.carrier = null;
        ball.visible = false;
        d.state = 'sit';
        d.timer = 3;
        say(d);
      } else if (d.state === 'run') {
        d.speed = 120 + Math.random() * 80;
        if (Math.random() < 0.5) { d.state = 'sit'; d.timer = 2 + Math.random() * 4; }
        else randomTarget(d);
      }
    } else if (d.state === 'sit') {
      d.timer -= dt;
      if (d.timer <= 0) { d.state = 'run'; randomTarget(d); }
    } else if (d.state === 'jump') {
      d.jumpT += dt;
      if (d.jumpT > 0.6) { d.state = 'sit'; d.timer = 1.5; }
    }

    // Pose
    const runCycle = d.phase * 14;
    const swing = moving ? 0.8 : 0;
    d.legs.forEach((leg, i) => {
      const sitting = d.state === 'sit' && i >= 2;
      leg.rotation.z = sitting ? 1.2 : Math.sin(runCycle + (i % 2 === 0 ? 0 : Math.PI) + (i >= 2 ? Math.PI / 2 : 0)) * swing;
    });
    const sitTilt = d.state === 'sit' ? 0.45 : 0;
    d.body.rotation.z += (sitTilt - d.body.rotation.z) * Math.min(1, dt * 8);
    d.body.position.y = moving ? Math.abs(Math.sin(runCycle)) * 0.12 : d.state === 'sit' ? -0.15 : 0;
    if (d.state === 'jump') d.body.position.y = Math.sin((d.jumpT / 0.6) * Math.PI) * 1.4;
    d.tail.rotation.x = Math.sin(d.phase * (d.state === 'sit' || d.state === 'jump' ? 22 : 12)) * 0.6;

    // Face movement direction, turned a bit towards the viewer
    const wantYaw = d.facing > 0 ? -0.55 : Math.PI + 0.55;
    d.yaw.rotation.y += (wantYaw - d.yaw.rotation.y) * Math.min(1, dt * 6);
    // When sitting, look at the cursor
    const look = d.state === 'sit' ? Math.max(-0.6, Math.min(0.6, (mouse.y - d.y) / -300)) : 0;
    d.head.rotation.z += (look - d.head.rotation.z) * Math.min(1, dt * 5);

    d.root.position.set(d.x, -d.y + 20 * d.breed.scale, d.y * 0.2); // lower dogs draw in front
  }

  function stepBall(dt: number) {
    if (!ballState.active) return;
    if (ballState.carrier) {
      const c = ballState.carrier;
      ball.position.set(c.x + c.facing * 46 * c.breed.scale, -c.y + 36 * c.breed.scale, c.y * 0.2 + 30);
      return;
    }
    if (!ballState.landed) {
      ballState.vy += 1400 * dt;
      ballState.x += ballState.vx * dt;
      ballState.y += ballState.vy * dt;
      if (ballState.y >= ballState.floor && ballState.vy > 0) {
        ballState.y = ballState.floor;
        ballState.vy *= -0.45;
        ballState.vx *= 0.6;
        if (Math.abs(ballState.vy) < 120) ballState.landed = true;
      }
    }
    ball.position.set(ballState.x, -ballState.y, ballState.y * 0.2 + 30);
  }

  function frame(now: number) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    dogs.forEach((d) => step(d, dt));
    stepBall(dt);
    if (bubbleDog) {
      bubbleTimer -= dt;
      bubble.style.transform = `translate(${Math.min(Math.max(bubbleDog.x - 40, 8), W - 268)}px, ${bubbleDog.y - 130}px)`;
      if (bubbleTimer <= 0) { bubble.hidden = true; bubbleDog = null; }
    }
    renderer.render(scene, camera);
    if (running) raf = requestAnimationFrame(frame);
  }
  raf = requestAnimationFrame(frame);

  function onVisibility() {
    if (document.hidden) { running = false; cancelAnimationFrame(raf); }
    else if (!running) { running = true; last = performance.now(); raf = requestAnimationFrame(frame); }
  }
  document.addEventListener('visibilitychange', onVisibility);

  return function stop() {
    running = false;
    cancelAnimationFrame(raf);
    removeEventListener('resize', resize);
    removeEventListener('pointermove', onPointerMove);
    removeEventListener('click', onClick, true);
    removeEventListener('scroll', onScroll);
    removeEventListener('dogs:throw', onThrowRequest);
    removeEventListener('dogs:celebrate', onCelebrate);
    document.removeEventListener('visibilitychange', onVisibility);
    document.documentElement.style.cursor = '';
    bubble.hidden = true;
    renderer.dispose();
  };
}

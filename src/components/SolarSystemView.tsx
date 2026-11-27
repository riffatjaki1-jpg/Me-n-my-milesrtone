import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { ArrowLeft } from 'lucide-react';

export type CelestialBodyId =
  | 'sun'
  | 'mercury'
  | 'venus'
  | 'earth'
  | 'mars'
  | 'ceres'
  | 'jupiter'
  | 'saturn'
  | 'uranus'
  | 'neptune'
  | 'pluto'
  | 'haumea'
  | 'makemake'
  | 'eris';

interface SolarSystemViewProps {
  paused: boolean;
  onBack: () => void;
  onInteractBody: (bodyId: CelestialBodyId) => void;
}

type PlanetTexType = 'sun' | 'gas_jupiter' | 'gas_saturn' | 'ice_giant' | 'rocky';

interface PlanetSpec {
  id: CelestialBodyId;
  radius: number;
  distance: number;
  speed: number;
  color: string;
  secondaryColor: string;
  type: PlanetTexType;
  isDwarf?: boolean;
  hasRing?: boolean;
  ringInner?: number;
  ringOuter?: number;
}

const PLANET_SPECS: PlanetSpec[] = [
  { id: 'mercury', radius: 3.4, distance: 38, speed: 0.04, color: '#a1a1aa', secondaryColor: '#52525b', type: 'rocky' },
  { id: 'venus', radius: 4.4, distance: 56, speed: 0.028, color: '#f59e0b', secondaryColor: '#b45309', type: 'ice_giant' },
  { id: 'earth', radius: 4.8, distance: 78, speed: 0.02, color: '#2563eb', secondaryColor: '#10b981', type: 'rocky' },
  { id: 'mars', radius: 4.0, distance: 102, speed: 0.015, color: '#ef4444', secondaryColor: '#7f1d1d', type: 'rocky' },
  { id: 'ceres', radius: 3.5, distance: 128, speed: 0.012, color: '#9ca3af', secondaryColor: '#4b5563', type: 'rocky', isDwarf: true },
  { id: 'jupiter', radius: 9.0, distance: 165, speed: 0.009, color: '#d97706', secondaryColor: '#fed7aa', type: 'gas_jupiter' },
  {
    id: 'saturn',
    radius: 7.6,
    distance: 220,
    speed: 0.0068,
    color: '#fef08a',
    secondaryColor: '#ca8a04',
    type: 'gas_saturn',
    hasRing: true,
    ringInner: 9.8,
    ringOuter: 17.5,
  },
  {
    id: 'uranus',
    radius: 5.8,
    distance: 275,
    speed: 0.0048,
    color: '#67e8f9',
    secondaryColor: '#06b6d4',
    type: 'ice_giant',
    hasRing: true,
    ringInner: 7.2,
    ringOuter: 10.0,
  },
  { id: 'neptune', radius: 5.6, distance: 325, speed: 0.0038, color: '#3b82f6', secondaryColor: '#1d4ed8', type: 'ice_giant' },
  { id: 'pluto', radius: 3.6, distance: 370, speed: 0.0031, color: '#d4b996', secondaryColor: '#854d0e', type: 'rocky', isDwarf: true },
  {
    id: 'haumea',
    radius: 3.5,
    distance: 412,
    speed: 0.0027,
    color: '#e2e8f0',
    secondaryColor: '#94a3b8',
    type: 'rocky',
    isDwarf: true,
    hasRing: true,
    ringInner: 4.6,
    ringOuter: 6.4,
  },
  { id: 'makemake', radius: 3.5, distance: 454, speed: 0.0024, color: '#fed7aa', secondaryColor: '#ea580c', type: 'rocky', isDwarf: true },
  { id: 'eris', radius: 3.6, distance: 498, speed: 0.0021, color: '#f8fafc', secondaryColor: '#cbd5e1', type: 'rocky', isDwarf: true },
];

const _forward = new THREE.Vector3();
const _right = new THREE.Vector3();
const _move = new THREE.Vector3();

function detectSoftwareGl(): boolean {
  const probeCanvas = document.createElement('canvas');
  const gl = probeCanvas.getContext('webgl2');
  if (!gl) return true;
  const ext = gl.getExtension('WEBGL_debug_renderer_info');
  const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
  const gpu = String(gl.getParameter(param));
  gl.getExtension('WEBGL_lose_context')?.loseContext();
  return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
}

function createProceduralTexture(
  type: PlanetTexType,
  colorHex: string,
  secondaryHex: string,
  maxAnisotropy: number,
) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  if (type === 'sun') {
    const grad = ctx.createRadialGradient(256, 128, 20, 256, 128, 256);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.3, '#ffea75');
    grad.addColorStop(0.7, '#ff8f00');
    grad.addColorStop(1, '#ff3d00');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 256);

    for (let i = 0; i < 1000; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 90, 0, 0.3)';
      ctx.fillRect(Math.random() * 512, Math.random() * 256, Math.random() * 3 + 1, Math.random() * 3 + 1);
    }
  } else if (type === 'gas_jupiter') {
    for (let y = 0; y < 256; y++) {
      const wave = Math.sin(y * 0.16) * Math.cos(y * 0.06);
      const t = Math.abs(wave);
      ctx.fillStyle = t > 0.5 ? colorHex : secondaryHex;
      ctx.fillRect(0, y, 512, 1);
    }
    ctx.fillStyle = '#b91c1c';
    ctx.beginPath();
    ctx.ellipse(325, 160, 35, 19, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (type === 'gas_saturn') {
    for (let y = 0; y < 256; y++) {
      const n = (Math.sin(y * 0.08) + 1) * 0.5;
      ctx.fillStyle = n > 0.5 ? '#e2c595' : '#c9a873';
      ctx.fillRect(0, y, 512, 1);
    }
  } else if (type === 'ice_giant') {
    const grad = ctx.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, colorHex);
    grad.addColorStop(0.5, secondaryHex);
    grad.addColorStop(1, colorHex);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 256);
  } else {
    ctx.fillStyle = colorHex;
    ctx.fillRect(0, 0, 512, 256);
    for (let i = 0; i < 240; i++) {
      const cx = Math.random() * 512;
      const cy = Math.random() * 256;
      const r = Math.random() * 12 + 2;
      ctx.fillStyle = secondaryHex;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = maxAnisotropy;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

function createRingTexture(maxAnisotropy: number) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 32;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createLinearGradient(0, 0, 512, 0);
  grad.addColorStop(0.0, 'rgba(0,0,0,0)');
  grad.addColorStop(0.1, 'rgba(180, 160, 130, 0.4)');
  grad.addColorStop(0.35, 'rgba(215, 195, 160, 0.85)');
  grad.addColorStop(0.5, 'rgba(30, 20, 10, 0.1)');
  grad.addColorStop(0.65, 'rgba(200, 180, 150, 0.9)');
  grad.addColorStop(0.9, 'rgba(160, 140, 115, 0.5)');
  grad.addColorStop(1.0, 'rgba(0,0,0,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 32);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = maxAnisotropy;
  return texture;
}

export function SolarSystemView({ paused, onBack, onInteractBody }: SolarSystemViewProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(paused);
  const onInteractRef = useRef(onInteractBody);
  pausedRef.current = paused;
  onInteractRef.current = onInteractBody;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !pausedRef.current) {
        onBack();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onBack]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const isSoftwareGl = detectSoftwareGl();

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x010206, 0.00055);

    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.2,
      6000,
    );
    camera.position.set(0, 220, 480);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        powerPreference: 'high-performance',
      });
    } catch {
      return;
    }
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.06;
    controls.enableRotate = true;
    controls.enableZoom = true;
    controls.enablePan = true;
    controls.screenSpacePanning = true;
    controls.zoomSpeed = 1.5;
    controls.panSpeed = 1.4;
    controls.rotateSpeed = 0.85;
    controls.minDistance = 4;
    controls.maxDistance = 3000;
    controls.minPolarAngle = 0;
    controls.maxPolarAngle = Math.PI;
    controls.target.set(0, 0, 0);

    const sunOmniLight = new THREE.PointLight(0xffffff, 3.5, 3500, 0.1);
    sunOmniLight.position.set(0, 0, 0);
    scene.add(sunOmniLight);

    const spaceAmbientFill = new THREE.AmbientLight(0x1e293b, 0.45);
    scene.add(spaceAmbientFill);

    const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();
    const disposables: Array<{ dispose: () => void }> = [];
    const clickableObjects: THREE.Object3D[] = [];

    // Sun
    const sunRadius = 18;
    const sunGeo = new THREE.SphereGeometry(sunRadius, 48, 48);
    const sunTex = createProceduralTexture('sun', '#ffea75', '#ff3d00', maxAnisotropy);
    const sunMat = new THREE.MeshBasicMaterial({ map: sunTex });
    const sunMesh = new THREE.Mesh(sunGeo, sunMat);
    sunMesh.userData.bodyId = 'sun' as CelestialBodyId;
    sunMesh.layers.enable(1);
    scene.add(sunMesh);
    clickableObjects.push(sunMesh);
    disposables.push(sunGeo, sunTex, sunMat);

    // Sun Corona Glow
    const coronaGeo = new THREE.SphereGeometry(sunRadius * 1.25, 48, 48);
    const coronaMat = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
          gl_FragColor = vec4(1.0, 0.65, 0.15, 1.0) * intensity * 1.5;
        }
      `,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true,
    });
    const sunGlowMesh = new THREE.Mesh(coronaGeo, coronaMat);
    scene.add(sunGlowMesh);
    disposables.push(coronaGeo, coronaMat);

    // Starfield
    const starGeo = new THREE.BufferGeometry();
    const starCount = 3200;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const r = 1000 + Math.random() * 1400;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      starPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      starPositions[i * 3 + 1] = r * Math.cos(phi);
      starPositions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 1.2,
      transparent: true,
      opacity: 0.8,
    });
    const starField = new THREE.Points(starGeo, starMat);
    scene.add(starField);
    disposables.push(starGeo, starMat);

    const ringTexture = createRingTexture(maxAnisotropy);
    disposables.push(ringTexture);

    // Planets & Dwarf Planets (zero satellites / moons)
    const orbitingBodies: Array<{
      mesh: THREE.Mesh;
      distance: number;
      speed: number;
      angle: number;
    }> = [];

    PLANET_SPECS.forEach((p) => {
      const orbitCurve = new THREE.EllipseCurve(0, 0, p.distance, p.distance, 0, Math.PI * 2, false, 0);
      const orbitPoints = orbitCurve.getPoints(128);
      const orbitGeo = new THREE.BufferGeometry().setFromPoints(
        orbitPoints.map((pt) => new THREE.Vector3(pt.x, 0, pt.y)),
      );
      const orbitLineMat = new THREE.LineBasicMaterial({
        color: p.isDwarf ? 0x6ee7b7 : 0x34d399,
        transparent: true,
        opacity: p.isDwarf ? 0.35 : 0.22,
      });
      const orbitLine = new THREE.Line(orbitGeo, orbitLineMat);
      scene.add(orbitLine);
      disposables.push(orbitGeo, orbitLineMat);

      const planetGeo = new THREE.SphereGeometry(p.radius, 40, 40);
      const planetTex = createProceduralTexture(p.type, p.color, p.secondaryColor, maxAnisotropy);
      const planetMat = new THREE.MeshStandardMaterial({
        map: planetTex,
        roughness: 0.65,
        metalness: 0.1,
      });
      const planetMesh = new THREE.Mesh(planetGeo, planetMat);
      planetMesh.userData.bodyId = p.id;
      planetMesh.layers.enable(1);

      const initialAngle = Math.random() * Math.PI * 2;
      planetMesh.position.set(
        Math.cos(initialAngle) * p.distance,
        0,
        Math.sin(initialAngle) * p.distance,
      );
      scene.add(planetMesh);
      clickableObjects.push(planetMesh);
      disposables.push(planetGeo, planetTex, planetMat);

      // Enlarged invisible hit sphere so even small planets are effortless to click/tap
      const hitRadius = Math.max(p.radius * 1.45, 7.5);
      const hitGeo = new THREE.SphereGeometry(hitRadius, 12, 12);
      const hitMat = new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 0,
        depthWrite: false,
      });
      const hitMesh = new THREE.Mesh(hitGeo, hitMat);
      hitMesh.userData.bodyId = p.id;
      hitMesh.layers.enable(1);
      planetMesh.add(hitMesh);
      clickableObjects.push(hitMesh);
      disposables.push(hitGeo, hitMat);

      if (p.hasRing) {
        const ringGeo = new THREE.RingGeometry(p.ringInner ?? p.radius * 1.4, p.ringOuter ?? p.radius * 2.2, 64);
        const ringMat = new THREE.MeshBasicMaterial({
          map: ringTexture,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.85,
        });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.rotation.x = Math.PI / 2 + 0.35;
        planetMesh.add(ringMesh);
        disposables.push(ringGeo, ringMat);
      }

      orbitingBodies.push({
        mesh: planetMesh,
        distance: p.distance,
        speed: p.speed,
        angle: initialAngle,
      });
    });

    // Free camera keyboard flight (WASD / Arrow keys / Q-E)
    const activeKeys = new Set<string>();
    const handleKeyDownFly = (e: KeyboardEvent) => {
      if (pausedRef.current) return;
      activeKeys.add(e.code);
    };
    const handleKeyUpFly = (e: KeyboardEvent) => {
      activeKeys.delete(e.code);
    };
    window.addEventListener('keydown', handleKeyDownFly);
    window.addEventListener('keyup', handleKeyUpFly);

    // Raycasting for interaction -> straight to unique Blank Page for that planet
    const raycaster = new THREE.Raycaster();
    raycaster.layers.set(1);
    const pointer = new THREE.Vector2();
    let downX = 0;
    let downY = 0;
    let isDraggingCamera = false;
    let lastHoverCheck = 0;

    const canvasEl = renderer.domElement;
    canvasEl.style.touchAction = 'none';

    const handlePointerDown = (e: PointerEvent) => {
      isDraggingCamera = false;
      downX = e.clientX;
      downY = e.clientY;
    };

    const handlePointerMove = (e: PointerEvent) => {
      const dx = Math.abs(e.clientX - downX);
      const dy = Math.abs(e.clientY - downY);
      if (dx > 5 || dy > 5) {
        isDraggingCamera = true;
      }

      const now = performance.now();
      if (now - lastHoverCheck < 50) return;
      lastHoverCheck = now;

      const rect = canvasEl.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(pointer, camera);
      const intersects = raycaster.intersectObjects(clickableObjects, false);
      canvasEl.style.cursor = intersects.length > 0 ? 'pointer' : 'grab';
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (isDraggingCamera || e.button !== 0) return;
      const rect = canvasEl.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(pointer, camera);
      const intersects = raycaster.intersectObjects(clickableObjects, false);
      if (intersects.length > 0) {
        const bodyId = intersects[0].object.userData.bodyId as CelestialBodyId | undefined;
        if (bodyId) {
          canvasEl.style.cursor = '';
          onInteractRef.current(bodyId);
        }
      }
    };

    canvasEl.addEventListener('pointerdown', handlePointerDown);
    canvasEl.addEventListener('pointermove', handlePointerMove);
    canvasEl.addEventListener('pointerup', handlePointerUp);

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    };
    window.addEventListener('resize', handleResize);

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    const clock = new THREE.Clock();
    let frameId = 0;
    let disposed = false;

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync ? gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0) : null;
      gl.flush();
      if (!sync) {
        frameId = window.setTimeout(cb, 80);
        return;
      }
      const poll = () => {
        if (disposed) {
          gl.deleteSync(sync);
          return;
        }
        const state = gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    function tick() {
      if (disposed) return;

      const delta = Math.min(clock.getDelta(), 0.1);

      if (!pausedRef.current) {
        // Free-flight WASD / Arrow movement
        if (activeKeys.size > 0) {
          const flySpeed = Math.max(40, camera.position.distanceTo(controls.target) * 0.65) * delta;
          camera.getWorldDirection(_forward);
          _right.crossVectors(_forward, camera.up).normalize();
          _move.set(0, 0, 0);

          if (activeKeys.has('KeyW') || activeKeys.has('ArrowUp')) _move.add(_forward);
          if (activeKeys.has('KeyS') || activeKeys.has('ArrowDown')) _move.sub(_forward);
          if (activeKeys.has('KeyD') || activeKeys.has('ArrowRight')) _move.add(_right);
          if (activeKeys.has('KeyA') || activeKeys.has('ArrowLeft')) _move.sub(_right);
          if (activeKeys.has('KeyE') || activeKeys.has('Space')) _move.y += 1;
          if (activeKeys.has('KeyQ') || activeKeys.has('ShiftLeft')) _move.y -= 1;

          if (_move.lengthSq() > 0) {
            _move.normalize().multiplyScalar(flySpeed);
            camera.position.add(_move);
            controls.target.add(_move);
          }
        }

        sunMesh.rotation.y += delta * 0.12;
        sunGlowMesh.rotation.y -= delta * 0.06;

        for (let i = 0; i < orbitingBodies.length; i++) {
          const b = orbitingBodies[i];
          b.angle += b.speed * delta * 8.5;
          b.mesh.position.x = Math.cos(b.angle) * b.distance;
          b.mesh.position.z = Math.sin(b.angle) * b.distance;
          b.mesh.rotation.y += delta * 0.9;
        }

        controls.update();
        renderer.render(scene, camera);
      }

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    }

    tick();

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);

      window.removeEventListener('keydown', handleKeyDownFly);
      window.removeEventListener('keyup', handleKeyUpFly);
      canvasEl.removeEventListener('pointerdown', handlePointerDown);
      canvasEl.removeEventListener('pointermove', handlePointerMove);
      canvasEl.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('resize', handleResize);

      controls.dispose();
      disposables.forEach((item) => item.dispose());
      renderer.dispose();
      if (canvasEl.parentNode === container) {
        container.removeChild(canvasEl);
      }
    };
  }, []);

  return (
    <div
      className={`fixed inset-0 z-[500] bg-[#010206] touch-none ${paused ? 'pointer-events-none' : 'pointer-events-auto'}`}
      role="region"
      aria-label="Solar System"
    >
      <div ref={mountRef} className="absolute inset-0 w-full h-full touch-none" />

      <button
        type="button"
        onClick={onBack}
        className="fixed top-6 left-6 z-20 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/85 border border-white/15 text-slate-100 text-sm font-semibold hover:border-emerald-400/70 hover:text-emerald-300 transition-colors cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-emerald-400"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back</span>
      </button>
    </div>
  );
}

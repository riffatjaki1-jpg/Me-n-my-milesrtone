import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import type { CelestialBodyId } from './SolarSystemView';

const _targetPos = new THREE.Vector3();

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

function createEarthTextures(maxAnisotropy: number) {
  const W = 2048;
  const H = 1024;

  const dayCanvas = document.createElement('canvas');
  dayCanvas.width = W;
  dayCanvas.height = H;
  const dayCtx = dayCanvas.getContext('2d')!;

  const oceanGrad = dayCtx.createLinearGradient(0, 0, 0, H);
  oceanGrad.addColorStop(0, '#04162e');
  oceanGrad.addColorStop(0.35, '#07244a');
  oceanGrad.addColorStop(0.5, '#0c3566');
  oceanGrad.addColorStop(0.65, '#07244a');
  oceanGrad.addColorStop(1, '#031024');
  dayCtx.fillStyle = oceanGrad;
  dayCtx.fillRect(0, 0, W, H);

  function renderContinents(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.moveTo(W * 0.12, H * 0.18);
    ctx.bezierCurveTo(W * 0.22, H * 0.14, W * 0.3, H * 0.22, W * 0.32, H * 0.35);
    ctx.bezierCurveTo(W * 0.28, H * 0.44, W * 0.24, H * 0.46, W * 0.22, H * 0.5);
    ctx.bezierCurveTo(W * 0.16, H * 0.52, W * 0.14, H * 0.42, W * 0.11, H * 0.34);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(W * 0.33, H * 0.12);
    ctx.bezierCurveTo(W * 0.42, H * 0.1, W * 0.44, H * 0.24, W * 0.38, H * 0.26);
    ctx.bezierCurveTo(W * 0.34, H * 0.24, W * 0.32, H * 0.18, W * 0.33, H * 0.12);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(W * 0.45, H * 0.18);
    ctx.bezierCurveTo(W * 0.52, H * 0.16, W * 0.58, H * 0.22, W * 0.6, H * 0.32);
    ctx.bezierCurveTo(W * 0.54, H * 0.36, W * 0.46, H * 0.38, W * 0.44, H * 0.34);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.ellipse(W * 0.44, H * 0.25, 12, 20, -0.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(W * 0.44, H * 0.37);
    ctx.bezierCurveTo(W * 0.58, H * 0.38, W * 0.62, H * 0.45, W * 0.6, H * 0.64);
    ctx.bezierCurveTo(W * 0.54, H * 0.82, W * 0.48, H * 0.84, W * 0.44, H * 0.65);
    ctx.bezierCurveTo(W * 0.4, H * 0.5, W * 0.42, H * 0.4, W * 0.44, H * 0.37);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(W * 0.6, H * 0.2);
    ctx.bezierCurveTo(W * 0.8, H * 0.18, W * 0.88, H * 0.25, W * 0.9, H * 0.45);
    ctx.bezierCurveTo(W * 0.82, H * 0.58, W * 0.7, H * 0.52, W * 0.64, H * 0.42);
    ctx.bezierCurveTo(W * 0.58, H * 0.36, W * 0.58, H * 0.26, W * 0.6, H * 0.2);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.ellipse(W * 0.88, H * 0.34, 7, 22, 0.4, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(W * 0.22, H * 0.51);
    ctx.bezierCurveTo(W * 0.32, H * 0.54, W * 0.3, H * 0.76, W * 0.24, H * 0.86);
    ctx.bezierCurveTo(W * 0.2, H * 0.78, W * 0.19, H * 0.6, W * 0.22, H * 0.51);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.ellipse(W * 0.82, H * 0.7, 30, 21, 0.1, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.ellipse(W * 0.5, H * 0.96, W * 0.45, 30, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  dayCtx.shadowColor = '#00e5ff';
  dayCtx.shadowBlur = 16;
  dayCtx.fillStyle = '#0284c7';
  renderContinents(dayCtx);

  dayCtx.shadowColor = '#38bdf8';
  dayCtx.shadowBlur = 9;
  dayCtx.fillStyle = '#0ea5e9';
  renderContinents(dayCtx);
  dayCtx.shadowBlur = 0;

  const terrainGrad = dayCtx.createLinearGradient(0, 0, 0, H);
  terrainGrad.addColorStop(0, '#f8fafc');
  terrainGrad.addColorStop(0.18, '#1e3a24');
  terrainGrad.addColorStop(0.28, '#2a5a22');
  terrainGrad.addColorStop(0.38, '#b45309');
  terrainGrad.addColorStop(0.5, '#d97706');
  terrainGrad.addColorStop(0.72, '#22542a');
  terrainGrad.addColorStop(0.92, '#f8fafc');
  dayCtx.fillStyle = terrainGrad;
  renderContinents(dayCtx);

  dayCtx.fillStyle = '#ffffff';
  dayCtx.beginPath();
  dayCtx.moveTo(W * 0.34, H * 0.13);
  dayCtx.bezierCurveTo(W * 0.41, H * 0.11, W * 0.43, H * 0.23, W * 0.38, H * 0.25);
  dayCtx.bezierCurveTo(W * 0.35, H * 0.23, W * 0.33, H * 0.17, W * 0.34, H * 0.13);
  dayCtx.closePath();
  dayCtx.fill();

  for (let i = 0; i < 3000; i++) {
    const x = Math.random() * W;
    const y = Math.random() * H;
    const size = Math.random() * 2 + 1;
    dayCtx.fillStyle =
      Math.random() > 0.4 ? 'rgba(60, 35, 15, 0.45)' : 'rgba(255, 255, 255, 0.25)';
    dayCtx.fillRect(x, y, size, size);
  }

  const nightCanvas = document.createElement('canvas');
  nightCanvas.width = W;
  nightCanvas.height = H;
  const nightCtx = nightCanvas.getContext('2d')!;
  nightCtx.fillStyle = '#000000';
  nightCtx.fillRect(0, 0, W, H);

  const cities = [
    { x: 0.45, y: 0.26, rad: 25, count: 220, col: '#fef08a' },
    { x: 0.48, y: 0.32, rad: 22, count: 190, col: '#fde047' },
    { x: 0.25, y: 0.32, rad: 28, count: 240, col: '#fed7aa' },
    { x: 0.14, y: 0.35, rad: 20, count: 160, col: '#fef08a' },
    { x: 0.21, y: 0.34, rad: 18, count: 130, col: '#fde047' },
    { x: 0.88, y: 0.34, rad: 25, count: 225, col: '#6ee7b7' },
    { x: 0.82, y: 0.38, rad: 28, count: 230, col: '#fef08a' },
    { x: 0.74, y: 0.52, rad: 22, count: 175, col: '#34d399' },
    { x: 0.7, y: 0.42, rad: 25, count: 200, col: '#fde047' },
    { x: 0.58, y: 0.36, rad: 20, count: 140, col: '#fed7aa' },
    { x: 0.52, y: 0.38, rad: 18, count: 100, col: '#fef08a' },
    { x: 0.28, y: 0.68, rad: 21, count: 150, col: '#fde047' },
  ];

  cities.forEach((c) => {
    const cx = c.x * W;
    const cy = c.y * H;
    const glow = nightCtx.createRadialGradient(cx, cy, 1, cx, cy, c.rad);
    glow.addColorStop(0, c.col);
    glow.addColorStop(0.35, 'rgba(254, 240, 138, 0.4)');
    glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    nightCtx.fillStyle = glow;
    nightCtx.beginPath();
    nightCtx.arc(cx, cy, c.rad, 0, Math.PI * 2);
    nightCtx.fill();

    for (let j = 0; j < c.count; j++) {
      const r = Math.pow(Math.random(), 1.7) * c.rad;
      const theta = Math.random() * Math.PI * 2;
      const px = cx + Math.cos(theta) * r;
      const py = cy + Math.sin(theta) * r;
      nightCtx.fillStyle = Math.random() > 0.25 ? c.col : '#ffffff';
      nightCtx.fillRect(px, py, Math.random() * 1.6 + 0.5, Math.random() * 1.6 + 0.5);
    }
  });

  const cloudCanvas = document.createElement('canvas');
  cloudCanvas.width = W;
  cloudCanvas.height = H;
  const cloudCtx = cloudCanvas.getContext('2d')!;
  cloudCtx.clearRect(0, 0, W, H);

  for (let i = 0; i < 320; i++) {
    const cx = Math.random() * W;
    const cy = (Math.random() * 0.7 + 0.15) * H;
    const rx = Math.random() * 65 + 20;
    const ry = Math.random() * 18 + 6;
    const grad = cloudCtx.createRadialGradient(cx, cy, 0, cx, cy, rx);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.36)');
    grad.addColorStop(0.5, 'rgba(240, 248, 255, 0.16)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    cloudCtx.fillStyle = grad;
    cloudCtx.beginPath();
    cloudCtx.ellipse(cx, cy, rx, ry, (Math.random() - 0.5) * 0.35, 0, Math.PI * 2);
    cloudCtx.fill();
  }

  function drawCyclone(ctx: CanvasRenderingContext2D, sx: number, sy: number, radius: number) {
    ctx.save();
    ctx.translate(sx, sy);
    for (let a = 0; a < Math.PI * 5; a += 0.08) {
      const r = (a / (Math.PI * 5)) * radius;
      const x = Math.cos(a) * r;
      const y = Math.sin(a) * r * 0.65;
      ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0, 0.42 - a * 0.025)})`;
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
  drawCyclone(cloudCtx, W * 0.36, H * 0.28, 45);
  drawCyclone(cloudCtx, W * 0.76, H * 0.36, 55);
  drawCyclone(cloudCtx, W * 0.2, H * 0.64, 40);

  const dayTex = new THREE.CanvasTexture(dayCanvas);
  const nightTex = new THREE.CanvasTexture(nightCanvas);
  const cloudTex = new THREE.CanvasTexture(cloudCanvas);

  dayTex.colorSpace = THREE.SRGBColorSpace;
  nightTex.colorSpace = THREE.SRGBColorSpace;
  cloudTex.colorSpace = THREE.SRGBColorSpace;

  dayTex.anisotropy = maxAnisotropy;
  nightTex.anisotropy = maxAnisotropy;
  cloudTex.anisotropy = maxAnisotropy;

  dayTex.wrapS = dayTex.wrapT = THREE.RepeatWrapping;
  nightTex.wrapS = nightTex.wrapT = THREE.RepeatWrapping;
  cloudTex.wrapS = cloudTex.wrapT = THREE.RepeatWrapping;

  return { dayTex, nightTex, cloudTex };
}

function createBodySurfaceTexture(bodyId: CelestialBodyId, maxAnisotropy: number) {
  const W = 2048;
  const H = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  const drawCraters = (count: number, darkCol: string, rimCol: string, maxR: number) => {
    for (let i = 0; i < count; i++) {
      const x = Math.random() * W;
      const y = Math.random() * H;
      const r = Math.random() * maxR + 4;
      ctx.fillStyle = darkCol;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = rimCol;
      ctx.lineWidth = Math.max(1, r * 0.14);
      ctx.beginPath();
      ctx.arc(x - r * 0.08, y - r * 0.08, r * 0.92, 0, Math.PI * 2);
      ctx.stroke();
    }
  };

  switch (bodyId) {
    case 'sun': {
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, '#ff8f00');
      grad.addColorStop(0.5, '#ffca28');
      grad.addColorStop(1, '#ff6f00');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
      for (let i = 0; i < 6500; i++) {
        const x = Math.random() * W;
        const y = Math.random() * H;
        const r = Math.random() * 14 + 2;
        ctx.fillStyle =
          Math.random() > 0.45 ? 'rgba(255, 245, 180, 0.32)' : 'rgba(230, 70, 0, 0.28)';
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }
    case 'mercury': {
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, '#71717a');
      grad.addColorStop(0.5, '#a1a1aa');
      grad.addColorStop(1, '#52525b');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
      drawCraters(450, 'rgba(63, 63, 70, 0.55)', 'rgba(228, 228, 231, 0.35)', 36);
      break;
    }
    case 'venus': {
      for (let y = 0; y < H; y++) {
        const swirl = Math.sin(y * 0.02) * 0.5 + Math.cos(y * 0.055) * 0.5;
        ctx.fillStyle = swirl > 0.2 ? '#f59e0b' : swirl > -0.3 ? '#d97706' : '#b45309';
        ctx.fillRect(0, y, W, 1);
      }
      for (let i = 0; i < 240; i++) {
        const x = Math.random() * W;
        const y = Math.random() * H;
        const rx = Math.random() * 180 + 50;
        const ry = Math.random() * 24 + 8;
        const g = ctx.createRadialGradient(x, y, 0, x, y, rx);
        g.addColorStop(0, 'rgba(254, 243, 199, 0.32)');
        g.addColorStop(1, 'rgba(245, 158, 11, 0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.ellipse(x, y, rx, ry, (Math.random() - 0.5) * 0.2, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }
    case 'mars': {
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, '#f8fafc');
      grad.addColorStop(0.08, '#9a3412');
      grad.addColorStop(0.5, '#dc2626');
      grad.addColorStop(0.92, '#7c2d12');
      grad.addColorStop(1, '#f8fafc');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
      // Dark basaltic regions
      for (let i = 0; i < 80; i++) {
        const x = Math.random() * W;
        const y = H * 0.15 + Math.random() * H * 0.7;
        const rx = Math.random() * 160 + 40;
        const ry = Math.random() * 80 + 25;
        ctx.fillStyle = 'rgba(69, 10, 10, 0.38)';
        ctx.beginPath();
        ctx.ellipse(x, y, rx, ry, Math.random() * Math.PI, 0, Math.PI * 2);
        ctx.fill();
      }
      drawCraters(220, 'rgba(127, 29, 29, 0.45)', 'rgba(254, 202, 202, 0.2)', 26);
      break;
    }
    case 'ceres': {
      ctx.fillStyle = '#6b7280';
      ctx.fillRect(0, 0, W, H);
      drawCraters(380, 'rgba(55, 65, 81, 0.6)', 'rgba(209, 213, 219, 0.35)', 30);
      // Occator bright salt faculae
      const bx = W * 0.58;
      const by = H * 0.42;
      const g = ctx.createRadialGradient(bx, by, 2, bx, by, 38);
      g.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
      g.addColorStop(0.4, 'rgba(229, 231, 235, 0.5)');
      g.addColorStop(1, 'rgba(107, 114, 128, 0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(bx, by, 38, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'jupiter': {
      for (let y = 0; y < H; y++) {
        const band =
          Math.sin(y * 0.032) * 0.5 + Math.cos(y * 0.075) * 0.35 + Math.sin(y * 0.14) * 0.15;
        if (band > 0.45) ctx.fillStyle = '#fef3c7';
        else if (band > 0.1) ctx.fillStyle = '#d97706';
        else if (band > -0.25) ctx.fillStyle = '#b45309';
        else ctx.fillStyle = '#92400e';
        ctx.fillRect(0, y, W, 1);
      }
      // Great Red Spot
      const grs = ctx.createRadialGradient(W * 0.62, H * 0.63, 10, W * 0.62, H * 0.63, 120);
      grs.addColorStop(0, '#991b1b');
      grs.addColorStop(0.65, '#dc2626');
      grs.addColorStop(1, 'rgba(217, 119, 6, 0)');
      ctx.fillStyle = grs;
      ctx.beginPath();
      ctx.ellipse(W * 0.62, H * 0.63, 120, 68, 0, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'saturn': {
      for (let y = 0; y < H; y++) {
        const n = Math.sin(y * 0.025) * 0.6 + Math.cos(y * 0.06) * 0.4;
        if (n > 0.35) ctx.fillStyle = '#fef08a';
        else if (n > -0.1) ctx.fillStyle = '#e2c595';
        else ctx.fillStyle = '#c9a873';
        ctx.fillRect(0, y, W, 1);
      }
      break;
    }
    case 'uranus': {
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, '#a5f3fc');
      grad.addColorStop(0.5, '#22d3ee');
      grad.addColorStop(1, '#0891b2');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
      for (let y = 0; y < H; y += 6) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
        ctx.fillRect(0, y, W, 2);
      }
      break;
    }
    case 'neptune': {
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, '#1d4ed8');
      grad.addColorStop(0.5, '#2563eb');
      grad.addColorStop(1, '#1e3a8a');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
      // Great Dark Spot
      ctx.fillStyle = 'rgba(15, 23, 42, 0.6)';
      ctx.beginPath();
      ctx.ellipse(W * 0.48, H * 0.58, 95, 52, 0, 0, Math.PI * 2);
      ctx.fill();
      // Methane cirrus streaks
      for (let i = 0; i < 45; i++) {
        ctx.fillStyle = 'rgba(224, 242, 254, 0.35)';
        ctx.fillRect(Math.random() * W, Math.random() * H, Math.random() * 140 + 40, 3);
      }
      break;
    }
    case 'pluto': {
      ctx.fillStyle = '#b08968';
      ctx.fillRect(0, 0, W, H);
      // Dark reddish tholin regions
      for (let i = 0; i < 65; i++) {
        ctx.fillStyle = 'rgba(120, 53, 15, 0.45)';
        ctx.beginPath();
        ctx.ellipse(
          Math.random() * W,
          Math.random() * H,
          Math.random() * 130 + 30,
          Math.random() * 70 + 20,
          0,
          0,
          Math.PI * 2,
        );
        ctx.fill();
      }
      // Sputnik Planitia bright nitrogen plain
      ctx.fillStyle = '#f5ebe0';
      ctx.beginPath();
      ctx.ellipse(W * 0.52, H * 0.52, 160, 120, -0.15, 0, Math.PI * 2);
      ctx.fill();
      drawCraters(160, 'rgba(92, 61, 46, 0.35)', 'rgba(245, 235, 224, 0.2)', 22);
      break;
    }
    case 'haumea': {
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = 'rgba(148, 163, 184, 0.45)';
      ctx.beginPath();
      ctx.ellipse(W * 0.42, H * 0.48, 180, 110, 0.2, 0, Math.PI * 2);
      ctx.fill();
      drawCraters(140, 'rgba(100, 116, 139, 0.3)', 'rgba(255, 255, 255, 0.5)', 20);
      break;
    }
    case 'makemake': {
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, '#fed7aa');
      grad.addColorStop(0.5, '#ea580c');
      grad.addColorStop(1, '#c2410c');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
      drawCraters(200, 'rgba(124, 45, 18, 0.4)', 'rgba(255, 237, 213, 0.3)', 26);
      break;
    }
    case 'eris': {
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.5, '#e2e8f0');
      grad.addColorStop(1, '#cbd5e1');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
      drawCraters(180, 'rgba(148, 163, 184, 0.4)', 'rgba(255, 255, 255, 0.6)', 24);
      break;
    }
    default:
      break;
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = maxAnisotropy;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

function createPlanetaryRingTexture(bodyId: CelestialBodyId, maxAnisotropy: number) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 32;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createLinearGradient(0, 0, 512, 0);

  if (bodyId === 'uranus') {
    grad.addColorStop(0.0, 'rgba(0,0,0,0)');
    grad.addColorStop(0.25, 'rgba(103, 232, 249, 0.35)');
    grad.addColorStop(0.5, 'rgba(34, 211, 238, 0.15)');
    grad.addColorStop(0.75, 'rgba(165, 243, 252, 0.45)');
    grad.addColorStop(1.0, 'rgba(0,0,0,0)');
  } else if (bodyId === 'haumea') {
    grad.addColorStop(0.0, 'rgba(0,0,0,0)');
    grad.addColorStop(0.35, 'rgba(226, 232, 240, 0.45)');
    grad.addColorStop(0.65, 'rgba(248, 250, 252, 0.45)');
    grad.addColorStop(1.0, 'rgba(0,0,0,0)');
  } else {
    grad.addColorStop(0.0, 'rgba(0,0,0,0)');
    grad.addColorStop(0.1, 'rgba(180, 160, 130, 0.4)');
    grad.addColorStop(0.35, 'rgba(215, 195, 160, 0.85)');
    grad.addColorStop(0.5, 'rgba(30, 20, 10, 0.12)');
    grad.addColorStop(0.65, 'rgba(200, 180, 150, 0.9)');
    grad.addColorStop(0.9, 'rgba(160, 140, 115, 0.5)');
    grad.addColorStop(1.0, 'rgba(0,0,0,0)');
  }

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 32);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;
  return tex;
}

function getAtmosphereColors(bodyId: CelestialBodyId): [THREE.Color, THREE.Color] {
  switch (bodyId) {
    case 'sun':
      return [new THREE.Color('#ff8f00'), new THREE.Color('#fde047')];
    case 'mercury':
      return [new THREE.Color('#52525b'), new THREE.Color('#d4d4d8')];
    case 'venus':
      return [new THREE.Color('#d97706'), new THREE.Color('#fde68a')];
    case 'mars':
      return [new THREE.Color('#dc2626'), new THREE.Color('#fca5a5')];
    case 'ceres':
      return [new THREE.Color('#4b5563'), new THREE.Color('#d1d5db')];
    case 'jupiter':
      return [new THREE.Color('#d97706'), new THREE.Color('#fed7aa')];
    case 'saturn':
      return [new THREE.Color('#ca8a04'), new THREE.Color('#fef08a')];
    case 'uranus':
      return [new THREE.Color('#0891b2'), new THREE.Color('#a5f3fc')];
    case 'neptune':
      return [new THREE.Color('#1d4ed8'), new THREE.Color('#60a5fa')];
    case 'pluto':
      return [new THREE.Color('#78350f'), new THREE.Color('#fde68a')];
    case 'haumea':
      return [new THREE.Color('#64748b'), new THREE.Color('#f1f5f9')];
    case 'makemake':
      return [new THREE.Color('#c2410c'), new THREE.Color('#fed7aa')];
    case 'eris':
      return [new THREE.Color('#94a3b8'), new THREE.Color('#f8fafc')];
    case 'earth':
    default:
      return [new THREE.Color(0.06, 0.72, 0.51), new THREE.Color(0.43, 0.91, 0.72)];
  }
}

export function EarthCanvas({
  paused,
  bodyId = 'earth',
}: {
  paused: boolean;
  bodyId?: CelestialBodyId;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const dragOverlayRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(paused);
  pausedRef.current = paused;

  const sceneApiRef = useRef<{
    applyBody: (nextBodyId: CelestialBodyId) => void;
  } | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    const dragOverlay = dragOverlayRef.current;
    if (!container || !dragOverlay) return;

    const isSoftwareGl = detectSoftwareGl();

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      42,
      window.innerWidth / window.innerHeight,
      0.1,
      100,
    );
    camera.position.set(0, 0, 5.8);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.18;
    container.appendChild(renderer.domElement);

    const earthGroup = new THREE.Group();
    scene.add(earthGroup);

    const sunLight = new THREE.DirectionalLight(0xffffff, 2.6);
    sunLight.position.set(-6, 4, 5.5);
    scene.add(sunLight);

    const spaceAmbient = new THREE.AmbientLight(0x061124, 0.45);
    scene.add(spaceAmbient);

    const mintRim = new THREE.DirectionalLight(0x34d399, 0.8);
    mintRim.position.set(5, -2, -3);
    scene.add(mintRim);

    const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();
    const bodyRadius = 2.0;
    const bodyGeo = new THREE.SphereGeometry(bodyRadius, 72, 72);
    const bodyMesh = new THREE.Mesh(bodyGeo);
    earthGroup.add(bodyMesh);

    const cloudsGeo = new THREE.SphereGeometry(bodyRadius * 1.018, 72, 72);
    const cloudsMesh = new THREE.Mesh(cloudsGeo);
    earthGroup.add(cloudsMesh);

    const atmosGeo = new THREE.SphereGeometry(bodyRadius * 1.055, 72, 72);
    const atmosMat = new THREE.ShaderMaterial({
      uniforms: {
        uColorInner: { value: new THREE.Color(0.06, 0.72, 0.51) },
        uColorOuter: { value: new THREE.Color(0.43, 0.91, 0.72) },
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vWorldPos;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vec4 worldPos = modelMatrix * vec4(position, 1.0);
          vWorldPos = worldPos.xyz;
          gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
      `,
      fragmentShader: `
        uniform vec3 uColorInner;
        uniform vec3 uColorOuter;
        varying vec3 vNormal;
        varying vec3 vWorldPos;
        void main() {
          vec3 viewDir = normalize(cameraPosition - vWorldPos);
          float fresnel = 1.0 - dot(vNormal, viewDir);
          float intensity = pow(fresnel, 3.2);
          vec3 rimColor = mix(uColorInner, uColorOuter, intensity);
          gl_FragColor = vec4(rimColor, intensity * 0.9);
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
    });
    const atmosMesh = new THREE.Mesh(atmosGeo, atmosMat);
    earthGroup.add(atmosMesh);

    // Optional Ring Mesh for Saturn, Uranus, Haumea
    let activeRingMesh: THREE.Mesh | null = null;
    let activeDisposables: Array<{ dispose: () => void }> = [];
    let earthShaderMat: THREE.ShaderMaterial | null = null;

    const clearBodyAssets = () => {
      if (activeRingMesh) {
        earthGroup.remove(activeRingMesh);
        activeRingMesh = null;
      }
      activeDisposables.forEach((d) => d.dispose());
      activeDisposables = [];
      earthShaderMat = null;
    };

    let currentScroll = 0;
    let targetScroll = 0;
    let manualRotX = 0;
    let manualRotY = 0;

    const applyBody = (nextBodyId: CelestialBodyId) => {
      clearBodyAssets();
      manualRotX = 0;
      manualRotY = 0;
      currentScroll = 0;
      targetScroll = 0;

      const [innerCol, outerCol] = getAtmosphereColors(nextBodyId);
      atmosMat.uniforms.uColorInner.value.copy(innerCol);
      atmosMat.uniforms.uColorOuter.value.copy(outerCol);
      mintRim.color.copy(outerCol);

      // Haumea subtle ellipsoid proportions
      if (nextBodyId === 'haumea') {
        bodyMesh.scale.set(1.22, 0.92, 0.84);
        atmosMesh.scale.set(1.22, 0.92, 0.84);
      } else {
        bodyMesh.scale.set(1, 1, 1);
        atmosMesh.scale.set(1, 1, 1);
      }

      if (nextBodyId === 'earth') {
        const { dayTex, nightTex, cloudTex } = createEarthTextures(maxAnisotropy);
        earthShaderMat = new THREE.ShaderMaterial({
          uniforms: {
            uDayMap: { value: dayTex },
            uNightMap: { value: nightTex },
            uSunDirection: { value: sunLight.position.clone().normalize() },
            uTime: { value: 0 },
          },
          vertexShader: `
            varying vec3 vNormal;
            varying vec2 vUv;
            varying vec3 vWorldPos;

            void main() {
              vNormal = normalize(normalMatrix * normal);
              vUv = uv;
              vec4 worldPos = modelMatrix * vec4(position, 1.0);
              vWorldPos = worldPos.xyz;
              gl_Position = projectionMatrix * viewMatrix * worldPos;
            }
          `,
          fragmentShader: `
            uniform sampler2D uDayMap;
            uniform sampler2D uNightMap;
            uniform vec3 uSunDirection;
            uniform float uTime;

            varying vec3 vNormal;
            varying vec2 vUv;
            varying vec3 vWorldPos;

            void main() {
              vec3 normal = normalize(vNormal);
              vec3 sunDir = normalize(uSunDirection);
              vec3 viewDir = normalize(cameraPosition - vWorldPos);

              float NdotL = dot(normal, sunDir);
              float dayWeight = smoothstep(-0.16, 0.24, NdotL);

              vec3 dayColor = texture2D(uDayMap, vUv).rgb;
              vec3 nightColor = texture2D(uNightMap, vUv).rgb;

              float shimmer = sin(vUv.x * 240.0 + uTime * 3.5) * sin(vUv.y * 240.0 + uTime * 2.8);
              nightColor += nightColor * shimmer * 0.18;

              vec3 reflectDir = reflect(-sunDir, normal);
              float specFactor = pow(max(dot(viewDir, reflectDir), 0.0), 28.0);
              float isOcean = step(0.12, dayColor.b - dayColor.r * 0.7);
              vec3 specular = vec3(0.5, 0.85, 1.0) * specFactor * isOcean * 0.85;

              float sunset = (1.0 - abs(NdotL)) * max(0.0, NdotL + 0.35);
              vec3 sunsetGlow = vec3(0.9, 0.48, 0.2) * pow(sunset, 5.0) * 0.75;

              vec3 finalColor = mix(nightColor * 1.85, dayColor, dayWeight);
              finalColor += specular * dayWeight;
              finalColor += sunsetGlow;

              gl_FragColor = vec4(finalColor, 1.0);
            }
          `,
        });

        const cloudsMat = new THREE.MeshStandardMaterial({
          map: cloudTex,
          transparent: true,
          opacity: 0.6,
          blending: THREE.NormalBlending,
          roughness: 1.0,
        });

        bodyMesh.material = earthShaderMat;
        cloudsMesh.material = cloudsMat;
        cloudsMesh.visible = true;

        activeDisposables.push(dayTex, nightTex, cloudTex, earthShaderMat, cloudsMat);
      } else {
        cloudsMesh.visible = false;
        const bodyTex = createBodySurfaceTexture(nextBodyId, maxAnisotropy);
        const bodyMat =
          nextBodyId === 'sun'
            ? new THREE.MeshBasicMaterial({ map: bodyTex })
            : new THREE.MeshStandardMaterial({
                map: bodyTex,
                roughness: nextBodyId === 'jupiter' || nextBodyId === 'saturn' ? 0.55 : 0.72,
                metalness: 0.06,
              });

        bodyMesh.material = bodyMat;
        activeDisposables.push(bodyTex, bodyMat);

        if (nextBodyId === 'saturn' || nextBodyId === 'uranus' || nextBodyId === 'haumea') {
          const innerR = nextBodyId === 'saturn' ? 2.65 : nextBodyId === 'uranus' ? 2.5 : 2.6;
          const outerR = nextBodyId === 'saturn' ? 4.4 : nextBodyId === 'uranus' ? 3.5 : 3.4;
          const ringGeo = new THREE.RingGeometry(innerR, outerR, 96);
          const ringTex = createPlanetaryRingTexture(nextBodyId, maxAnisotropy);
          const ringMat = new THREE.MeshBasicMaterial({
            map: ringTex,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: nextBodyId === 'saturn' ? 0.92 : 0.65,
          });
          activeRingMesh = new THREE.Mesh(ringGeo, ringMat);
          activeRingMesh.rotation.x = Math.PI / 2 + 0.25;
          activeRingMesh.rotation.y = nextBodyId === 'uranus' ? 0.85 : 0.12;
          earthGroup.add(activeRingMesh);
          activeDisposables.push(ringGeo, ringTex, ringMat);
        }
      }
    };

    sceneApiRef.current = { applyBody };
    applyBody(bodyId);

    // Starfield
    const starGeo = new THREE.BufferGeometry();
    const starCount = 1800;
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      const r = 35 + Math.random() * 45;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      starPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      starPositions[i * 3 + 1] = r * Math.cos(phi);
      starPositions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);

      const type = Math.random();
      if (type > 0.85) {
        starColors[i * 3] = 0.4;
        starColors[i * 3 + 1] = 0.95;
        starColors[i * 3 + 2] = 0.75;
      } else if (type > 0.65) {
        starColors[i * 3] = 0.8;
        starColors[i * 3 + 1] = 0.85;
        starColors[i * 3 + 2] = 1.0;
      } else {
        starColors[i * 3] = 0.95;
        starColors[i * 3 + 1] = 0.95;
        starColors[i * 3 + 2] = 1.0;
      }
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

    const starMat = new THREE.PointsMaterial({
      size: 0.15,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });
    const starField = new THREE.Points(starGeo, starMat);
    scene.add(starField);

    const motionKeyframes = [
      {
        scroll: 0.0,
        pos: new THREE.Vector3(0.0, -2.4, 1.45),
        rot: new THREE.Euler(0.58, -1.25, 0.0),
      },
      {
        scroll: 0.35,
        pos: new THREE.Vector3(-1.95, 0.1, 1.05),
        rot: new THREE.Euler(0.24, -0.32, -0.05),
      },
      {
        scroll: 0.7,
        pos: new THREE.Vector3(1.85, 0.25, 0.85),
        rot: new THREE.Euler(0.12, 1.18, 0.05),
      },
      {
        scroll: 1.0,
        pos: new THREE.Vector3(1.35, 0.45, 0.35),
        rot: new THREE.Euler(0.08, 2.15, 0.0),
      },
    ];

    const handleScroll = () => {
      const scrollY = window.scrollY || window.pageYOffset;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      targetScroll = Math.max(0, Math.min(1, scrollY / (docHeight || 1)));
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;

    const handleMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };
    const handleMouseUp = () => {
      isDragging = false;
    };
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
      manualRotY += deltaX * 0.005;
      manualRotX += deltaY * 0.005;
    };
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDragging = true;
        prevMouseX = e.touches[0].clientX;
        prevMouseY = e.touches[0].clientY;
      }
    };
    const handleTouchEnd = () => {
      isDragging = false;
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - prevMouseX;
      const deltaY = e.touches[0].clientY - prevMouseY;
      prevMouseX = e.touches[0].clientX;
      prevMouseY = e.touches[0].clientY;
      manualRotY += deltaX * 0.005;
      manualRotX += deltaY * 0.005;
    };

    dragOverlay.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousemove', handleMouseMove);
    dragOverlay.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

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
      const elapsedTime = clock.getElapsedTime();

      if (!pausedRef.current) {
        bodyMesh.rotation.y += delta * 0.035;
        if (cloudsMesh.visible) {
          cloudsMesh.rotation.y += delta * 0.048;
        }
        if (earthShaderMat) {
          earthShaderMat.uniforms.uTime.value = elapsedTime;
        }

        currentScroll += (targetScroll - currentScroll) * Math.min(1, delta * 6.0);

        let k1 = motionKeyframes[0];
        let k2 = motionKeyframes[1];
        for (let i = 0; i < motionKeyframes.length - 1; i++) {
          if (currentScroll >= motionKeyframes[i].scroll && currentScroll <= motionKeyframes[i + 1].scroll) {
            k1 = motionKeyframes[i];
            k2 = motionKeyframes[i + 1];
            break;
          }
        }
        const segmentSpan = k2.scroll - k1.scroll;
        const t = segmentSpan > 0 ? (currentScroll - k1.scroll) / segmentSpan : 0;
        const easedT = t * t * (3 - 2 * t);

        _targetPos.lerpVectors(k1.pos, k2.pos, easedT);
        if (window.innerWidth < 1024) {
          _targetPos.x *= 0.4;
          _targetPos.y += 0.3;
        }

        earthGroup.position.lerp(_targetPos, Math.min(1, delta * 6.0));

        const targetRotX = THREE.MathUtils.lerp(k1.rot.x, k2.rot.x, easedT) + manualRotX;
        const targetRotY = THREE.MathUtils.lerp(k1.rot.y, k2.rot.y, easedT) + manualRotY;
        const targetRotZ = THREE.MathUtils.lerp(k1.rot.z, k2.rot.z, easedT);

        earthGroup.rotation.x = THREE.MathUtils.lerp(
          earthGroup.rotation.x,
          targetRotX,
          Math.min(1, delta * 6.0),
        );
        earthGroup.rotation.y = THREE.MathUtils.lerp(
          earthGroup.rotation.y,
          targetRotY,
          Math.min(1, delta * 6.0),
        );
        earthGroup.rotation.z = THREE.MathUtils.lerp(
          earthGroup.rotation.z,
          targetRotZ,
          Math.min(1, delta * 6.0),
        );

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
      sceneApiRef.current = null;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);

      window.removeEventListener('scroll', handleScroll);
      dragOverlay.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
      dragOverlay.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('resize', handleResize);

      clearBodyAssets();
      bodyGeo.dispose();
      cloudsGeo.dispose();
      atmosGeo.dispose();
      atmosMat.dispose();
      starGeo.dispose();
      starMat.dispose();

      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  useEffect(() => {
    sceneApiRef.current?.applyBody(bodyId);
  }, [bodyId]);

  return (
    <>
      <div
        ref={containerRef}
        className="fixed inset-0 w-screen h-screen z-[1] pointer-events-none"
      />
      <div
        ref={dragOverlayRef}
        className="fixed inset-0 z-[2] pointer-events-auto cursor-grab active:cursor-grabbing"
        title="Drag to rotate"
      />
      <div
        className="fixed inset-0 z-[3] pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 35%, rgba(3, 5, 12, 0.65) 100%)',
        }}
      />
    </>
  );
}

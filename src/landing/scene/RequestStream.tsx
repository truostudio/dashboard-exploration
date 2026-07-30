import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import {
  sceneBrand,
  sceneDim,
  sceneInk,
  scenePlate,
  watchSceneTheme,
  type SceneTheme,
} from './sceneTheme';

/**
 * The signature artifact: a CRT routing volume.
 *
 * Same product story throughout — one endpoint, scored provider lanes, hedges —
 * materialised as a 3D lattice of phosphor cells. Packets light the volume as
 * they travel. Bayer dither resolves the render to the same 1-bit field the
 * rest of the product speaks.
 *
 * Scroll presence: full in the hero, then off. Mid-page and footer keep their
 * own plates; the cone does not reconstitute under the closing band.
 */

const LANES = 9;
const MAX = 72;
const TRAIL = 5;

type Packet = {
  lane: number;
  t: number;
  speed: number;
  ghost: boolean;
  dead: boolean;
};

function laneEnd(i: number) {
  const spread = (i / (LANES - 1)) * 2 - 1;
  return new THREE.Vector3(2.55, spread * 1.35, spread * 0.7);
}

function alongLane(
  entry: THREE.Vector3,
  end: THREE.Vector3,
  u: number,
  out: THREE.Vector3,
) {
  const k = Math.min(1, Math.max(0, u));
  const inv = 1 - k;
  const cx = 0.15;
  const cy = end.y * 0.12;
  const cz = end.z * 0.12;
  return out.set(
    inv * inv * entry.x + 2 * inv * k * cx + k * k * end.x,
    inv * inv * entry.y + 2 * inv * k * cy + k * k * end.y,
    inv * inv * entry.z + 2 * inv * k * cz + k * k * end.z,
  );
}

export function RequestStream() {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = host.current;
    if (!el) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false });
    } catch {
      return;
    }

    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    // Cap DPR — full 2× on a full-viewport double-pass is the main GPU cost.
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    renderer.setPixelRatio(dpr);
    renderer.setSize(el.clientWidth, el.clientHeight);
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, el.clientWidth / el.clientHeight, 0.1, 100);

    // ---- Dither pass -------------------------------------------------------
    const CELL = 3;
    const rt = new THREE.WebGLRenderTarget(1, 1, {
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
    });
    const postScene = new THREE.Scene();
    const postCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const postMat = new THREE.ShaderMaterial({
      transparent: true,
      uniforms: {
        tScene: { value: rt.texture },
        uRes: { value: new THREE.Vector2(1, 1) },
        uCell: { value: CELL },
        uFade: { value: 1 },
        uClear: { value: 0 },
        uNarrow: { value: 0 },
        uLight: { value: 0 },
        uInk: { value: new THREE.Color() },
        uBrand: { value: new THREE.Color() },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = vec4(position.xy, 0.0, 1.0);
        }`,
      fragmentShader: `
        uniform sampler2D tScene;
        uniform vec2 uRes;
        uniform float uCell;
        uniform float uFade;
        uniform float uClear;
        uniform float uNarrow;
        uniform float uLight;
        uniform vec3 uInk;
        uniform vec3 uBrand;
        varying vec2 vUv;

        float bayer(vec2 p) {
          int x = int(mod(p.x, 8.0));
          int y = int(mod(p.y, 8.0));
          int i = y * 8 + x;
          int m[64];
          m[0]=0;   m[1]=32;  m[2]=8;   m[3]=40;  m[4]=2;   m[5]=34;  m[6]=10;  m[7]=42;
          m[8]=48;  m[9]=16;  m[10]=56; m[11]=24; m[12]=50; m[13]=18; m[14]=58; m[15]=26;
          m[16]=12; m[17]=44; m[18]=4;  m[19]=36; m[20]=14; m[21]=46; m[22]=6;  m[23]=38;
          m[24]=60; m[25]=28; m[26]=52; m[27]=20; m[28]=62; m[29]=30; m[30]=54; m[31]=22;
          m[32]=3;  m[33]=35; m[34]=11; m[35]=43; m[36]=1;  m[37]=33; m[38]=9;  m[39]=41;
          m[40]=51; m[41]=19; m[42]=59; m[43]=27; m[44]=49; m[45]=17; m[46]=57; m[47]=25;
          m[48]=15; m[49]=47; m[50]=7;  m[51]=39; m[52]=13; m[53]=45; m[54]=5;  m[55]=37;
          m[56]=63; m[57]=31; m[58]=55; m[59]=23; m[60]=61; m[61]=29; m[62]=53; m[63]=21;
          for (int k = 0; k < 64; k++) { if (k == i) return (float(m[k]) + 0.5) / 64.0; }
          return 0.5;
        }

        void main() {
          vec2 cell = floor(gl_FragCoord.xy / uCell);
          vec2 uv = (cell * uCell + uCell * 0.5) / uRes;
          vec4 s = texture2D(tScene, uv);

          float lum = max(max(s.r, s.g), s.b) * s.a;
          float ramp = pow(clamp(lum * 4.6, 0.0, 1.0), 0.58) * uFade;

          // Hero: clear the left reading column so type stays sharp; the cone
          // still owns the right and can graze the end of the headline.
          float heroClear = smoothstep(0.34, 0.58, vUv.x);
          float heroFloor = smoothstep(0.0, 0.2, vUv.y);
          heroClear *= mix(0.2, 1.0, heroFloor);
          // Narrow: type spans the whole measure, so a left/right split leaves
          // the cone nowhere to go. Turn the split horizontal instead — the
          // network takes the open space above the headline.
          float heroTop = smoothstep(0.4, 0.68, vUv.y);
          heroClear = mix(heroClear, heroTop, uNarrow);
          // Footer mini-hero: same left clear as the opening — the volume
          // reconstitutes on the right, beside the type.
          float footClear = smoothstep(0.3, 0.56, vUv.x);
          float footFloor = smoothstep(0.0, 0.16, vUv.y);
          footClear *= mix(0.25, 1.0, footFloor);
          float footMode = smoothstep(0.0, 0.18, uClear);
          ramp *= mix(heroClear, footClear, footMode);
          ramp *= mix(smoothstep(0.0, 0.1, vUv.y), 1.0, footMode);
          if (ramp < bayer(cell)) discard;

          // Dark: phosphor cells are luminance-normalized (bright).
          // Light: binary stamp — grey path vs --ub-blue (no mid mixes).
          if (uLight > 0.5) {
            // Grey path is near-achromatic; brand cyan has clear chroma + blue≥green.
            float mx = max(max(s.r, s.g), s.b);
            float mn = min(min(s.r, s.g), s.b);
            float isBrand = step(0.06, mx - mn) * step(s.g * 0.92, s.b);
            gl_FragColor = vec4(mix(uInk, uBrand, isBrand), 1.0);
          } else {
            vec3 col = s.rgb / max(lum, 1e-4);
            gl_FragColor = vec4(col, 1.0);
          }
        }`,
    });
    postScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), postMat));

    // Plate + ink track document --ub-* tokens (no invented hex).
    let brand = sceneBrand();
    let ink = sceneInk('dark');
    let dim = sceneDim();
    const ENTRY = new THREE.Vector3(-2.5, 0.05, 0);
    const ends = Array.from({ length: LANES }, (_, i) => laneEnd(i));
    const tmp = new THREE.Vector3();
    const tan = new THREE.Vector3();
    const nrm = new THREE.Vector3();
    const bin = new THREE.Vector3();

    // ---- Lattice volume: tubular phosphor cells along each lane ------------
    const ALONG = 34;
    const RING = 5;
    const RADII = [0.04, 0.1];
    const laneCount = LANES * ALONG * RING * RADII.length;
    // A sparse halo around the entry so the endpoint reads as a core.
    const CORE = 140;
    const total = laneCount + CORE;

    const lPos = new Float32Array(total * 3);
    const lCol = new Float32Array(total * 3);
    const lBase = new Float32Array(total * 3); // resting colour (r,g,b)
    const lAmp = new Float32Array(total);
    const lKind = new Uint8Array(total); // 0 = dim guide, 1 = brand core

    let o = 0;
    for (let lane = 0; lane < LANES; lane++) {
      const end = ends[lane];
      for (let a = 0; a < ALONG; a++) {
        const u = a / (ALONG - 1);
        alongLane(ENTRY, end, u, tmp);
        alongLane(ENTRY, end, Math.min(1, u + 0.02), tan);
        tan.sub(tmp).normalize();
        nrm.set(0, 1, 0).cross(tan);
        if (nrm.lengthSq() < 1e-6) nrm.set(1, 0, 0).cross(tan);
        nrm.normalize();
        bin.copy(tan).cross(nrm).normalize();

        // Tube widens toward the provider end.
        const flare = 0.55 + u * 1.1;
        for (const rad of RADII) {
          for (let r = 0; r < RING; r++) {
            const ang = (r / RING) * Math.PI * 2 + lane * 0.17;
            const rr = rad * flare;
            const x = tmp.x + (nrm.x * Math.cos(ang) + bin.x * Math.sin(ang)) * rr;
            const y = tmp.y + (nrm.y * Math.cos(ang) + bin.y * Math.sin(ang)) * rr;
            const z = tmp.z + (nrm.z * Math.cos(ang) + bin.z * Math.sin(ang)) * rr;
            lPos[o * 3] = x;
            lPos[o * 3 + 1] = y;
            lPos[o * 3 + 2] = z;
            // Quiet guide — denser near the entry, softer along the tube so
            // the fan reads as lanes rather than a solid white wash.
            const rest = 0.07 + (1 - u) * 0.12 + (rad < 0.05 ? 0.045 : 0);
            lAmp[o] = rest;
            lKind[o] = 0;
            o++;
          }
        }
      }
    }

    for (let i = 0; i < CORE; i++) {
      const th = Math.random() * Math.PI * 2;
      const ph = (Math.random() - 0.5) * Math.PI;
      const rad = 0.08 + Math.random() * 0.32;
      lPos[o * 3] = ENTRY.x + Math.cos(th) * Math.cos(ph) * rad;
      lPos[o * 3 + 1] = ENTRY.y + Math.sin(ph) * rad;
      lPos[o * 3 + 2] = ENTRY.z + Math.sin(th) * Math.cos(ph) * rad;
      lAmp[o] = 0.22;
      lKind[o] = 1;
      o++;
    }

    function paintLatticeBase() {
      for (let i = 0; i < total; i++) {
        const src = lKind[i] ? brand : dim;
        const a = lAmp[i];
        lBase[i * 3] = src.r * a;
        lBase[i * 3 + 1] = src.g * a;
        lBase[i * 3 + 2] = src.b * a;
      }
      lCol.set(lBase);
      const attr = latticeGeo.attributes.color as THREE.BufferAttribute | undefined;
      if (attr) attr.needsUpdate = true;
    }

    const latticeGeo = new THREE.BufferGeometry();
    latticeGeo.setAttribute('position', new THREE.BufferAttribute(lPos, 3));
    latticeGeo.setAttribute('color', new THREE.BufferAttribute(lCol, 3));
    paintLatticeBase();
    const latticeMat = new THREE.PointsMaterial({
      size: 0.038,
      vertexColors: true,
      transparent: true,
      opacity: 1,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });
    const lattice = new THREE.Points(latticeGeo, latticeMat);
    scene.add(lattice);

    // ---- Packets: bright heads + short phosphor trails ---------------------
    const pCount = MAX * (TRAIL + 1);
    const pPos = new Float32Array(pCount * 3);
    const pCol = new Float32Array(pCount * 3);
    const pSize = new Float32Array(pCount);
    const packets: Packet[] = Array.from({ length: MAX }, () => ({
      lane: 0,
      t: 1,
      speed: 0,
      ghost: false,
      dead: true,
    }));

    const packetGeo = new THREE.BufferGeometry();
    packetGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    packetGeo.setAttribute('color', new THREE.BufferAttribute(pCol, 3));
    packetGeo.setAttribute('size', new THREE.BufferAttribute(pSize, 1));
    const packetMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
      uniforms: {
        uScale: { value: 1 },
      },
      vertexShader: `
        attribute float size;
        varying vec3 vColor;
        uniform float uScale;
        void main() {
          vColor = color;
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * uScale * (180.0 / -mv.z);
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: `
        varying vec3 vColor;
        void main() {
          vec2 d = gl_PointCoord - vec2(0.5);
          float r = length(d);
          if (r > 0.5) discard;
          // Soft phosphor core — dither will crunch it into cells.
          float a = smoothstep(0.5, 0.12, r);
          gl_FragColor = vec4(vColor, a);
        }`,
    });
    scene.add(new THREE.Points(packetGeo, packetMat));

    function applyTheme(theme: SceneTheme) {
      host.current?.style.setProperty('background-color', scenePlate());
      brand = sceneBrand();
      ink = sceneInk(theme);
      dim = sceneDim();
      postMat.uniforms.uLight.value = theme === 'light' ? 1 : 0;
      // Stamp uniforms are written raw to the canvas — use display sRGB so
      // --ub-blue matches the logo/button (linear working values read as royal).
      (postMat.uniforms.uInk.value as THREE.Color).copy(ink).convertLinearToSRGB();
      (postMat.uniforms.uBrand.value as THREE.Color).copy(brand).convertLinearToSRGB();
      paintLatticeBase();
    }
    const stopTheme = watchSceneTheme(applyTheme);

    let favoured = 0;
    const c = new THREE.Color();
    const v = new THREE.Vector3();

    function spawn() {
      const free = packets.find((p) => p.dead);
      if (!free) return;
      const lane = Math.random() < 0.48 ? favoured : Math.floor(Math.random() * LANES);
      free.lane = lane;
      free.t = 0;
      free.speed = 0.28 + Math.random() * 0.48;
      free.ghost = false;
      free.dead = false;

      if (Math.random() < 0.12) {
        const twin = packets.find((p) => p.dead);
        if (twin) {
          twin.lane = (lane + 1 + Math.floor(Math.random() * (LANES - 1))) % LANES;
          twin.t = 0;
          twin.speed = free.speed * 0.7;
          twin.ghost = true;
          twin.dead = false;
        }
      }
    }

    let progress = 0;
    let heroPresence = 1;
    const pointer = { x: 0, y: 0 };
    const heroEl = document.querySelector('.lp-hero');
    const readScroll = () => {
      const max = document.body.scrollHeight - window.innerHeight;
      progress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;

      const vh = window.innerHeight;
      // Hero owns the artifact only while it still fills the viewport. Once the
      // hero has scrolled off, presence must be zero — mid-page and footer sit
      // on their own plates, not inside a reconstituting funnel.
      if (heroEl) {
        const r = heroEl.getBoundingClientRect();
        const raw = Math.min(1, Math.max(0, (r.bottom - vh * 0.12) / (vh * 0.75)));
        heroPresence = raw * raw;
      } else {
        heroPresence = 0;
      }
    };
    readScroll();

    let scrollRaf = 0;
    let raf = 0;
    let looping = false;
    let resumeLoop = () => {};
    let stopLoop = () => {};

    const onScroll = () => {
      if (scrollRaf) return;
      scrollRaf = requestAnimationFrame(() => {
        scrollRaf = 0;
        readScroll();
        if (heroPresence >= 0.012) resumeLoop();
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    const onPointer = (e: PointerEvent) => {
      if (heroPresence < 0.012) return;
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('pointermove', onPointer, { passive: true });

    let narrow = false;
    const onResize = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      renderer.setSize(w, h);
      rt.setSize(Math.round(w * dpr), Math.round(h * dpr));
      postMat.uniforms.uRes.value.set(w * dpr, h * dpr);
      // Matches the CSS breakpoint where the hero type goes full measure.
      narrow = w <= 760;
      postMat.uniforms.uNarrow.value = narrow ? 1 : 0;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      readScroll();
      if (heroPresence >= 0.012) resumeLoop();
    };
    onResize();
    window.addEventListener('resize', onResize);

    const posAttr = packetGeo.attributes.position as THREE.BufferAttribute;
    const colAttr = packetGeo.attributes.color as THREE.BufferAttribute;
    const sizeAttr = packetGeo.attributes.size as THREE.BufferAttribute;
    const latCol = latticeGeo.attributes.color as THREE.BufferAttribute;

    let last = 0;
    let acc = 0;

    function frame(now: number) {
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016;
      last = now;

      if (!reduced) {
        acc += dt;
        while (acc > 0.065) {
          spawn();
          acc -= 0.065;
        }
        favoured = Math.floor(now / 2400) % LANES;
      } else if (packets.every((p) => p.dead)) {
        for (let i = 0; i < 28; i++) spawn();
        packets.forEach((p, i) => {
          p.t = (i % 14) / 14;
        });
      }

      // Decay lattice toward base, then light cells near active packets.
      for (let i = 0; i < total; i++) {
        const i3 = i * 3;
        lCol[i3] += (lBase[i3] - lCol[i3]) * Math.min(1, dt * 3.2);
        lCol[i3 + 1] += (lBase[i3 + 1] - lCol[i3 + 1]) * Math.min(1, dt * 3.2);
        lCol[i3 + 2] += (lBase[i3 + 2] - lCol[i3 + 2]) * Math.min(1, dt * 3.2);
      }

      // Full strength on the hero — the cone is the signature, not a sidebar.
      const presence = heroPresence;

      for (let i = 0; i < MAX; i++) {
        const p = packets[i];
        const base = i * (TRAIL + 1);

        if (!p.dead && !reduced) {
          p.t += dt * p.speed;
          if (p.t >= 1) p.dead = true;
        }

        if (p.dead) {
          for (let t = 0; t <= TRAIL; t++) {
            const j = (base + t) * 3;
            pPos[j] = pPos[j + 1] = pPos[j + 2] = 0;
            pCol[j] = pCol[j + 1] = pCol[j + 2] = 0;
            pSize[base + t] = 0;
          }
          continue;
        }

        const won = !p.ghost;
        const fade = p.ghost ? Math.max(0, 1 - p.t * 1.85) : 1;

        for (let t = 0; t <= TRAIL; t++) {
          const u = p.t - t * 0.018;
          const j = (base + t) * 3;
          if (u < 0) {
            pPos[j] = pPos[j + 1] = pPos[j + 2] = 0;
            pCol[j] = pCol[j + 1] = pCol[j + 2] = 0;
            pSize[base + t] = 0;
            continue;
          }
          alongLane(ENTRY, ends[p.lane], u, v);
          pPos[j] = v.x;
          pPos[j + 1] = v.y;
          pPos[j + 2] = v.z;

          const fall = 1 - t / (TRAIL + 1);
          // Colour: full brand/ink (fall only shrinks point size) so light-mode
          // dither can tell packet heads from the grey path.
          const headGain = won ? 1 : 0.28;
          c.copy(won ? brand : ink).multiplyScalar(fade * headGain);
          pCol[j] = c.r;
          pCol[j + 1] = c.g;
          pCol[j + 2] = c.b;
          pSize[base + t] = (won ? 0.09 : 0.055) * fall;

          // Light nearby lattice cells — coarse hash so we stay cheap.
          if (t === 0 && presence > 0.2) {
            const lx = Math.floor((v.x + 3) * 4);
            const ly = Math.floor((v.y + 2) * 4);
            const lz = Math.floor((v.z + 2) * 4);
            const wScale = 1.1;
            for (let n = 0; n < 24; n++) {
              const idx = ((lx * 73856093) ^ (ly * 19349663) ^ (lz * 83492791) ^ (n * 2654435761)) >>> 0;
              const li = idx % laneCount;
              const i3 = li * 3;
              const dx = lPos[i3] - v.x;
              const dy = lPos[i3 + 1] - v.y;
              const dz = lPos[i3 + 2] - v.z;
              const d2 = dx * dx + dy * dy + dz * dz;
              if (d2 > 0.085) continue;
              const w = (1 - d2 / 0.085) * fade * wScale;
              lCol[i3] = Math.min(1, lCol[i3] + brand.r * w * 0.55);
              lCol[i3 + 1] = Math.min(1, lCol[i3 + 1] + brand.g * w * 0.55);
              lCol[i3 + 2] = Math.min(1, lCol[i3 + 2] + brand.b * w * 0.55);
            }
          }
        }
      }

      posAttr.needsUpdate = true;
      colAttr.needsUpdate = true;
      sizeAttr.needsUpdate = true;
      latCol.needsUpdate = true;

      // Three-quarter on the fan; progress only nudges the orbit as you leave.
      // Narrow recomposes for the horizontal split: the volume centres up, sits
      // higher in frame, and pulls back so it clears the measure.
      const a = Math.PI * (0.34 + progress * 0.38);
      const radius = narrow ? 5.9 : 4.6;
      const camY = (narrow ? 0.3 : 0.55) + progress * 0.45;
      const lookY = narrow ? -1.15 : -0.35;
      const lookX = narrow ? -0.1 : -1.05;

      const px = reduced ? 0 : pointer.x * 0.2;
      const py = reduced ? 0 : pointer.y * 0.12;

      camera.position.set(
        Math.sin(a) * radius + px,
        camY - py,
        Math.cos(a) * radius,
      );
      camera.lookAt(lookX, lookY, 0);

      latticeMat.opacity = 0.55 * presence;
      packetMat.uniforms.uScale.value =
        presence < 0.05 ? 0 : 0.75 + presence * 0.5;
      postMat.uniforms.uFade.value = presence;
      postMat.uniforms.uClear.value = 0;

      renderer.setRenderTarget(rt);
      renderer.setClearColor(0x000000, 0);
      renderer.clear();
      renderer.render(scene, camera);
      renderer.setRenderTarget(null);
      renderer.setClearColor(0x000000, 0);
      renderer.clear();
      renderer.render(postScene, postCam);

      return presence;
    }

    const loop = (t: number) => {
      if (!looping) return;
      const presence = frame(t);
      if (presence < 0.01) {
        stopLoop();
        return;
      }
      raf = requestAnimationFrame(loop);
    };

    stopLoop = () => {
      looping = false;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      el.style.visibility = 'hidden';
    };

    resumeLoop = () => {
      if (reduced || looping) return;
      if (document.visibilityState === 'hidden') return;
      looping = true;
      el.style.visibility = '';
      last = 0;
      raf = requestAnimationFrame(loop);
    };

    const onVisibility = () => {
      if (document.visibilityState === 'hidden') stopLoop();
      else if (heroPresence >= 0.012) resumeLoop();
    };
    document.addEventListener('visibilitychange', onVisibility);

    if (reduced) frame(0);
    else resumeLoop();

    return () => {
      stopTheme();
      stopLoop();
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('pointermove', onPointer);
      if (scrollRaf) cancelAnimationFrame(scrollRaf);
      latticeGeo.dispose();
      latticeMat.dispose();
      packetGeo.dispose();
      packetMat.dispose();
      postMat.dispose();
      rt.dispose();
      renderer.dispose();
      el.removeChild(renderer.domElement);
    };
  }, []);

  return <div className="lp-scene" ref={host} aria-hidden />;
}

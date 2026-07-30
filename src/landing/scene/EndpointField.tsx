import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * Footer signature: an orbital phosphor nucleus.
 *
 * Same Bayer dither and hero palette (cyan / ink / dark plate), but a
 * different silhouette from the routing cone — concentric rings around a
 * single core, not lanes. The closing band is about one interface; this is
 * that nucleus, not a flipped funnel.
 */

const RINGS = [
  { r: 0.55, n: 48, tilt: 0.15, yaw: 0.0, speed: 0.22 },
  { r: 0.95, n: 64, tilt: -0.4, yaw: 0.7, speed: -0.14 },
  { r: 1.35, n: 80, tilt: 0.55, yaw: -0.35, speed: 0.09 },
  { r: 1.8, n: 96, tilt: -0.25, yaw: 1.1, speed: -0.06 },
];
const CORE = 160;
const SPARKS = 28;
const TRAIL = 5;

type Spark = {
  ring: number;
  a0: number;
  t: number;
  speed: number;
  dead: boolean;
};

export function EndpointField() {
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
    const dpr = Math.min(window.devicePixelRatio, 2);
    renderer.setPixelRatio(dpr);
    renderer.setSize(el.clientWidth, el.clientHeight);
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, el.clientWidth / el.clientHeight, 0.1, 100);

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
          float ramp = pow(clamp(lum * 4.5, 0.0, 1.0), 0.58) * uFade;

          // Nucleus sits mid-right; keep the closing copy readable on the left.
          float clear = smoothstep(0.28, 0.62, vUv.x);
          clear *= mix(0.35, 1.0, smoothstep(0.0, 0.22, vUv.y));
          ramp *= clear;
          ramp *= smoothstep(0.0, 0.06, vUv.y) * smoothstep(1.0, 0.9, vUv.y);
          if (ramp < bayer(cell)) discard;

          vec3 col = s.rgb / max(lum, 1e-4);
          gl_FragColor = vec4(col, 1.0);
        }`,
    });
    postScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), postMat));

    const ink = new THREE.Color('#A7AAA7');
    const brand = new THREE.Color('#1FB6FF');
    const dim = ink.clone().multiplyScalar(0.2);

    const ringCount = RINGS.reduce((s, r) => s + r.n, 0);
    const total = ringCount + CORE;
    const lPos = new Float32Array(total * 3);
    const lCol = new Float32Array(total * 3);
    const lBase = new Float32Array(total * 3);
    // Rest-frame positions so we can spin each ring without rebuilding.
    const rest = new Float32Array(total * 3);
    const ringOf = new Int16Array(total);

    let o = 0;
    RINGS.forEach((ring, ri) => {
      for (let i = 0; i < ring.n; i++) {
        const a = (i / ring.n) * Math.PI * 2;
        const x = Math.cos(a) * ring.r;
        const y = Math.sin(a) * ring.r;
        rest[o * 3] = x;
        rest[o * 3 + 1] = y;
        rest[o * 3 + 2] = 0;
        ringOf[o] = ri;
        // Outer rings quieter; inner rings denser so the core reads first.
        const restL = 0.07 + (1 - ri / RINGS.length) * 0.12;
        lBase[o * 3] = dim.r * restL;
        lBase[o * 3 + 1] = dim.g * restL;
        lBase[o * 3 + 2] = dim.b * restL;
        o++;
      }
    });

    for (let i = 0; i < CORE; i++) {
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(2 * Math.random() - 1);
      const rad = Math.pow(Math.random(), 0.55) * 0.38;
      rest[o * 3] = Math.sin(ph) * Math.cos(th) * rad;
      rest[o * 3 + 1] = Math.sin(ph) * Math.sin(th) * rad;
      rest[o * 3 + 2] = Math.cos(ph) * rad;
      ringOf[o] = -1;
      const glow = 0.18 + (1 - rad / 0.38) * 0.22;
      lBase[o * 3] = brand.r * glow;
      lBase[o * 3 + 1] = brand.g * glow;
      lBase[o * 3 + 2] = brand.b * glow;
      o++;
    }

    lCol.set(lBase);
    lPos.set(rest);

    const latticeGeo = new THREE.BufferGeometry();
    latticeGeo.setAttribute('position', new THREE.BufferAttribute(lPos, 3));
    latticeGeo.setAttribute('color', new THREE.BufferAttribute(lCol, 3));
    const latticeMat = new THREE.PointsMaterial({
      size: 0.032,
      vertexColors: true,
      transparent: true,
      opacity: 1,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });
    const lattice = new THREE.Points(latticeGeo, latticeMat);
    scene.add(lattice);

    const pCount = SPARKS * (TRAIL + 1);
    const pPos = new Float32Array(pCount * 3);
    const pCol = new Float32Array(pCount * 3);
    const pSize = new Float32Array(pCount);
    const sparks: Spark[] = Array.from({ length: SPARKS }, () => ({
      ring: 0,
      a0: 0,
      t: 1,
      speed: 0,
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
      uniforms: { uScale: { value: 1 } },
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
          float a = smoothstep(0.5, 0.12, r);
          gl_FragColor = vec4(vColor, a);
        }`,
    });
    scene.add(new THREE.Points(packetGeo, packetMat));

    const c = new THREE.Color();
    const v = new THREE.Vector3();
    const qAll = new THREE.Quaternion();
    const eul = new THREE.Euler();
    const ringPhase = RINGS.map(() => 0);

    function ringLocal(ring: number, angle: number, radius: number, out: THREE.Vector3) {
      out.set(Math.cos(angle) * radius, Math.sin(angle) * radius, 0);
      const def = RINGS[ring];
      eul.set(def.tilt, def.yaw, ringPhase[ring], 'XYZ');
      qAll.setFromEuler(eul);
      out.applyQuaternion(qAll);
      return out;
    }

    function spawn() {
      const free = sparks.find((s) => s.dead);
      if (!free) return;
      // Prefer outer rings — sparks fall inward toward the nucleus.
      free.ring = Math.min(RINGS.length - 1, Math.floor(Math.random() * RINGS.length));
      free.a0 = Math.random() * Math.PI * 2;
      free.t = 0;
      free.speed = 0.45 + Math.random() * 0.55;
      free.dead = false;
    }

    let visible = false;
    let last = 0;
    let acc = 0;
    let raf = 0;

    const io = new IntersectionObserver(
      ([entry]) => {
        const next = entry.isIntersecting;
        if (next && !visible && !reduced) {
          visible = true;
          last = 0;
          raf = requestAnimationFrame(loop);
        } else {
          visible = next;
        }
      },
      { rootMargin: '80px 0px', threshold: 0.05 },
    );
    io.observe(el);

    const onResize = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (w < 1 || h < 1) return;
      renderer.setSize(w, h);
      rt.setSize(Math.round(w * dpr), Math.round(h * dpr));
      postMat.uniforms.uRes.value.set(w * dpr, h * dpr);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    onResize();
    window.addEventListener('resize', onResize);

    const posAttr = packetGeo.attributes.position as THREE.BufferAttribute;
    const colAttr = packetGeo.attributes.color as THREE.BufferAttribute;
    const sizeAttr = packetGeo.attributes.size as THREE.BufferAttribute;
    const latPos = latticeGeo.attributes.position as THREE.BufferAttribute;
    const latCol = latticeGeo.attributes.color as THREE.BufferAttribute;

    function frame(now: number) {
      if (!visible && !reduced) return;

      const dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016;
      last = now;

      if (!reduced) {
        acc += dt;
        while (acc > 0.09) {
          spawn();
          acc -= 0.09;
        }
        RINGS.forEach((ring, i) => {
          ringPhase[i] += dt * ring.speed;
        });
      } else if (sparks.every((s) => s.dead)) {
        for (let i = 0; i < 14; i++) spawn();
        sparks.forEach((s, i) => {
          s.t = (i % 7) / 7;
        });
      }

      // Spin ring points in place; core breathes gently.
      const breath = 1 + Math.sin(now * 0.0011) * 0.04;
      for (let i = 0; i < total; i++) {
        const i3 = i * 3;
        const ri = ringOf[i];
        if (ri < 0) {
          lPos[i3] = rest[i3] * breath;
          lPos[i3 + 1] = rest[i3 + 1] * breath;
          lPos[i3 + 2] = rest[i3 + 2] * breath;
        } else {
          const def = RINGS[ri];
          eul.set(def.tilt, def.yaw, ringPhase[ri], 'XYZ');
          qAll.setFromEuler(eul);
          v.set(rest[i3], rest[i3 + 1], rest[i3 + 2]).applyQuaternion(qAll);
          lPos[i3] = v.x;
          lPos[i3 + 1] = v.y;
          lPos[i3 + 2] = v.z;
        }
        lCol[i3] += (lBase[i3] - lCol[i3]) * Math.min(1, dt * 2.8);
        lCol[i3 + 1] += (lBase[i3 + 1] - lCol[i3 + 1]) * Math.min(1, dt * 2.8);
        lCol[i3 + 2] += (lBase[i3 + 2] - lCol[i3 + 2]) * Math.min(1, dt * 2.8);
      }

      for (let i = 0; i < SPARKS; i++) {
        const s = sparks[i];
        const base = i * (TRAIL + 1);

        if (!s.dead && !reduced) {
          s.t += dt * s.speed;
          if (s.t >= 1) s.dead = true;
        }

        if (s.dead) {
          for (let t = 0; t <= TRAIL; t++) {
            const j = (base + t) * 3;
            pPos[j] = pPos[j + 1] = pPos[j + 2] = 0;
            pCol[j] = pCol[j + 1] = pCol[j + 2] = 0;
            pSize[base + t] = 0;
          }
          continue;
        }

        const r0 = RINGS[s.ring].r;
        for (let t = 0; t <= TRAIL; t++) {
          const u = s.t - t * 0.04;
          const j = (base + t) * 3;
          if (u < 0) {
            pPos[j] = pPos[j + 1] = pPos[j + 2] = 0;
            pCol[j] = pCol[j + 1] = pCol[j + 2] = 0;
            pSize[base + t] = 0;
            continue;
          }
          // Radial fall from the ring into the nucleus, with a slight swirl.
          const rad = r0 * (1 - u);
          const ang = s.a0 + u * 1.4;
          ringLocal(s.ring, ang, Math.max(0.02, rad), v);
          // Ease into the core sphere near the end.
          if (u > 0.7) {
            const k = (u - 0.7) / 0.3;
            v.multiplyScalar(1 - k * 0.85);
          }
          pPos[j] = v.x;
          pPos[j + 1] = v.y;
          pPos[j + 2] = v.z;

          const fall = 1 - t / (TRAIL + 1);
          c.copy(brand).multiplyScalar(fall * (0.55 + u * 0.7));
          pCol[j] = c.r;
          pCol[j + 1] = c.g;
          pCol[j + 2] = c.b;
          pSize[base + t] = 0.085 * fall;

          if (t === 0) {
            // Light nearby lattice — cheap hash neighborhood.
            const lx = Math.floor((v.x + 3) * 5);
            const ly = Math.floor((v.y + 3) * 5);
            const lz = Math.floor((v.z + 3) * 5);
            for (let n = 0; n < 40; n++) {
              const idx = ((lx * 73856093) ^ (ly * 19349663) ^ (lz * 83492791) ^ (n * 2654435761)) >>> 0;
              const li = idx % total;
              const i3 = li * 3;
              const dx = lPos[i3] - v.x;
              const dy = lPos[i3 + 1] - v.y;
              const dz = lPos[i3 + 2] - v.z;
              const d2 = dx * dx + dy * dy + dz * dz;
              if (d2 > 0.08) continue;
              const w = (1 - d2 / 0.08) * (0.6 + u * 0.5);
              lCol[i3] = Math.min(1, lCol[i3] + brand.r * w * 0.55);
              lCol[i3 + 1] = Math.min(1, lCol[i3 + 1] + brand.g * w * 0.55);
              lCol[i3 + 2] = Math.min(1, lCol[i3 + 2] + brand.b * w * 0.55);
            }
          }
        }
      }

      latPos.needsUpdate = true;
      latCol.needsUpdate = true;
      posAttr.needsUpdate = true;
      colAttr.needsUpdate = true;
      sizeAttr.needsUpdate = true;

      // Settled three-quarter view — nucleus on the right of the band.
      const drift = reduced ? 0 : Math.sin(now * 0.00015) * 0.08;
      camera.position.set(2.4 + drift, 1.05, 3.6);
      camera.lookAt(0.15, 0, 0);
      lattice.rotation.y = reduced ? 0.2 : now * 0.00008;

      latticeMat.opacity = 0.7;
      packetMat.uniforms.uScale.value = 1;
      postMat.uniforms.uFade.value = 1;

      renderer.setRenderTarget(rt);
      renderer.setClearColor(0x000000, 0);
      renderer.clear();
      renderer.render(scene, camera);
      renderer.setRenderTarget(null);
      renderer.setClearColor(0x000000, 0);
      renderer.clear();
      renderer.render(postScene, postCam);

      if (!reduced && visible) raf = requestAnimationFrame(loop);
    }

    const loop = (t: number) => {
      frame(t);
    };

    if (reduced) {
      visible = true;
      frame(0);
    }

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener('resize', onResize);
      latticeGeo.dispose();
      latticeMat.dispose();
      packetGeo.dispose();
      packetMat.dispose();
      postMat.dispose();
      rt.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === el) el.removeChild(renderer.domElement);
    };
  }, []);

  return <div className="lp-footer-scene" ref={host} aria-hidden />;
}

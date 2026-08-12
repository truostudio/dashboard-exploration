import { useEffect, useRef } from 'react';

/**
 * Bayer-dithered noise field, inked in the brand blue.
 *
 * Ordered dithering over FBM noise: the noise sets a coverage value per cell and
 * the Bayer threshold decides whether that cell lights up, so density reads as a
 * continuous gradient made of hard-edged dots. That is the point: a gradient
 * would be a wash; this is a screen, and it is the same device the marketing
 * pages draw in CSS.
 *
 * The canvas is deliberately rendered at CSS resolution rather than DPR: the
 * cells are supposed to be chunky, and painting a full-bleed field at 2x costs
 * four times the pixels for dots we then want to look coarse anyway.
 *
 * The wrapper class is `dither-gl`, not `dither`: the landing stylesheet owns
 * `.dither` for its CSS dot-grid, and both stylesheets are bundled globally.
 */

const VERTEX_SRC = `#version 300 es
in vec2 aPosition;
void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;

const FRAGMENT_SRC = `#version 300 es
precision highp float;

uniform vec3  uColor;
uniform vec2  uResolution;
uniform float uTime;
uniform float uCellSize;
/** Coverage at the sparse end of the ramp, and at the dense corner. */
uniform float uBase;
uniform float uPeak;

out vec4 fragColor;

// Bayer matrix. Bayer8 lands in [0,1), which is exactly the range a coverage
// value gets compared against below, no rescaling needed.
float Bayer2(vec2 a) {
    a = floor(a);
    return fract(a.x / 2. + a.y * a.y * .75);
}
#define Bayer4(a) (Bayer2(.5*(a))*0.25 + Bayer2(a))
#define Bayer8(a) (Bayer4(.5*(a))*0.25 + Bayer2(a))

float hash11(float n) { return fract(sin(n)*43758.5453); }

float vnoise(vec3 p) {
    vec3 ip = floor(p);
    vec3 fp = fract(p);
    float n000 = hash11(dot(ip + vec3(0,0,0), vec3(1,57,113)));
    float n100 = hash11(dot(ip + vec3(1,0,0), vec3(1,57,113)));
    float n010 = hash11(dot(ip + vec3(0,1,0), vec3(1,57,113)));
    float n110 = hash11(dot(ip + vec3(1,1,0), vec3(1,57,113)));
    float n001 = hash11(dot(ip + vec3(0,0,1), vec3(1,57,113)));
    float n101 = hash11(dot(ip + vec3(1,0,1), vec3(1,57,113)));
    float n011 = hash11(dot(ip + vec3(0,1,1), vec3(1,57,113)));
    float n111 = hash11(dot(ip + vec3(1,1,1), vec3(1,57,113)));
    vec3 w = fp*fp*fp*(fp*(fp*6.0-15.0)+10.0);
    float x00 = mix(n000, n100, w.x);
    float x10 = mix(n010, n110, w.x);
    float x01 = mix(n001, n101, w.x);
    float x11 = mix(n011, n111, w.x);
    float y0  = mix(x00, x10, w.y);
    float y1  = mix(x01, x11, w.y);
    return mix(y0, y1, w.z) * 2.0 - 1.0;
}

/** Normalised FBM in 0..1. Each octave drifts at its own rate, so the field
    churns internally instead of sliding past as one rigid sheet. */
float fbm(vec2 uv, float t) {
    float sum = 0.0;
    float norm = 0.0;
    float amp = 0.5;
    float freq = 1.0;
    for (int i = 0; i < 4; ++i) {
        sum  += amp * vnoise(vec3(uv * freq, t * (1.0 + float(i) * 0.28)));
        norm += amp;
        freq *= 2.0;
        amp  *= 0.5;
    }
    return (sum / norm) * 0.5 + 0.5;
}

void main() {
    vec2 frag = gl_FragCoord.xy;
    vec2 uv = frag / uResolution;
    float aspect = uResolution.x / uResolution.y;

    // Sample the noise in aspect-corrected space so the clouds stay round on a
    // wide panel instead of smearing horizontally, then stretch the result: a
    // value-noise FBM clusters tightly around 0.5, so the window that expands it
    // back into a usable 0..1 has to be narrow. A wide one throws most of the
    // field away and leaves nothing but specks.
    float clouds = fbm(vec2(uv.x * aspect, uv.y) * 2.1, uTime * 0.055);
    clouds = smoothstep(0.38, 0.63, clouds);

    // Density ramp: near-empty over the copy on the left, full weight at the
    // right edge, heavier toward the floor so the field has a direction rather
    // than sitting there symmetrically. The narrower the panel, the later the
    // ramp starts, on a phone the copy runs the full width, so a field that
    // begins halfway across would be sitting on the paragraph.
    float start = mix(0.60, 0.48, smoothstep(0.9, 1.8, aspect));
    float across = smoothstep(start, 1.04, uv.x);
    float down   = mix(0.58, 1.0, smoothstep(0.92, 0.0, uv.y));
    float amount = mix(uBase, uPeak, across * down);

    // Everything is multiplied by the noise, including the sparse end, so the
    // field breathes rather than holding one flat density.
    float coverage = amount * mix(0.30, 1.0, clouds);

    // Ordered dither: one threshold per cell, compared against coverage. Pure
    // Bayer at a low, even coverage lays down a perfectly periodic lattice,
    // polka dots, not a field, so a fixed per-cell hash is blended into the
    // threshold. Enough to scatter the sparse end, little enough that the dense
    // banks keep the ordered structure that makes this read as a screen.
    vec2 cell = floor(frag / uCellSize);
    float scatter = hash11(dot(cell, vec2(17.0, 113.0)));
    float threshold = mix(Bayer8(frag / uCellSize), scatter, 0.25);
    // Strictly greater, not step(): step(0.0, 0.0) is 1, which lit up the cells
    // whose threshold happens to be exactly zero even where coverage was zero,
    // a scatter of stray dots sitting on the paragraph.
    float on = clamp(coverage, 0.0, 1.0) > threshold ? 1.0 : 0.0;
    fragColor = vec4(uColor, on);
}
`;

/** #1FB6FF, the brand blue, in 0–1. */
const INK_COLOR = [0.122, 0.714, 1.0];
/** CSS px per dither cell. Chunky on purpose, 1px reads as haze, not a screen. */
const CELL_SIZE = 2;
/** Animation cadence. A dithered field does not want 60fps; it wants a tick. */
const FPS = 24;

function createShader(gl: WebGL2RenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function createProgram(gl: WebGL2RenderingContext, vs: string, fs: string) {
  const v = createShader(gl, gl.VERTEX_SHADER, vs);
  const f = createShader(gl, gl.FRAGMENT_SHADER, fs);
  if (!v || !f) return null;
  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, v);
  gl.attachShader(program, f);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;
  return program;
}

export function Dither({
  animated = true,
  staticTime = 12,
  base = 0.0,
  peak = 0.8,
  className = '',
}: {
  /** Animate the field. False renders one frozen frame, for decorative fills. */
  animated?: boolean;
  /** Time slice for the frozen frame. Different values, different stable patterns. */
  staticTime?: number;
  /** Coverage at the sparse end, stray cells drifting through, never a lattice. */
  base?: number;
  /** Coverage at the densest corner. Past ~0.7 the cells close up into a block. */
  peak?: number;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl2', { alpha: true, premultipliedAlpha: false });
    // No WebGL2 is not an error worth surfacing: the panel reads fine without
    // its texture, so the effect simply does not paint.
    if (!gl) return;

    const program = createProgram(gl, VERTEX_SRC, FRAGMENT_SRC);
    if (!program) return;

    const verts = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(program, 'aPosition');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
    gl.useProgram(program);

    const uResolution = gl.getUniformLocation(program, 'uResolution');
    const uTime = gl.getUniformLocation(program, 'uTime');
    const uColor = gl.getUniformLocation(program, 'uColor');
    const uCellSize = gl.getUniformLocation(program, 'uCellSize');
    gl.uniform3f(uColor, INK_COLOR[0], INK_COLOR[1], INK_COLOR[2]);
    gl.uniform1f(uCellSize, CELL_SIZE);
    gl.uniform1f(gl.getUniformLocation(program, 'uBase'), base);
    gl.uniform1f(gl.getUniformLocation(program, 'uPeak'), peak);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    const still =
      typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    const moving = animated && !still;
    const startTime = performance.now();

    const draw = (seconds: number) => {
      gl.uniform1f(uTime, seconds);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    // Backing store at CSS resolution: the cells are meant to be coarse, and the
    // canvas is upscaled with image-rendering: pixelated so they stay crisp.
    //
    // The seen size is tracked here rather than read off the canvas: React
    // re-runs this effect on the same canvas (StrictMode does it on every
    // mount), and a canvas that is already the right size would short-circuit
    // the check and leave the *new* program's uResolution at zero, which turns
    // every uv into infinity and flattens the ramp into a full-bleed wash.
    let seenWidth = -1;
    let seenHeight = -1;
    const resize = () => {
      const width = Math.max(1, Math.round(canvas.clientWidth));
      const height = Math.max(1, Math.round(canvas.clientHeight));
      if (width === seenWidth && height === seenHeight) return;
      seenWidth = width;
      seenHeight = height;
      canvas.width = width;
      canvas.height = height;
      gl.viewport(0, 0, width, height);
      gl.uniform2f(uResolution, width, height);
      // A frozen frame depends on resolution, so it has to repaint on resize.
      // The animation loop repaints on its own.
      if (!moving) draw(staticTime);
    };
    // The hero resizes when the sidebar collapses, which is not a window resize.
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();

    let raf = 0;
    if (moving) {
      let last = 0;
      const frame = 1000 / FPS;
      const tick = (now: number) => {
        raf = requestAnimationFrame(tick);
        if (now - last < frame) return;
        last = now;
        draw((now - startTime) / 1000);
      };
      raf = requestAnimationFrame(tick);
    }

    return () => {
      if (raf) cancelAnimationFrame(raf);
      observer.disconnect();
      gl.deleteProgram(program);
    };
  }, [animated, staticTime, base, peak]);

  return (
    <div className={`dither-gl ${className}`.trim()} aria-hidden>
      <canvas ref={canvasRef} className="dither-gl-canvas" />
    </div>
  );
}

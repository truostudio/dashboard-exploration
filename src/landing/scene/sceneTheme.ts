import * as THREE from 'three';

/** Landing WebGL plate + ink follow document theme tokens only. */
export type SceneTheme = 'light' | 'dark';

export function readSceneTheme(): SceneTheme {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
}

function cssVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function cssColor(name: string): THREE.Color {
  const v = cssVar(name);
  return new THREE.Color(v || '#000000');
}

/** Plate behind the canvas, `--ub-canvas`. */
export function scenePlate(): string {
  return cssVar('--ub-canvas') || '#F3F4F3';
}

/**
 * Ghost packets / dither ink for the persistent path.
 * Light → `--ub-text-3` (same grey as the "theme" label on the theme control).
 * Dark → `--ub-black` (pale phosphor).
 */
export function sceneInk(theme: SceneTheme = readSceneTheme()): THREE.Color {
  return cssColor(theme === 'light' ? '--ub-text-3' : '--ub-black');
}

/** Quiet lattice guides (persistent path), `--ub-text-3`. */
export function sceneDim(): THREE.Color {
  return cssColor('--ub-text-3');
}

/** Brand cores / winning packets, `--ub-blue` only, both themes. */
export function sceneBrand(): THREE.Color {
  return cssColor('--ub-blue');
}

/** Watch `data-theme` on <html>; returns unsubscribe. */
export function watchSceneTheme(onChange: (theme: SceneTheme) => void): () => void {
  const apply = () => onChange(readSceneTheme());
  apply();
  const obs = new MutationObserver(apply);
  obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  return () => obs.disconnect();
}

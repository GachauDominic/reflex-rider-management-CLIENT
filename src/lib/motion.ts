/**
 * The hero's 3D scene and scroll animations are genuinely optional —
 * checked once here rather than duplicating the media query in every
 * animated component. A person with prefers-reduced-motion set still
 * gets the full page and content, just without the continuous rider
 * loop and scroll-driven motion.
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

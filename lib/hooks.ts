"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

/** Tracks `prefers-reduced-motion`. SSR-safe (false until mounted). */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return reduced;
}

/** True on coarse / touch pointers — used to disable the custom cursor + heavy 3D. */
export function useIsTouch(): boolean {
  const [touch, setTouch] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(hover: none), (pointer: coarse)");
    const update = () => setTouch(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return touch;
}

type Vec2 = { x: number; y: number };

/**
 * Normalised pointer position in [-1, 1] (0,0 = viewport centre).
 * Returned as a ref so consumers can read it inside rAF without re-rendering.
 */
export function useMouseNormalized() {
  const pos = useRef<Vec2>({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pos.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pos.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  return pos;
}

/** Fires once when `ref` first enters the viewport. */
export function useInViewOnce<T extends Element>(
  rootMargin = "0px 0px -15% 0px"
): [RefObject<T | null>, boolean] {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    if (seen) return;
    const el = ref.current;
    let io: IntersectionObserver | null = null;

    if (el && "IntersectionObserver" in window) {
      io = new IntersectionObserver(
        (entries) => {
          if (entries[0]?.isIntersecting) {
            setSeen(true);
            io?.disconnect();
          }
        },
        { rootMargin }
      );
      io.observe(el);
    }

    // fallback so dependent animations never stall if the observer is inert
    const t = window.setTimeout(() => setSeen(true), 700);

    return () => {
      io?.disconnect();
      window.clearTimeout(t);
    };
  }, [seen, rootMargin]);

  return [ref, seen];
}

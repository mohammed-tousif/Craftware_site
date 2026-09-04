"use client";

import { useEffect, useRef } from "react";
import { useIsTouch, useReducedMotion } from "@/lib/hooks";

/* ------------------------------------------------------------------ *
 *  Interactive dot mesh for the hero background.
 *  A drifting field of mild-red dots linked by faint lines. Near the
 *  cursor they brighten to cherry, swell, and pull toward it, with
 *  lit connector lines. Canvas 2D, rAF, pauses when off-screen.
 * ------------------------------------------------------------------ */

type Dot = { x: number; y: number; hx: number; hy: number; vx: number; vy: number; p?: number };

export default function MeshField({ className = "" }: { className?: string }) {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();
  const isTouch = useIsTouch();

  useEffect(() => {
    const box = wrap.current;
    const cv = canvas.current;
    if (!box || !cv) return;
    const ctx = cv.getContext("2d", { alpha: true });
    if (!ctx) return;

    const lerp = (a: number, b: number, t: number) => Math.round(a + (b - a) * t);

    let w = 0;
    let h = 0;
    let dpr = 1;
    const dots: Dot[] = [];
    const mouse = { x: -9999, y: -9999, active: false };
    const LINK = 130;
    const MOUSE = 170;
    const interactive = !isTouch;

    const seed = () => {
      dots.length = 0;
      const density = Math.max(24, Math.min(84, Math.round((w * h) / 22000)));
      for (let i = 0; i < density; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        dots.push({
          x,
          y,
          hx: x,
          hy: y,
          vx: (Math.random() - 0.5) * 0.15,
          vy: (Math.random() - 0.5) * 0.15,
        });
      }
    };

    const resize = () => {
      w = box.clientWidth;
      h = box.clientHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      cv.width = Math.max(1, Math.round(w * dpr));
      cv.height = Math.max(1, Math.round(h * dpr));
      cv.style.width = `${w}px`;
      cv.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    };

    let raf = 0;
    let running = true;

    const frame = () => {
      if (!running) return;
      ctx.clearRect(0, 0, w, h);

      for (const d of dots) {
        if (!reduced) {
          d.hx += d.vx;
          d.hy += d.vy;
          if (d.hx < -20) d.hx = w + 20;
          if (d.hx > w + 20) d.hx = -20;
          if (d.hy < -20) d.hy = h + 20;
          if (d.hy > h + 20) d.hy = -20;
        }

        let tx = d.hx;
        let ty = d.hy;
        let pull = 0;
        if (interactive && mouse.active) {
          const dx = mouse.x - d.hx;
          const dy = mouse.y - d.hy;
          const dist = Math.hypot(dx, dy);
          if (dist < MOUSE) {
            pull = 1 - dist / MOUSE;
            tx = d.hx + dx * pull * 0.3;
            ty = d.hy + dy * pull * 0.3;
          }
        }
        d.x += (tx - d.x) * 0.12;
        d.y += (ty - d.y) * 0.12;
        d.p = pull;
      }

      // links between dots
      for (let i = 0; i < dots.length; i++) {
        for (let j = i + 1; j < dots.length; j++) {
          const a = dots[i];
          const b = dots[j];
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          if (dist < LINK) {
            const t = 1 - dist / LINK;
            ctx.strokeStyle = `rgba(200,16,46,${t * 0.16})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // cursor links + dots
      for (const d of dots) {
        const p = d.p ?? 0;
        if (interactive && mouse.active && p > 0) {
          ctx.strokeStyle = `rgba(200,16,46,${p * 0.55})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(d.x, d.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }
        const r = 1.3 + p * 3;
        ctx.beginPath();
        ctx.arc(d.x, d.y, r, 0, Math.PI * 2);
        if (p > 0.02) {
          // soft red -> cherry as it nears the cursor
          ctx.fillStyle = `rgba(${lerp(227, 200, p)},${lerp(93, 16, p)},${lerp(114, 46, p)},${0.6 + p * 0.4})`;
          ctx.shadowColor = "rgba(200,16,46,0.85)";
          ctx.shadowBlur = p * 15;
        } else {
          ctx.fillStyle = "rgba(227,93,114,0.5)";
          ctx.shadowBlur = 0;
        }
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      raf = requestAnimationFrame(frame);
    };

    const onMove = (e: PointerEvent) => {
      const r = cv.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
      mouse.active =
        mouse.x >= -MOUSE &&
        mouse.x <= w + MOUSE &&
        mouse.y >= -MOUSE &&
        mouse.y <= h + MOUSE;
    };
    const onLeave = () => {
      mouse.active = false;
    };

    const io = new IntersectionObserver(
      (entries) => {
        running = entries[0]?.isIntersecting ?? false;
        if (running) raf = requestAnimationFrame(frame);
      },
      { rootMargin: "120px" }
    );
    io.observe(box);

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(box);
    if (interactive) {
      window.addEventListener("pointermove", onMove, { passive: true });
      window.addEventListener("pointerout", onLeave);
    }
    raf = requestAnimationFrame(frame);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerout", onLeave);
    };
  }, [reduced, isTouch]);

  return (
    <div ref={wrap} className={`pointer-events-none ${className}`} aria-hidden>
      <canvas ref={canvas} className="absolute inset-0 h-full w-full" />
    </div>
  );
}

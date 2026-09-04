"use client";

import { useEffect, useRef } from "react";
import { techStack } from "@/content/techStack";
import { useReducedMotion } from "@/lib/hooks";

type Node = { x: number; y: number; vx: number; vy: number; label: string };

export default function TechConstellation() {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const cv = canvas.current;
    const box = wrap.current;
    if (!cv || !box) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    const nodes: Node[] = [];
    const mouse = { x: -9999, y: -9999 };

    const seed = () => {
      nodes.length = 0;
      for (let i = 0; i < techStack.length; i++) {
        nodes.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.2,
          vy: (Math.random() - 0.5) * 0.2,
          label: techStack[i],
        });
      }
    };

    const resize = () => {
      w = box.clientWidth;
      h = box.clientHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      cv.width = w * dpr;
      cv.height = h * dpr;
      cv.style.width = `${w}px`;
      cv.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!nodes.length) seed();
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);

      for (const n of nodes) {
        if (!reduced) {
          n.x += n.vx;
          n.y += n.vy;
          if (n.x < 0 || n.x > w) n.vx *= -1;
          if (n.y < 0 || n.y > h) n.vy *= -1;

          const dx = n.x - mouse.x;
          const dy = n.y - mouse.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 120 * 120) {
            const d = Math.sqrt(d2) || 1;
            const f = (1 - d / 120) * 0.6;
            n.x += (dx / d) * f;
            n.y += (dy / d) * f;
          }
        }
      }

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          if (dist < 170) {
            ctx.strokeStyle = `rgba(200,16,46,${(1 - dist / 170) * 0.22})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      ctx.font =
        '11px var(--font-space-grotesk), "Space Grotesk", system-ui, sans-serif';
      ctx.textBaseline = "middle";
      for (const n of nodes) {
        ctx.beginPath();
        ctx.arc(n.x, n.y, 2.6, 0, Math.PI * 2);
        ctx.fillStyle = "#c8102e";
        ctx.fill();
        ctx.fillStyle = "rgba(26,17,19,0.62)";
        ctx.fillText(n.label, n.x + 9, n.y);
      }

      raf = requestAnimationFrame(draw);
    };

    let raf = 0;
    const onMove = (e: PointerEvent) => {
      const r = cv.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
    };
    const onLeave = () => {
      mouse.x = -9999;
      mouse.y = -9999;
    };

    resize();
    seed();
    draw();
    window.addEventListener("resize", resize);
    cv.addEventListener("pointermove", onMove);
    cv.addEventListener("pointerleave", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      cv.removeEventListener("pointermove", onMove);
      cv.removeEventListener("pointerleave", onLeave);
    };
  }, [reduced]);

  return (
    <div
      ref={wrap}
      className="relative h-[300px] w-full overflow-hidden rounded-xl border border-hair bg-paper-2 sm:h-[380px]"
    >
      <canvas ref={canvas} className="absolute inset-0" />
    </div>
  );
}

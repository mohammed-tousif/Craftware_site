"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useReducedMotion } from "@/lib/hooks";

type Props = {
  className?: string;
  /** 0..1 scroll progress ref — spins the monolith as you scroll past */
  scrollProgress?: React.RefObject<number> | null;
  /** follow the pointer for parallax */
  parallax?: boolean;
  /** fewer particles / cheaper material */
  low?: boolean;
};

/**
 * Hand-rolled three.js signature object — a frosted-glass architectural
 * monolith lit from within, with a glowing "C" on its face, a wireframe
 * energy field and drifting particles. No react-three-fiber (its reconciler
 * doesn't attach under this Next/React build), so the render loop, resize
 * and disposal are all managed here.
 */
export default function MonolithCanvas({
  className = "",
  scrollProgress = null,
  parallax = true,
  low = false,
}: Props) {
  const host = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = host.current;
    if (!el || reduced) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(0, 0, 6.5);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !low,
        alpha: true,
        powerPreference: "high-performance",
      });
    } catch {
      return; // no WebGL — the CSS glow behind stays as the fallback
    }
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, low ? 1.3 : 1.8));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    el.appendChild(renderer.domElement);
    renderer.domElement.style.position = "absolute";
    renderer.domElement.style.inset = "0";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";

    // ---- lights -------------------------------------------------------------
    scene.add(new THREE.AmbientLight(0xffffff, 1.3));
    const hemi = new THREE.HemisphereLight(0xcbbcff, 0x0a0a12, 1);
    scene.add(hemi);
    const key = new THREE.DirectionalLight(0xffffff, 2.4);
    key.position.set(3, 5, 6);
    scene.add(key);
    const l1 = new THREE.PointLight(0x8b5cf6, 90, 40);
    l1.position.set(3, 2, 4);
    scene.add(l1);
    const l2 = new THREE.PointLight(0x22d3ee, 70, 40);
    l2.position.set(-4, -1, 3);
    scene.add(l2);
    const l3 = new THREE.PointLight(0x3b82f6, 45, 40);
    l3.position.set(0, 3, -4);
    scene.add(l3);

    // ---- monolith --------------------------------------------------------
    const root = new THREE.Group();
    root.rotation.set(0.12, -0.5, 0);
    root.scale.setScalar(1.05);
    scene.add(root);

    const disposables: { dispose: () => void }[] = [];

    // wireframe energy field
    const fieldGeo = new THREE.IcosahedronGeometry(1, 1);
    const fieldMat = new THREE.MeshBasicMaterial({
      color: 0x8b5cf6,
      wireframe: true,
      transparent: true,
      opacity: 0.1,
    });
    const field = new THREE.Mesh(fieldGeo, fieldMat);
    field.scale.setScalar(2.7);
    root.add(field);
    disposables.push(fieldGeo, fieldMat);

    // inner glow core
    const coreGeo = new THREE.BoxGeometry(1, 1, 1);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x1c1340,
      emissive: 0x7c5cff,
      emissiveIntensity: 1.5,
      roughness: 0.6,
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    core.scale.set(0.58, 1.55, 0.5);
    root.add(core);
    disposables.push(coreGeo, coreMat);

    // stepped glass blocks
    const blocks: { size: [number, number, number]; pos: [number, number, number]; edge: number }[] =
      [
        { size: [1.2, 2.0, 0.92], pos: [0, 0, 0], edge: 0xd8ccff },
        { size: [0.66, 0.5, 1.05], pos: [0.36, 0.98, 0.02], edge: 0xa08bff },
        { size: [1.34, 0.32, 0.62], pos: [-0.1, -1.02, 0.14], edge: 0xa08bff },
      ];
    for (const b of blocks) {
      const g = new THREE.BoxGeometry(...b.size);
      const m = low
        ? new THREE.MeshStandardMaterial({
            color: 0x9a86e6,
            emissive: 0x5b3fb0,
            emissiveIntensity: 0.35,
            metalness: 0.55,
            roughness: 0.3,
            transparent: true,
            opacity: 0.9,
          })
        : new THREE.MeshPhysicalMaterial({
            color: 0xc7ccf5,
            metalness: 0,
            roughness: 0.16,
            transmission: 0.9,
            thickness: 1.5,
            ior: 1.45,
            attenuationColor: new THREE.Color(0x8b5cf6),
            attenuationDistance: 2.2,
            clearcoat: 1,
            clearcoatRoughness: 0.2,
            iridescence: 0.5,
            iridescenceIOR: 1.3,
            transparent: true,
            opacity: 0.92,
          });
      const mesh = new THREE.Mesh(g, m);
      mesh.position.set(...b.pos);
      root.add(mesh);

      const eg = new THREE.EdgesGeometry(g, 15);
      const em = new THREE.LineBasicMaterial({ color: b.edge, transparent: true, opacity: 0.9 });
      const edges = new THREE.LineSegments(eg, em);
      mesh.add(edges);
      disposables.push(g, m, eg, em);
    }

    // glowing "C" on the front face
    const cShape = new THREE.Shape();
    cShape.absarc(0, 0, 0.36, Math.PI * 0.32, Math.PI * 1.68, false);
    cShape.absarc(0, 0, 0.2, Math.PI * 1.68, Math.PI * 0.32, true);
    const cGeo = new THREE.ExtrudeGeometry(cShape, {
      depth: 0.16,
      bevelEnabled: true,
      bevelThickness: 0.02,
      bevelSize: 0.02,
      bevelSegments: 2,
      curveSegments: 32,
    });
    cGeo.center();
    const cMat = new THREE.MeshStandardMaterial({
      color: 0x170d2b,
      emissive: 0x8b5cf6,
      emissiveIntensity: 1.8,
      roughness: 0.3,
      metalness: 0.4,
    });
    const cMesh = new THREE.Mesh(cGeo, cMat);
    cMesh.position.set(0, 0.14, 0.52);
    cMesh.scale.setScalar(1.5);
    root.add(cMesh);
    const cGlowMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.16 });
    const cGlow = new THREE.Mesh(cGeo, cGlowMat);
    cGlow.position.set(0, 0.14, 0.44);
    cGlow.scale.setScalar(1.72);
    root.add(cGlow);
    disposables.push(cGeo, cMat, cGlowMat);

    // particles
    const pCount = low ? 26 : 70;
    const pPos = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount; i++) {
      const r = 2.4 + Math.random() * 2.4;
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(2 * Math.random() - 1);
      pPos[i * 3] = r * Math.sin(ph) * Math.cos(th);
      pPos[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th) * 0.6;
      pPos[i * 3 + 2] = r * Math.cos(ph);
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({
      size: 0.03,
      color: 0xa9b0ff,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true,
      depthWrite: false,
    });
    const points = new THREE.Points(pGeo, pMat);
    scene.add(points);
    disposables.push(pGeo, pMat);

    // ---- interaction ---------------------------------------------------
    const pointer = { x: 0, y: 0 };
    const onMove = (e: PointerEvent) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    if (parallax) window.addEventListener("pointermove", onMove, { passive: true });

    // ---- resize ------------------------------------------------------------
    const resize = () => {
      const w = el.clientWidth || 1;
      const h = el.clientHeight || 1;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(el);

    // ---- loop ------------------------------------------------------------
    const clock = new THREE.Clock();
    let raf = 0;
    let running = true;
    const damp = THREE.MathUtils.damp;

    const tick = () => {
      if (!running) return;
      const dt = Math.min(clock.getDelta(), 0.05);
      const t = clock.elapsedTime;
      const px = parallax ? pointer.x : 0;
      const py = parallax ? pointer.y : 0;
      const sp = scrollProgress?.current ?? 0;

      root.rotation.y = damp(root.rotation.y, -0.4 + px * 0.5 + t * 0.12 + sp * Math.PI * 1.1, 2.4, dt);
      root.rotation.x = damp(root.rotation.x, 0.12 - py * 0.3 + Math.sin(t * 0.3) * 0.04, 2.4, dt);
      root.position.x = damp(root.position.x, px * 0.1, 3, dt);
      root.position.y = damp(root.position.y, 0.05 - py * 0.08 + Math.sin(t * 0.7) * 0.05, 3, dt);

      field.rotation.y -= dt * 0.12;
      field.rotation.x += dt * 0.05;
      points.rotation.y += dt * 0.03;
      cMat.emissiveIntensity = 1.7 + Math.sin(t * 1.5) * 0.4;
      coreMat.emissiveIntensity = 1.2 + Math.sin(t * 1.1) * 0.25;

      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    // pause when tab hidden
    const onVis = () => {
      running = !document.hidden;
      if (running) {
        clock.start();
        raf = requestAnimationFrame(tick);
      }
    };
    document.addEventListener("visibilitychange", onVis);

    const onContextLost = (e: Event) => {
      e.preventDefault();
      running = false;
      cancelAnimationFrame(raf);
    };
    const onContextRestored = () => {
      running = true;
      clock.start();
      raf = requestAnimationFrame(tick);
    };
    const canvasEl = renderer.domElement;
    canvasEl.addEventListener("webglcontextlost", onContextLost, false);
    canvasEl.addEventListener("webglcontextrestored", onContextRestored, false);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      canvasEl.removeEventListener("webglcontextlost", onContextLost);
      canvasEl.removeEventListener("webglcontextrestored", onContextRestored);
      if (parallax) window.removeEventListener("pointermove", onMove);
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
      renderer.forceContextLoss();
      canvasEl.remove();
    };
  }, [reduced, parallax, low, scrollProgress]);

  return (
    <div ref={host} className={className}>
      {/* CSS glow — always present so the spot never reads empty */}
      <div className="pointer-events-none absolute inset-[-10%] bg-[radial-gradient(circle_at_50%_46%,rgba(139,92,246,0.4),rgba(34,211,238,0.12)_46%,transparent_72%)] blur-3xl" />
    </div>
  );
}

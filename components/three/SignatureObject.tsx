"use client";

import VoxelCube from "@/components/hero/VoxelCube";
import type { RefObject } from "react";

type Props = {
  className?: string;
  /** kept for API compatibility; the cube ignores external scroll progress */
  scrollProgress?: RefObject<number> | null;
  withParallax?: boolean;
};

/**
 * The CraftWare signature object — a fractured glass cube (CSS 3D, no WebGL).
 */
export default function SignatureObject({
  className = "",
  withParallax = true,
}: Props) {
  return <VoxelCube className={className} parallax={withParallax} />;
}

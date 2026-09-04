import Image from "next/image";
import type { Project } from "@/content/projects";

/** Screenshot when available, else a legible branded placeholder panel. */
export default function ProjectArt({
  project,
  index,
  className = "",
}: {
  project: Project;
  index?: number;
  className?: string;
}) {
  if (project.image) {
    return (
      <div className={`relative overflow-hidden ${className}`}>
        <Image
          src={project.image}
          alt={`${project.name} — project preview`}
          fill
          sizes="(max-width: 768px) 92vw, 560px"
          className="object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden bg-[linear-gradient(150deg,#fbeef0,#f6e6e8)] ${className}`}
      aria-hidden
    >
      <span className="font-display text-6xl font-bold leading-none tracking-tight text-red/15 sm:text-7xl">
        {typeof index === "number" ? String(index).padStart(2, "0") : "•"}
      </span>
      <span className="absolute left-5 top-5 rounded-full border border-red/15 bg-paper/70 px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] text-red/80">
        {project.industry}
      </span>
    </div>
  );
}

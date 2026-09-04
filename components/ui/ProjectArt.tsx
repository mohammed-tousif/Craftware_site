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
      className={`relative flex flex-col justify-between overflow-hidden bg-[linear-gradient(150deg,#fbeef0,#f6e6e8)] p-6 ${className}`}
      aria-hidden
    >
      {typeof index === "number" ? (
        <span className="font-display text-[13px] font-semibold tracking-[0.14em] text-red/70">
          {String(index).padStart(2, "0")}
        </span>
      ) : (
        <span />
      )}
      <span className="font-display text-xl font-bold leading-tight tracking-tight text-ink/70 sm:text-2xl">
        {project.name}
      </span>
    </div>
  );
}

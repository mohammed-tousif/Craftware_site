import Image from "next/image";
import type { Project } from "@/content/projects";

const wash: Record<Project["accent"], string> = {
  violet:
    "radial-gradient(600px 320px at 30% 22%, rgba(200,16,46,0.14), transparent 62%), linear-gradient(160deg, #fbf1f2, #f4e9ea)",
  blue: "radial-gradient(600px 320px at 30% 22%, rgba(200,16,46,0.1), transparent 62%), linear-gradient(160deg, #f7eef0, #f1e7e8)",
  cyan: "radial-gradient(600px 320px at 30% 22%, rgba(158,12,36,0.12), transparent 62%), linear-gradient(160deg, #faf0f1, #f3e8e9)",
};

/** Screenshot when available, else a branded abstract placeholder. */
export default function ProjectArt({
  project,
  className = "",
}: {
  project: Project;
  className?: string;
}) {
  if (project.image) {
    return (
      <div className={`relative overflow-hidden ${className}`}>
        <Image
          src={project.image}
          alt={`${project.name} — project preview`}
          fill
          sizes="(max-width: 768px) 92vw, 640px"
          className="object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden ${className}`}
      style={{ background: wash[project.accent] }}
      aria-hidden
    >
      <span className="px-6 text-center font-display text-2xl font-bold tracking-tight text-ink/25 sm:text-4xl">
        {project.name.split(" ").slice(0, 2).join(" ").toUpperCase()}
      </span>
    </div>
  );
}

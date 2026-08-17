import Image from "next/image";
import type { Coach } from "@/lib/coaches";

export default function CoachCard({ coach }: { coach: Coach }) {
  return (
    <div className="border border-line bg-surface p-6">
      <div className="relative mb-4 aspect-4/3 overflow-hidden bg-surface2">
        <Image
          src={coach.image}
          alt={coach.name}
          fill
          className="object-contain"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>
      <h3 className="font-display text-xl text-ink">{coach.name}</h3>
      <p className="mt-1 font-mono text-xs uppercase tracking-wide text-accentSoft">
        {coach.specialty}
      </p>
      <p className="mt-3 text-sm text-muted">{coach.bio}</p>
    </div>
  );
}
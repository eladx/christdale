import { getCoaches } from "@/lib/coaches";
import CoachesList from "@/components/CoachesList";

export default async function CoachesPage() {
  const coaches = await getCoaches();

  return (
    <div className="wrap py-16">
      <p className="font-mono text-xs uppercase tracking-widest2 text-accentSoft">
        Coaching
      </p>
      <h1 className="mt-3 font-display text-4xl text-ink md:text-5xl">
        Coaches
      </h1>
      <p className="mt-4 max-w-lg text-muted">
        Every coach here programs for calisthenics specifically — not a
        generic strength template with pull-ups added in.
      </p>

      <CoachesList coaches={coaches} />
    </div>
  );
}

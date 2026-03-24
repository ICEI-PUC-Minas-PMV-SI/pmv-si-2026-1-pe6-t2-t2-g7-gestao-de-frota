import Link from "next/link";
import { TripRoutePlanner } from "@components/map/TripRoutePlanner";

export default function MapsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-950">
      <header className="flex shrink-0 items-center justify-between border-b border-zinc-800 px-6 py-4">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-white">
            Mapa
          </h1>
          <p className="mt-0.5 text-xs text-zinc-500">
            Jornadas · tiles LocationIQ · traçado OSRM (demo)
          </p>
        </div>
        <Link
          href="/dashboard"
          className="text-sm text-zinc-400 transition hover:text-white"
        >
          Dashboard
        </Link>
      </header>

      <main className="flex min-h-0 flex-1 flex-col p-4">
        <TripRoutePlanner className="min-h-0 flex-1" />
      </main>
    </div>
  );
}

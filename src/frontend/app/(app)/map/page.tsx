import { TripRoutePlanner } from "@components/map/TripRoutePlanner";

export default function MapsPage() {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="shrink-0 border-b border-border px-8 py-6">
        <h1 className="text-lg font-semibold tracking-tight text-foreground">
          Mapa
        </h1>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Jornadas · tiles LocationIQ · traçado OSRM (demo)
        </p>
      </header>

      <main className="flex min-h-0 flex-1 flex-col p-4 md:p-6">
        <TripRoutePlanner className="min-h-[min(70vh,560px)] flex-1" />
      </main>
    </div>
  );
}

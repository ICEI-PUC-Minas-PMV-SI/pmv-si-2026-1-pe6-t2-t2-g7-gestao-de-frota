"use client";

import { useMapRoutePlanning } from "../../hooks/useMapRoutePlanning";
import { useTripJourney } from "../../hooks/useTripJourney";
import type { TripWaypoint } from "../../utils/mapRouteUtils";

export type { TripWaypoint };

type TripRoutePlannerProps = {
  className?: string;
};

export function TripRoutePlanner({ className }: TripRoutePlannerProps) {
  const token = process.env.NEXT_PUBLIC_LOCATIONIQ_ACCESS_TOKEN;
  
  const {
    containerRef,
    mapRef,
    leafletRef,
    carLayerGroupRef,
    mapEpoch,
    waypoints,
    setWaypoints,
    removeWaypoint,
    routeStatus,
    clicksAddStops,
    setClicksAddStops,
    fitMapToRoutePreview,
  } = useMapRoutePlanning(token);

  const {
    user,
    tripName,
    setTripName,
    routeStartedAt,
    savedJourneyId,
    journeySaving,
    journeyError,
    geoHint,
    positionApiError,
    startJourney,
    clearPlanningAndJourney,
    copyRouteJson,
  } = useTripJourney(waypoints, setWaypoints, {
    mapRef,
    leafletRef,
    carLayerGroupRef,
    mapEpoch,
  });

  return (
    <div
      className={[
        "flex min-h-0 flex-1 flex-col gap-4 lg:flex-row lg:items-stretch",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <aside className="flex w-full shrink-0 flex-col gap-3 rounded-xl border border-zinc-800 bg-zinc-900/80 p-4 lg:max-w-sm">
        <div>
          <h2 className="text-sm font-semibold text-white">Nova jornada</h2>
          <p className="mt-1 text-xs leading-relaxed text-zinc-500">
            {clicksAddStops
              ? "Clique no mapa para adicionar paradas em ordem."
              : "Modo navegação: arraste o mapa sem adicionar paradas."}
          </p>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-zinc-400">Nome da jornada</span>
          <input
            type="text"
            value={tripName}
            onChange={(e) => setTripName(e.target.value)}
            placeholder="Ex.: Entrega região sul — manhã"
            className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </label>

        <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-300">
          <input
            type="checkbox"
            className="rounded border-zinc-600 bg-zinc-900 text-indigo-500 focus:ring-indigo-500"
            checked={clicksAddStops}
            onChange={(e) => setClicksAddStops(e.target.checked)}
          />
          Cliques adicionam paradas
        </label>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={fitMapToRoutePreview}
            disabled={waypoints.length === 0}
            className="rounded-lg border border-zinc-600 px-3 py-1.5 text-xs font-medium text-zinc-200 transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Ajustar mapa
          </button>
          <button
            type="button"
            onClick={clearPlanningAndJourney}
            disabled={waypoints.length === 0 && !tripName}
            className="rounded-lg border border-red-900/60 px-3 py-1.5 text-xs font-medium text-red-300 transition hover:bg-red-950/50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Limpar tudo
          </button>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              Paradas ({waypoints.length})
            </span>
            {waypoints.length >= 2 && (
              <span className="text-[10px] text-zinc-500">
                {routeStatus === "loading" && "Calculando rota…"}
                {routeStatus === "ok" && "Rota por estradas (OSRM)"}
                {routeStatus === "fallback" && "Linha reta (OSRM indisponível)"}
                {routeStatus === "idle" && ""}
              </span>
            )}
          </div>
          {waypoints.length === 0 ? (
            <p className="rounded-lg border border-dashed border-zinc-700 bg-zinc-950/50 px-3 py-4 text-center text-xs text-zinc-500">
              Nenhuma parada ainda.
            </p>
          ) : (
            <ol className="max-h-48 space-y-2 overflow-y-auto pr-1 text-sm">
              {waypoints.map((w, i) => (
                <li
                  key={w.id}
                  className="flex items-center justify-between gap-2 rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2"
                >
                  <span className="min-w-0 flex-1 text-zinc-300">
                    <span className="font-medium text-indigo-400">{i + 1}.</span>{" "}
                    <span className="font-mono text-xs text-zinc-400">
                      {w.lat.toFixed(5)}, {w.lng.toFixed(5)}
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => removeWaypoint(w.id)}
                    className="shrink-0 rounded px-2 py-0.5 text-xs text-zinc-500 hover:bg-zinc-800 hover:text-red-400"
                    aria-label={`Remover parada ${i + 1}`}
                  >
                    Remover
                  </button>
                </li>
              ))}
            </ol>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={copyRouteJson}
            disabled={waypoints.length === 0}
            className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Copiar rota (JSON)
          </button>
          <button
            type="button"
            onClick={() => void startJourney()}
            disabled={
              waypoints.length < 2 ||
              routeStartedAt !== null ||
              journeySaving ||
              !user
            }
            title={!user ? "É necessário estar logado" : undefined}
            className="rounded-lg border border-emerald-600/70 bg-emerald-950/50 px-4 py-2.5 text-sm font-medium text-emerald-100 transition hover:bg-emerald-900/45 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {journeySaving
              ? "Salvando…"
              : routeStartedAt
                ? "Jornada em curso"
                : "Iniciar jornada"}
          </button>
          {!user && (
            <p className="text-xs text-zinc-500" role="status">
              Inicie sessão para guardar a jornada no servidor.
            </p>
          )}
          {journeyError && (
            <p className="text-xs text-red-400" role="alert">
              {journeyError}
            </p>
          )}
          {routeStartedAt && geoHint && (
            <p className="text-xs text-amber-300/90" role="status">
              {geoHint}
            </p>
          )}
          {routeStartedAt && positionApiError && (
            <p className="text-xs text-red-400" role="alert">
              {positionApiError}
            </p>
          )}
          {routeStartedAt && !geoHint?.includes("Simulação") && (
            <p className="text-xs text-zinc-500" role="status">
              O percurso simulado segue as paradas da jornada no servidor (OSRM ou
              linha entre paradas).
            </p>
          )}
          {routeStartedAt && (
            <p className="text-xs text-emerald-400/90" role="status">
              Jornada iniciada em{" "}
              {new Date(routeStartedAt).toLocaleString("pt-BR", {
                dateStyle: "short",
                timeStyle: "short",
              })}
              {savedJourneyId ? (
                <>
                  {" "}
                  · ID{" "}
                  <span className="font-mono text-emerald-300/90">
                    {savedJourneyId}
                  </span>
                </>
              ) : null}
            </p>
          )}
        </div>
      </aside>

      <div
        ref={containerRef}
        className="min-h-[min(60vh,520px)] w-full min-w-0 flex-1 rounded-xl border border-zinc-800 lg:min-h-0"
      />
    </div>
  );
}

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
    selectedVehicleId,
    setSelectedVehicleId,
    vehicles,
    vehiclesLoading,
    vehiclesError,
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
      <aside className="flex w-full shrink-0 flex-col gap-3 rounded-xl border border-border bg-card p-4 text-foreground lg:max-w-sm">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Nova jornada</h2>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            {clicksAddStops
              ? "Clique no mapa para adicionar paradas em ordem."
              : "Modo navegação: arraste o mapa sem adicionar paradas."}
          </p>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-muted-foreground">Nome da jornada</span>
          <input
            type="text"
            value={tripName}
            onChange={(e) => setTripName(e.target.value)}
            placeholder="Ex.: Entrega região sul — manhã"
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-muted-foreground">
            Veículo da jornada (obrigatório)
          </span>
          <select
            value={selectedVehicleId}
            onChange={(e) => setSelectedVehicleId(e.target.value)}
            disabled={vehiclesLoading || vehicles.length === 0}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
          >
            {vehicles.length === 0 ? (
              <option value="">
                {vehiclesLoading ? "Carregando veículos..." : "Nenhum veículo disponível"}
              </option>
            ) : (
              vehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.marca} {vehicle.modelo} · {vehicle.placa}
                </option>
              ))
            )}
          </select>
        </label>
        {vehiclesError && (
          <p className="text-xs text-red-400" role="alert">
            {vehiclesError}
          </p>
        )}

        <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
          <input
            type="checkbox"
            className="rounded border-border bg-background text-primary focus:ring-primary"
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
            className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition hover:bg-accent hover:text-accent-foreground disabled:cursor-not-allowed disabled:opacity-40"
          >
            Ajustar mapa
          </button>
          <button
            type="button"
            onClick={clearPlanningAndJourney}
            disabled={waypoints.length === 0 && !tripName}
            className="rounded-lg border border-red-500/40 bg-red-500/5 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-500/10 dark:text-red-300 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Limpar tudo
          </button>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Paradas ({waypoints.length})
            </span>
            {waypoints.length >= 2 && (
              <span className="text-[10px] text-muted-foreground">
                {routeStatus === "loading" && "Calculando rota…"}
                {routeStatus === "ok" && "Rota por estradas (OSRM)"}
                {routeStatus === "fallback" && "Linha reta (OSRM indisponível)"}
                {routeStatus === "idle" && ""}
              </span>
            )}
          </div>
          {waypoints.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border bg-background px-3 py-4 text-center text-xs text-muted-foreground">
              Nenhuma parada ainda.
            </p>
          ) : (
            <ol className="max-h-48 space-y-2 overflow-y-auto pr-1 text-sm">
              {waypoints.map((w, i) => (
                <li
                  key={w.id}
                  className="flex items-center justify-between gap-2 rounded-lg border border-border bg-background px-3 py-2"
                >
                  <span className="min-w-0 flex-1 text-foreground">
                    <span className="font-medium text-primary">{i + 1}.</span>{" "}
                    <span className="font-mono text-xs text-muted-foreground">
                      {w.lat.toFixed(5)}, {w.lng.toFixed(5)}
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => removeWaypoint(w.id)}
                    className="shrink-0 rounded px-2 py-0.5 text-xs text-muted-foreground transition hover:bg-accent hover:text-red-500 dark:hover:text-red-300"
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
            className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
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
              !user ||
              !selectedVehicleId
            }
            title={!user ? "É necessário estar logado" : undefined}
            className="rounded-lg border border-primary/35 bg-primary/12 px-4 py-2.5 text-sm font-medium text-primary transition hover:bg-primary/18 disabled:cursor-not-allowed disabled:opacity-40 dark:border-primary/30 dark:bg-primary/15"
          >
            {journeySaving
              ? "Salvando…"
              : routeStartedAt
                ? "Jornada em curso"
                : "Iniciar jornada"}
          </button>
          {!user && (
            <p className="text-xs text-muted-foreground" role="status">
              Inicie sessão para guardar a jornada no servidor.
            </p>
          )}
          {journeyError && (
            <p className="text-xs text-red-400" role="alert">
              {journeyError}
            </p>
          )}
          {routeStartedAt && geoHint && (
            <p className="text-xs text-primary/90" role="status">
              {geoHint}
            </p>
          )}
          {routeStartedAt && positionApiError && (
            <p className="text-xs text-red-400" role="alert">
              {positionApiError}
            </p>
          )}
          {routeStartedAt && !geoHint?.includes("Simulação") && (
            <p className="text-xs text-muted-foreground" role="status">
              O percurso simulado segue as paradas da jornada no servidor (OSRM ou
              linha entre paradas).
            </p>
          )}
          {routeStartedAt && (
            <p className="text-xs text-primary/90" role="status">
              Jornada iniciada em{" "}
              {new Date(routeStartedAt).toLocaleString("pt-BR", {
                dateStyle: "short",
                timeStyle: "short",
              })}
              {savedJourneyId ? (
                <>
                  {" "}
                  · ID{" "}
                  <span className="font-mono text-primary">
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
        className="min-h-[min(60vh,520px)] w-full min-w-0 flex-1 rounded-xl border border-border lg:min-h-0"
      />
    </div>
  );
}

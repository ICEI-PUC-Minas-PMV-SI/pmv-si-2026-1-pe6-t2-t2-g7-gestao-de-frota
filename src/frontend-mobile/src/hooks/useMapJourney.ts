import { useCallback, useEffect, useRef, useState } from "react";
import { notifyApiError, notifySuccess, showToast } from "../components/ui/toast";
import { getApiErrorMessage } from "../utils/apiError";

import { useAuthorizedToken } from "./useAuthorizedToken";
import { useLiveLocation } from "./useLiveLocation";
import { journeyModule } from "../core/modules/journeys/journeys";
import { vehicleModule } from "../core/modules/vehicles/vehicles";
import type { Vehicle } from "../core/modules/vehicles/vehicles";
import {
  densifyStops,
  fetchDrivingPath,
  mapPointsToTuples,
  tupleToMapPoint,
  type LatLngTuple,
} from "../utils/mapRouteUtils";

export type MapPoint = { latitude: number; longitude: number };

export type RoutePreviewStatus = "idle" | "loading" | "ok" | "fallback";

const MIN_PARADAS = 2;
const SIMULATION_TICK_MS = 1100;

export function useMapJourney() {
  const getToken = useAuthorizedToken();
  const live = useLiveLocation(true);
  const [vehicleId, setVehicleId] = useState<string | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loadingVehicles, setLoadingVehicles] = useState(true);
  const [journeyId, setJourneyId] = useState<string | null>(null);
  const [plannedStops, setPlannedStops] = useState<MapPoint[]>([]);
  const [routePreview, setRoutePreview] = useState<MapPoint[]>([]);
  const [routePreviewStatus, setRoutePreviewStatus] =
    useState<RoutePreviewStatus>("idle");
  const [simulationPath, setSimulationPath] = useState<MapPoint[]>([]);
  const [trail, setTrail] = useState<MapPoint[]>([]);
  const [vehiclePosition, setVehiclePosition] = useState<MapPoint | null>(null);
  const [geoHint, setGeoHint] = useState<string | null>(null);
  const [positionError, setPositionError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const simIndexRef = useRef(0);
  const positionErrorToastRef = useRef(false);

  useEffect(() => {
    (async () => {
      setLoadingVehicles(true);
      try {
        const idToken = await getToken();
        const res = await vehicleModule.gateways.list.exec({ idToken });
        setVehicles(res.body);
        setVehicleId((current) => current ?? res.body[0]?.id ?? null);
      } catch (err: unknown) {
        setVehicles([]);
        notifyApiError(err, "Não foi possível carregar os veículos.");
      } finally {
        setLoadingVehicles(false);
      }
    })();
  }, [getToken]);

  const gpsToastShownRef = useRef(false);
  useEffect(() => {
    const message =
      live.status === "denied"
        ? "Permissão de localização negada."
        : live.status === "error" && live.error
          ? live.error
          : null;
    if (message && !gpsToastShownRef.current) {
      gpsToastShownRef.current = true;
      showToast({ message, tone: "error" });
    }
  }, [live.status, live.error]);

  useEffect(() => {
    if (journeyId || plannedStops.length < MIN_PARADAS) {
      setRoutePreview([]);
      setRoutePreviewStatus(plannedStops.length < MIN_PARADAS ? "idle" : "idle");
      return;
    }

    let cancelled = false;
    const stops = mapPointsToTuples(plannedStops);

    setRoutePreviewStatus("loading");

    void (async () => {
      const path = await fetchDrivingPath(stops);
      if (cancelled) return;

      if (path && path.length > 1) {
        setRoutePreview(path.map(tupleToMapPoint));
        setRoutePreviewStatus("ok");
      } else {
        setRoutePreview(stops.map(tupleToMapPoint));
        setRoutePreviewStatus("fallback");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [plannedStops, journeyId]);

  useEffect(() => {
    if (!journeyId || simulationPath.length < 2) return;

    const activeJourneyId = journeyId;
    const path = simulationPath;

    simIndexRef.current = 0;
    setGeoHint(null);
    setPositionError(null);

    async function advance() {
      const idx = simIndexRef.current;
      if (idx >= path.length) return;
      const pt = path[idx]!;
      simIndexRef.current = idx + 1;
      setVehiclePosition(pt);
      setTrail((t) => [...t, pt]);
      try {
        const idToken = await getToken();
        await journeyModule.gateways.recordPosition.exec({
          idToken,
          journeyId: activeJourneyId,
          latitude: pt.latitude,
          longitude: pt.longitude,
        });
        setPositionError(null);
        positionErrorToastRef.current = false;
      } catch (err: unknown) {
        const msg = getApiErrorMessage(err) || "Erro ao registrar posição.";
        setPositionError(msg);
        if (positionErrorToastRef.current) return;
        positionErrorToastRef.current = true;
        showToast({ message: msg, tone: "error" });
      }
    }

    function onTick() {
      if (simIndexRef.current >= path.length) {
        clearInterval(intervalId);
        void (async () => {
          try {
            const idToken = await getToken();
            await journeyModule.gateways.complete.exec({
              idToken,
              journeyId: activeJourneyId,
            });
            setGeoHint(
              "Simulação concluída e jornada finalizada automaticamente.",
            );
            notifySuccess("Jornada concluída com sucesso.");
            setJourneyId(null);
            setSimulationPath([]);
            setVehiclePosition(null);
          } catch (err: unknown) {
            const msg = "Simulação concluída, mas não foi possível finalizar a jornada na API.";
            setGeoHint(msg);
            notifyApiError(err, msg);
          }
        })();
        return;
      }
      void advance();
    }

    void advance();
    const intervalId = setInterval(onTick, SIMULATION_TICK_MS);

    return () => clearInterval(intervalId);
  }, [journeyId, simulationPath, getToken]);

  const addPlannedStop = useCallback((latitude: number, longitude: number) => {
    if (journeyId) return;
    setPlannedStops((s) => [...s, { latitude, longitude }]);
  }, [journeyId]);

  const addCurrentLocationStop = useCallback(() => {
    if (journeyId || !live.coords) return;
    addPlannedStop(live.coords.latitude, live.coords.longitude);
  }, [journeyId, live.coords, addPlannedStop]);

  const removeLastPlannedStop = useCallback(() => {
    if (journeyId) return;
    setPlannedStops((s) => s.slice(0, -1));
  }, [journeyId]);

  const clearPlannedStops = useCallback(() => {
    if (journeyId) return;
    setPlannedStops([]);
    setRoutePreview([]);
    setRoutePreviewStatus("idle");
  }, [journeyId]);

  const canStartJourney = Boolean(
    vehicleId && plannedStops.length >= MIN_PARADAS && !journeyId,
  );

  const onStart = useCallback(async () => {
    if (!vehicleId) {
      showToast({
        message: "Selecione um veículo para iniciar a jornada.",
        tone: "error",
      });
      return;
    }
    if (plannedStops.length < MIN_PARADAS) {
      showToast({
        message: `Marque pelo menos ${MIN_PARADAS} paradas no mapa.`,
        tone: "error",
      });
      return;
    }
    setBusy(true);
    try {
      const idToken = await getToken();
      const paradasPayload = plannedStops.map((p, i) => ({
        ordem: i + 1,
        latitude: p.latitude,
        longitude: p.longitude,
      }));
      const res = await journeyModule.gateways.create.exec({
        idToken,
        vehicleId,
        paradas: paradasPayload,
      });

      const ordered = [...(res.body.paradas ?? [])].sort(
        (a, b) => a.ordem - b.ordem,
      );
      const stopsFromApi: LatLngTuple[] = ordered.map((p) => [
        p.latitude,
        p.longitude,
      ]);
      const osrmPath = await fetchDrivingPath(stopsFromApi);
      const pathTuples = osrmPath ?? densifyStops(stopsFromApi);
      const pathPoints = pathTuples.map(tupleToMapPoint);

      setJourneyId(res.body.id);
      setPlannedStops([]);
      setRoutePreview([]);
      setRoutePreviewStatus("idle");
      setSimulationPath(pathPoints);
      setTrail(pathPoints.length ? [pathPoints[0]!] : []);
      setVehiclePosition(pathPoints[0] ?? null);
      notifySuccess("Jornada iniciada.");
    } catch {
      // Toast exibido pelo AxiosAdapter.
    } finally {
      setBusy(false);
    }
  }, [vehicleId, plannedStops, getToken]);

  const onStop = useCallback(async () => {
    if (!journeyId) return;
    setBusy(true);
    try {
      simIndexRef.current = simulationPath.length; // prevent auto-complete race
      const idToken = await getToken();
      await journeyModule.gateways.complete.exec({ idToken, journeyId });
      setJourneyId(null);
      setSimulationPath([]);
      setTrail([]);
      setVehiclePosition(null);
      setGeoHint(null);
      setPositionError(null);
      simIndexRef.current = 0;
      notifySuccess("Jornada concluída com sucesso.");
    } catch {
      // Toast exibido pelo AxiosAdapter.
    } finally {
      setBusy(false);
    }
  }, [journeyId, getToken]);

  const routePolyline = journeyId
    ? simulationPath
    : routePreview.length >= 2
      ? routePreview
      : plannedStops;

  return {
    live,
    journeyId,
    trail,
    plannedStops,
    routePreview,
    routePreviewStatus,
    routePolyline,
    vehiclePosition,
    geoHint,
    positionError,
    vehicles,
    vehicleId,
    loadingVehicles,
    setVehicleId,
    addPlannedStop,
    addCurrentLocationStop,
    removeLastPlannedStop,
    clearPlannedStops,
    canStartJourney,
    busy,
    onStart,
    onStop,
  };
}
import { useCallback, useEffect, useRef, useState } from "react";
import { Alert } from "react-native";

import { useAuthorizedToken } from "./useAuthorizedToken";
import { useLiveLocation } from "./useLiveLocation";
import { journeyModule } from "../core/modules/journeys/journeys";
import { vehicleModule } from "../core/modules/vehicles/vehicles";
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

  useEffect(() => {
    (async () => {
      try {
        const idToken = await getToken();
        const res = await vehicleModule.gateways.list.exec({ idToken });
        if (res.body[0]) setVehicleId(res.body[0].id);
      } catch {
        // ignore
      }
    })();
  }, [getToken]);

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
    setGeoHint(
      "Simulação: o veículo percorre a rota OSRM entre as paradas (como no painel web).",
    );
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
      } catch (err: unknown) {
        setPositionError(
          err instanceof Error ? err.message : "Erro ao registrar posição.",
        );
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
            setJourneyId(null);
            setSimulationPath([]);
            setVehiclePosition(null);
          } catch {
            setGeoHint(
              "Simulação concluída, mas não foi possível finalizar a jornada na API.",
            );
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
      Alert.alert(
        "Sem veículo",
        "Cadastre um veículo na web antes de iniciar uma jornada.",
      );
      return;
    }
    if (plannedStops.length < MIN_PARADAS) {
      Alert.alert(
        "Paradas insuficientes",
        `Marque pelo menos ${MIN_PARADAS} paradas no mapa.`,
      );
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
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Não foi possível iniciar a jornada.";
      Alert.alert("Erro", message);
    } finally {
      setBusy(false);
    }
  }, [vehicleId, plannedStops, getToken]);

  const onStop = useCallback(async () => {
    if (!journeyId) return;
    setBusy(true);
    try {
      const idToken = await getToken();
      await journeyModule.gateways.complete.exec({ idToken, journeyId });
      setJourneyId(null);
      setSimulationPath([]);
      setTrail([]);
      setVehiclePosition(null);
      setGeoHint(null);
      setPositionError(null);
      simIndexRef.current = 0;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Não foi possível encerrar.";
      Alert.alert("Erro", message);
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
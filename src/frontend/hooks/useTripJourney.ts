"use client";

import axios from "axios";
import type { LatLngTuple } from "leaflet";
import type { Dispatch, RefObject, SetStateAction } from "react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useAuth } from "@context/auth.context";
import { journeyModule } from "@core/modules/journeys/journeys";
import {
  densifyStops,
  fetchDrivingPath,
  type TripWaypoint,
} from "../utils/mapRouteUtils";

function formatPositionApiError(e: unknown): string {
  if (axios.isAxiosError(e)) {
    const raw = e.response?.data as { message?: string | string[] } | undefined;
    const m = raw?.message;
    if (Array.isArray(m)) return m.join(", ");
    if (typeof m === "string") return m;
    return `Erro ao falar com o servidor (${e.response?.status ?? "?"})`;
  }
  return "Não foi possível enviar a posição.";
}

function carDivIcon(L: typeof import("leaflet")) {
  return L.divIcon({
    className: "",
    html: `<div style="font-size:28px;line-height:1;display:flex;align-items:center;justify-content:center;pointer-events:none;filter:drop-shadow(0 2px 4px rgba(0,0,0,.5))" role="img" aria-label="Veículo">🚗</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
}

export type UseTripJourneyMapRefs = {
  mapRef: RefObject<import("leaflet").Map | null>;
  leafletRef: RefObject<typeof import("leaflet") | null>;
  carLayerGroupRef: RefObject<import("leaflet").LayerGroup | null>;
  mapEpoch: number;
};

/**
 * Cria jornada no backend, simula envio de posições ao longo da rota e atualiza o marcador do veículo no mapa.
 */
export function useTripJourney(
  waypoints: TripWaypoint[],
  setWaypoints: Dispatch<SetStateAction<TripWaypoint[]>>,
  map: UseTripJourneyMapRefs,
) {
  const { user } = useAuth();
  const { mapRef, leafletRef, carLayerGroupRef, mapEpoch } = map;

  const simIndexRef = useRef(0);

  const [tripName, setTripName] = useState("");
  const [routeStartedAt, setRouteStartedAt] = useState<string | null>(null);
  const [journeySaving, setJourneySaving] = useState(false);
  const [journeyError, setJourneyError] = useState<string | null>(null);
  const [savedJourneyId, setSavedJourneyId] = useState<string | null>(null);
  const [vehicleFromServer, setVehicleFromServer] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [geoHint, setGeoHint] = useState<string | null>(null);
  const [positionApiError, setPositionApiError] = useState<string | null>(null);
  const [simulationPath, setSimulationPath] = useState<LatLngTuple[]>([]);

  useEffect(function clearJourneySimulationWhenWaypointsBelowMinimum() {
    if (waypoints.length < 2) {
      setRouteStartedAt(null);
      setSavedJourneyId(null);
      setVehicleFromServer(null);
      setSimulationPath([]);
    }
  }, [waypoints]);

  useEffect(function simulateVehiclePathAndRecordPositions() {
    if (
      !savedJourneyId ||
      !routeStartedAt ||
      !user ||
      simulationPath.length < 2
    ) {
      return;
    }

    const firebaseUser = user;
    const activeJourneyId = savedJourneyId;

    simIndexRef.current = 0;
    setGeoHint(
      "Simulação: o veículo percorre a rota entre as paradas registadas na jornada (sem rastreio de GPS).",
    );
    setPositionApiError(null);

    const tickMs = 1100;
    const path = simulationPath;

    async function advanceSimulationAndSendPosition() {
      const idx = simIndexRef.current;
      if (idx >= path.length) return;
      const pt = path[idx]!;
      const [lat, lng] = pt;
      simIndexRef.current = idx + 1;
      setVehicleFromServer({ lat, lng });
      try {
        const idToken = await firebaseUser.getIdToken();
        await journeyModule.gateways.recordPosition.exec({
          idToken,
          journeyId: activeJourneyId,
          latitude: lat,
          longitude: lng,
        });
        setPositionApiError(null);
      } catch (e) {
        setPositionApiError(formatPositionApiError(e));
      }
    }

    let intervalId: ReturnType<typeof setInterval> | undefined;

    function onSimulationTimer() {
      if (simIndexRef.current >= path.length) {
        if (intervalId !== undefined) clearInterval(intervalId);
        setGeoHint(
          "Simulação concluída — veículo na última parada. Limpe a rota para planear outra jornada.",
        );
        return;
      }
      void advanceSimulationAndSendPosition();
    }

    void advanceSimulationAndSendPosition();
    intervalId = setInterval(onSimulationTimer, tickMs);

    return function clearSimulationInterval() {
      if (intervalId !== undefined) clearInterval(intervalId);
    };
  }, [savedJourneyId, routeStartedAt, user, simulationPath]);

  useEffect(function renderVehicleMarkerAndPanMap() {
    const L = leafletRef.current;
    const carGroup = carLayerGroupRef.current;
    const leafletMap = mapRef.current;
    if (!L || !carGroup || mapEpoch === 0) return;

    carGroup.clearLayers();
    if (!vehicleFromServer) return;

    const icon = carDivIcon(L);
    const marker = L.marker([vehicleFromServer.lat, vehicleFromServer.lng], {
      icon,
      zIndexOffset: 1000,
    });
    marker.bindTooltip("Veículo (simulação ao longo da rota)", {
      direction: "top",
    });
    marker.addTo(carGroup);
    leafletMap?.panTo([vehicleFromServer.lat, vehicleFromServer.lng], {
      animate: true,
      duration: 0.35,
    });
  }, [
    vehicleFromServer,
    mapEpoch,
    leafletRef,
    carLayerGroupRef,
    mapRef,
  ]);

  const clearPlanningAndJourney = useCallback(() => {
    setWaypoints([]);
    setTripName("");
    setRouteStartedAt(null);
    setSavedJourneyId(null);
    setJourneyError(null);
    setVehicleFromServer(null);
    setGeoHint(null);
    setPositionApiError(null);
    setSimulationPath([]);
  }, [setWaypoints]);

  const startJourney = useCallback(async () => {
    if (!user) {
      setJourneyError("Faça login para iniciar uma jornada.");
      return;
    }
    if (waypoints.length < 2) return;

    setJourneyError(null);
    setJourneySaving(true);
    try {
      const idToken = await user.getIdToken();
      const nome = tripName.trim() || undefined;
      const paradas = waypoints.map((w, i) => ({
        ordem: i + 1,
        latitude: w.lat,
        longitude: w.lng,
      }));

      const res = await journeyModule.gateways.create.exec({
        idToken,
        nome,
        paradas,
      });

      if (res.status !== 201 || !res.body?.id) {
        throw new Error("Resposta inválida da API");
      }

      const ordered = [...res.body.paradas].sort(
        (a, b) => a.ordem - b.ordem,
      );
      const stopsFromApi: LatLngTuple[] = ordered.map((p) => [
        p.latitude,
        p.longitude,
      ]);
      const path =
        (await fetchDrivingPath(stopsFromApi)) ?? densifyStops(stopsFromApi);

      setSimulationPath(path);
      setSavedJourneyId(res.body.id);
      setRouteStartedAt(res.body.iniciadaEm);
    } catch {
      setJourneyError(
        "Não foi possível iniciar a jornada. Confira se está logado e se o backend está em execução.",
      );
    } finally {
      setJourneySaving(false);
    }
  }, [user, waypoints, tripName]);

  const copyRouteJson = useCallback(() => {
    const payload = {
      nome: tripName.trim() || undefined,
      paradas: waypoints.map((w, i) => ({
        ordem: i + 1,
        latitude: w.lat,
        longitude: w.lng,
      })),
      criadoEm: new Date().toISOString(),
    };
    void navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
  }, [tripName, waypoints]);

  return {
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
  };
}

"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import type { LatLngTuple } from "leaflet";
import {
  fetchDrivingPath,
  type TripWaypoint,
} from "../utils/mapRouteUtils";

export type RoutePreviewStatus = "idle" | "loading" | "ok" | "fallback";

/**
 * Mapa Leaflet + paradas + pré-visualização de rota (OSRM ou linha entre pontos).
 * Corresponde à fase de planeamento antes de persistir a jornada no backend.
 */
export function useMapRoutePlanning(locationIqToken: string | undefined) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);
  const layerGroupRef = useRef<import("leaflet").LayerGroup | null>(null);
  const carLayerGroupRef = useRef<import("leaflet").LayerGroup | null>(null);
  const leafletRef = useRef<typeof import("leaflet") | null>(null);

  const clicksAddStopsRef = useRef(true);
  const [clicksAddStops, setClicksAddStops] = useState(true);
  useEffect(function syncClicksAddStopsRefFromState() {
    clicksAddStopsRef.current = clicksAddStops;
  }, [clicksAddStops]);

  const [waypoints, setWaypoints] = useState<TripWaypoint[]>([]);
  const [routeStatus, setRouteStatus] = useState<RoutePreviewStatus>("idle");
  const [mapEpoch, setMapEpoch] = useState(0);

  const addWaypoint = useCallback((lat: number, lng: number) => {
    setWaypoints((prev) => [
      ...prev,
      { id: crypto.randomUUID(), lat, lng },
    ]);
  }, []);

  const addWaypointRef = useRef(addWaypoint);
  addWaypointRef.current = addWaypoint;

  useEffect(function mountLeafletMapWithTilesAndHandlers() {
    if (!containerRef.current || !locationIqToken) return;

    const locationIqKey = locationIqToken;
    let cancelled = false;
    const el = containerRef.current;

    async function loadLeafletAndInitMap() {
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");
      leafletRef.current = L;

      if (cancelled || !el.isConnected) return;

      const map = L.map(el, { zoomControl: true }).setView(
        [-14.235, -51.9253],
        5,
      );
      mapRef.current = map;

      L.tileLayer(
        `https://{s}-tiles.locationiq.com/v3/streets/r/{z}/{x}/{y}.png?key=${encodeURIComponent(locationIqKey)}`,
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://locationiq.com">LocationIQ</a>',
          maxZoom: 19,
          subdomains: ["a", "b", "c"],
        },
      ).addTo(map);

      const group = L.layerGroup().addTo(map);
      layerGroupRef.current = group;
      const carGroup = L.layerGroup().addTo(map);
      carLayerGroupRef.current = carGroup;

      map.on("click", (e: { latlng: { lat: number; lng: number } }) => {
        if (!clicksAddStopsRef.current) return;
        addWaypointRef.current(e.latlng.lat, e.latlng.lng);
      });

      if (typeof navigator !== "undefined" && "geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            if (cancelled) return;
            map.setView([pos.coords.latitude, pos.coords.longitude], 12);
          },
          () => {},
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
        );
      }

      if (!cancelled) {
        setMapEpoch((n) => n + 1);
      }
    }

    void loadLeafletAndInitMap();

    return function cleanupLeafletMap() {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      layerGroupRef.current = null;
      carLayerGroupRef.current = null;
      leafletRef.current = null;
    };
  }, [locationIqToken]);

  useEffect(function drawStopMarkersAndRoutePreview() {
    const map = mapRef.current;
    const L = leafletRef.current;
    const group = layerGroupRef.current;
    if (!map || !L || !group || mapEpoch === 0) return;

    const leaflet = L;
    const layerGroup = group;

    let cancelled = false;

    layerGroup.clearLayers();

    const latlngs: LatLngTuple[] = waypoints.map((w) => [w.lat, w.lng]);

    waypoints.forEach((w, i) => {
      leaflet.circleMarker([w.lat, w.lng], {
        radius: 11,
        color: "#a5b4fc",
        weight: 2,
        fillColor: "#4f46e5",
        fillOpacity: 0.95,
      })
        .bindTooltip(String(i + 1), { permanent: true, direction: "center" })
        .bindPopup(`Parada ${i + 1}`)
        .addTo(layerGroup);
    });

    if (latlngs.length < 2) {
      setRouteStatus("idle");
      return function cancelRoutePreviewDraw() {
        cancelled = true;
      };
    }

    setRouteStatus("loading");

    async function fetchAndDrawRoutePolyline() {
      const path = await fetchDrivingPath(latlngs);
      if (cancelled) return;

      if (path && path.length > 1) {
        leaflet.polyline(path, {
          color: "#818cf8",
          weight: 5,
          opacity: 0.92,
          lineJoin: "round",
        }).addTo(layerGroup);
        setRouteStatus("ok");
      } else {
        leaflet.polyline(latlngs, {
          color: "#71717a",
          weight: 4,
          opacity: 0.85,
          dashArray: "10 14",
        }).addTo(layerGroup);
        setRouteStatus("fallback");
      }
    }

    void fetchAndDrawRoutePolyline();

    return function cancelRoutePreviewDraw() {
      cancelled = true;
    };
  }, [waypoints, mapEpoch]);

  const removeWaypoint = useCallback((id: string) => {
    setWaypoints((prev) => prev.filter((w) => w.id !== id));
  }, []);

  const fitMapToRoutePreview = useCallback(() => {
    const map = mapRef.current;
    const L = leafletRef.current;
    if (!map || !L || waypoints.length === 0) return;
    const bounds = L.latLngBounds(waypoints.map((w) => [w.lat, w.lng]));
    map.fitBounds(bounds.pad(0.12));
  }, [waypoints]);

  return {
    containerRef,
    mapRef,
    leafletRef,
    layerGroupRef,
    carLayerGroupRef,
    mapEpoch,
    waypoints,
    setWaypoints,
    addWaypoint,
    removeWaypoint,
    routeStatus,
    clicksAddStops,
    setClicksAddStops,
    fitMapToRoutePreview,
  };
}

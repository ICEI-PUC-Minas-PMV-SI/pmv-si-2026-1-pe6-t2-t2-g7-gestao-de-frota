import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { LayerGroup, Map, Marker, Polyline } from "leaflet";

import { JourneyMapOverlay } from "../components/map/JourneyMapOverlay";
import { ModuleHeader } from "../components/ui/ModuleHeader";
import { useMapJourney } from "../hooks/useMapJourney";
import { loadLeaflet } from "../lib/loadLeaflet.web";

const DEFAULT_CENTER: [number, number] = [-14.235, -51.9253];

export default function MapJourneyScreen() {
  const insets = useSafeAreaInsets();
  const {
    live,
    journeyId,
    trail,
    plannedStops,
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
  } = useMapJourney();

  const mapElRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Map | null>(null);
  const userMarkerRef = useRef<Marker | null>(null);
  const carMarkerRef = useRef<Marker | null>(null);
  const routeLayerRef = useRef<LayerGroup | null>(null);
  const stopsLayerRef = useRef<LayerGroup | null>(null);
  const addPlannedStopRef = useRef(addPlannedStop);
  addPlannedStopRef.current = addPlannedStop;

  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  const isLoading =
    live.status === "asking" || (live.status === "idle" && !live.coords);
  const isDenied = live.status === "denied" || live.status === "error";
  const canShowMap = !isLoading && !isDenied;

  useEffect(() => {
    if (!canShowMap) return;
    const el = mapElRef.current;
    if (!el) return;
    let cancelled = false;

    void loadLeaflet()
      .then((L) => {
        if (cancelled || !el.isConnected || mapRef.current) return;

        const map = L.map(el, { zoomControl: true }).setView(DEFAULT_CENTER, 5);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 19,
        }).addTo(map);
        mapRef.current = map;
        routeLayerRef.current = L.layerGroup().addTo(map);
        stopsLayerRef.current = L.layerGroup().addTo(map);
        setMapReady(true);
        setMapError(null);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setMapError(
          err instanceof Error ? err.message : "Não foi possível carregar o mapa.",
        );
      });

    return () => {
      cancelled = true;
      setMapReady(false);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      userMarkerRef.current = null;
      carMarkerRef.current = null;
      routeLayerRef.current = null;
      stopsLayerRef.current = null;
    };
  }, [canShowMap]);

  useEffect(() => {
    if (!mapReady || !mapRef.current || journeyId) return;
    const map = mapRef.current;
    const handler = (e: { latlng: { lat: number; lng: number } }) => {
      addPlannedStopRef.current(e.latlng.lat, e.latlng.lng);
    };
    map.on("click", handler);
    return () => {
      map.off("click", handler);
    };
  }, [mapReady, journeyId]);

  useEffect(() => {
    if (!canShowMap || !mapReady || !mapRef.current) return;
    let cancelled = false;

    void loadLeaflet().then((L) => {
      if (cancelled || !mapRef.current) return;

      const coords = live.coords;
      if (coords && !journeyId) {
        const point: [number, number] = [coords.latitude, coords.longitude];
        if (!userMarkerRef.current) {
          userMarkerRef.current = L.circleMarker(point, {
            radius: 6,
            color: "#16a34a",
            fillColor: "#22c55e",
            fillOpacity: 0.9,
          }).addTo(mapRef.current);
        } else {
          userMarkerRef.current.setLatLng(point);
        }
      } else if (userMarkerRef.current) {
        userMarkerRef.current.remove();
        userMarkerRef.current = null;
      }
    });

    return () => {
      cancelled = true;
    };
  }, [canShowMap, mapReady, live.coords, journeyId]);

  useEffect(() => {
    if (!mapReady || !mapRef.current || !routeLayerRef.current || !stopsLayerRef.current)
      return;
    let cancelled = false;

    void loadLeaflet().then((L) => {
      if (
        cancelled ||
        !mapRef.current ||
        !routeLayerRef.current ||
        !stopsLayerRef.current
      )
        return;

      routeLayerRef.current.clearLayers();
      stopsLayerRef.current.clearLayers();

      if (!journeyId) {
        plannedStops.forEach((p, i) => {
          L.circleMarker([p.latitude, p.longitude], {
            radius: 9,
            color: "#a5b4fc",
            weight: 2,
            fillColor: "#4f46e5",
            fillOpacity: 0.95,
          })
            .bindTooltip(String(i + 1), { permanent: true, direction: "center" })
            .addTo(stopsLayerRef.current!);
        });
      }

      if (routePolyline.length >= 2) {
        const pts = routePolyline.map(
          (p) => [p.latitude, p.longitude] as [number, number],
        );
        const isOsrm =
          !journeyId &&
          (routePreviewStatus === "ok" || routePreviewStatus === "fallback");
        const isActiveRoute = Boolean(journeyId);

        L.polyline(pts, {
          color: isActiveRoute || routePreviewStatus === "ok" ? "#818cf8" : "#71717a",
          weight: isActiveRoute ? 5 : 4,
          opacity: 0.92,
          dashArray:
            routePreviewStatus === "fallback" && !journeyId ? "10 14" : undefined,
          lineJoin: "round",
        }).addTo(routeLayerRef.current!);
      }

      if (trail.length > 1 && journeyId) {
        const trailPts = trail.map(
          (p) => [p.latitude, p.longitude] as [number, number],
        );
        L.polyline(trailPts, {
          color: "#1a237e",
          weight: 3,
          opacity: 0.7,
        }).addTo(routeLayerRef.current!);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [
    mapReady,
    plannedStops,
    routePolyline,
    routePreviewStatus,
    trail,
    journeyId,
  ]);

  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    let cancelled = false;

    void loadLeaflet().then((L) => {
      if (cancelled || !mapRef.current) return;

      if (vehiclePosition) {
        const point: [number, number] = [
          vehiclePosition.latitude,
          vehiclePosition.longitude,
        ];
        const icon = L.divIcon({
          className: "",
          html: `<div style="width:44px;height:44px;border-radius:22px;background:#1a237e;border:2.5px solid #fff;box-shadow:0 6px 14px rgba(26,35,126,0.32);display:flex;align-items:center;justify-content:center;pointer-events:none"><svg xmlns="http://www.w3.org/2000/svg" width="21" height="21" viewBox="0 0 512 512" fill="#ffffff"><path d="M447.68 220.78 392.68 96.11A32 32 0 0 0 362.67 80H149.33a32 32 0 0 0-30.99 16.11L63.32 220.78A64 64 0 0 0 32 276.47V400a16 16 0 0 0 16 16h32a16 16 0 0 0 16-16v-16h320v16a16 16 0 0 0 16 16h32a16 16 0 0 0 16-16V276.47a64 64 0 0 0-31.32-55.69ZM149.33 112h213.34l39.47 96H109.86ZM80 400v-16h352v16Zm0-96V276.47a16 16 0 0 1 7.83-13.77l.09-.06 14.14-7.64v112Zm352 0V256.6l14.09 7.65.09.06A16 16 0 0 1 464 276.47V304Z"/><circle cx="144" cy="288" r="32"/><circle cx="368" cy="288" r="32"/></svg></div>`,
          iconSize: [44, 44],
          iconAnchor: [22, 22],
        });
        if (!carMarkerRef.current) {
          carMarkerRef.current = L.marker(point, {
            icon,
            zIndexOffset: 1000,
          }).addTo(mapRef.current);
        } else {
          carMarkerRef.current.setLatLng(point);
        }
        mapRef.current.panTo(point, { animate: true, duration: 0.35 });
      } else if (carMarkerRef.current) {
        carMarkerRef.current.remove();
        carMarkerRef.current = null;
      }
    });

    return () => {
      cancelled = true;
    };
  }, [mapReady, vehiclePosition]);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator color="#1a237e" />
        <Text className="mt-3 text-sm text-muted-foreground">
          Obtendo localização...
        </Text>
      </View>
    );
  }

  if (isDenied) {
    return (
      <View className="flex-1 items-center justify-center bg-background px-6">
        <Text className="text-center text-base text-foreground">
          {live.error ?? "Não foi possível acessar a localização."}
        </Text>
      </View>
    );
  }

  const hasGps = Boolean(live.coords);

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <View className="shrink-0 px-5 pb-2">
        <ModuleHeader
          eyebrow="Operação em campo"
          title="Mapa"
          description="Rota OSRM entre paradas e simulação do veículo, como no painel web."
        />
      </View>

      <View className="relative min-h-0 flex-1">
        {mapError ? (
          <View className="absolute left-5 right-5 top-3 z-10 rounded-xl border border-destructive/30 bg-[#fee2e2] px-4 py-3">
            <Text className="text-sm text-[#991b1b]">{mapError}</Text>
          </View>
        ) : null}
        <div
          ref={mapElRef}
          className="journey-map-leaflet-host"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: "100%",
            height: "100%",
            zIndex: 0,
          }}
        />
        {!mapReady && !mapError ? (
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: "40%",
              alignItems: "center",
              zIndex: 5,
            }}
          >
            <ActivityIndicator color="#1a237e" />
            <Text className="mt-2 text-sm text-muted-foreground">
              Carregando mapa...
            </Text>
          </View>
        ) : null}

        <JourneyMapOverlay
          journeyId={journeyId}
          busy={busy}
          plannedStopsCount={plannedStops.length}
          routePreviewStatus={routePreviewStatus}
          canStartJourney={canStartJourney}
          hasGps={hasGps}
          geoHint={geoHint}
          positionError={positionError}
          onStart={onStart}
          onStop={onStop}
          onAddCurrentLocation={addCurrentLocationStop}
          onUndoPlannedStop={removeLastPlannedStop}
          onClearPlannedStops={clearPlannedStops}
        />
      </View>
    </View>
  );
}

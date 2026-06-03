import { useEffect, useRef } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import type { default as MapViewType } from "react-native-maps";
import { JourneyMapOverlay } from "../components/map/JourneyMapOverlay";
import { VehicleMapMarker } from "../components/map/VehicleMapMarker";
import { useMapJourney } from "../hooks/useMapJourney";

export default function MapJourneyScreen() {
  const mapRef = useRef<MapViewType | null>(null);
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

  useEffect(() => {
    if (!vehiclePosition || !mapRef.current) return;
    mapRef.current.animateToRegion(
      {
        latitude: vehiclePosition.latitude,
        longitude: vehiclePosition.longitude,
        latitudeDelta: 0.008,
        longitudeDelta: 0.008,
      },
      350,
    );
  }, [vehiclePosition]);

  if (live.status === "asking" || (live.status === "idle" && !live.coords)) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator color="#1a237e" />
        <Text className="mt-3 text-sm text-muted-foreground">
          Obtendo localização...
        </Text>
      </View>
    );
  }

  if (live.status === "denied" || live.status === "error") {
    return (
      <View className="flex-1 items-center justify-center bg-background px-6">
        <Text className="text-center text-base text-foreground">
          {live.error ?? "Não foi possível acessar a localização."}
        </Text>
      </View>
    );
  }

  const hasGps = Boolean(live.coords);
  const routeStroke =
    journeyId || routePreviewStatus === "ok" ? "#818cf8" : "#71717a";
  const routeDash =
    !journeyId && routePreviewStatus === "fallback" ? [10, 14] : undefined;

  return (
    <View className="flex-1">
      <View className="relative min-h-0 flex-1">
        {live.coords ? (
          <MapView
            ref={mapRef}
            provider={PROVIDER_GOOGLE}
            style={{ flex: 1 }}
            showsUserLocation={!journeyId}
            initialRegion={{
              latitude: live.coords.latitude,
              longitude: live.coords.longitude,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }}
            onPress={(e) => {
              if (journeyId) return;
              const { latitude, longitude } = e.nativeEvent.coordinate;
              addPlannedStop(latitude, longitude);
            }}
          >
            {!journeyId &&
              plannedStops.map((p, i) => (
                <Marker
                  key={`plan-${i}-${p.latitude}-${p.longitude}`}
                  coordinate={p}
                  title={`Parada ${i + 1}`}
                  pinColor="#4f46e5"
                />
              ))}

            {routePolyline.length >= 2 ? (
              <Polyline
                coordinates={routePolyline}
                strokeColor={routeStroke}
                strokeWidth={journeyId ? 5 : 4}
                lineDashPattern={routeDash}
              />
            ) : null}

            {trail.length > 1 ? (
              <Polyline
                coordinates={trail}
                strokeColor="#1a237e"
                strokeWidth={3}
              />
            ) : null}

            {vehiclePosition ? (
              <Marker coordinate={vehiclePosition} anchor={{ x: 0.5, y: 0.5 }}>
                <VehicleMapMarker />
              </Marker>
            ) : null}
          </MapView>
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

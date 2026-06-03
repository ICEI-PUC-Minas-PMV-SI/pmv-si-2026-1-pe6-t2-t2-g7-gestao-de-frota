import { useEffect, useState } from "react";
import { Platform } from "react-native";
import * as Location from "expo-location";

export type LiveLocationState = {
  status: "idle" | "asking" | "denied" | "tracking" | "error";
  coords: Location.LocationObjectCoords | null;
  error: string | null;
};

function coordsFromGeolocationPosition(
  pos: GeolocationPosition,
): Location.LocationObjectCoords {
  return {
    latitude: pos.coords.latitude,
    longitude: pos.coords.longitude,
    altitude: pos.coords.altitude ?? 0,
    accuracy: pos.coords.accuracy ?? 0,
    altitudeAccuracy: null,
    heading: pos.coords.heading ?? 0,
    speed: pos.coords.speed ?? 0,
  };
}

function useWebGeolocation(enabled: boolean) {
  const [state, setState] = useState<LiveLocationState>({
    status: "idle",
    coords: null,
    error: null,
  });

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    let watchId: number | null = null;

    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setState({
        status: "error",
        coords: null,
        error: "Geolocalização não suportada neste navegador.",
      });
      return;
    }

    setState((s) => ({ ...s, status: "asking" }));

    const onError = (err: GeolocationPositionError) => {
      if (cancelled) return;
      const denied = err.code === err.PERMISSION_DENIED;
      setState({
        status: denied ? "denied" : "error",
        coords: null,
        error: denied
          ? "Permissão de localização negada."
          : (err.message ?? "Erro ao obter localização."),
      });
    };

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (cancelled) return;
        setState({
          status: "tracking",
          coords: coordsFromGeolocationPosition(pos),
          error: null,
        });
        watchId = navigator.geolocation.watchPosition(
          (update) => {
            if (cancelled) return;
            setState({
              status: "tracking",
              coords: coordsFromGeolocationPosition(update),
              error: null,
            });
          },
          onError,
          { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 },
        );
      },
      onError,
      { enableHighAccuracy: true, timeout: 15000 },
    );

    return () => {
      cancelled = true;
      if (watchId != null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [enabled]);

  return state;
}

function useNativeGeolocation(enabled: boolean) {
  const [state, setState] = useState<LiveLocationState>({
    status: "idle",
    coords: null,
    error: null,
  });

  useEffect(() => {
    if (!enabled) return;
    let subscription: Location.LocationSubscription | null = null;
    let cancelled = false;

    (async () => {
      setState((s) => ({ ...s, status: "asking" }));
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (cancelled) return;
      if (status !== "granted") {
        setState({
          status: "denied",
          coords: null,
          error: "Permissão de localização negada.",
        });
        return;
      }
      try {
        const initial = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        if (cancelled) return;
        setState({
          status: "tracking",
          coords: initial.coords,
          error: null,
        });
        subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Balanced,
            distanceInterval: 10,
            timeInterval: 5000,
          },
          (loc) => {
            setState({
              status: "tracking",
              coords: loc.coords,
              error: null,
            });
          },
        );
      } catch (err: unknown) {
        if (cancelled) return;
        setState({
          status: "error",
          coords: null,
          error:
            err instanceof Error
              ? err.message
              : "Erro ao obter localização.",
        });
      }
    })();

    return () => {
      cancelled = true;
      subscription?.remove();
    };
  }, [enabled]);

  return state;
}

export function useLiveLocation(enabled = true) {
  const isWeb = Platform.OS === "web";
  const webState = useWebGeolocation(isWeb && enabled);
  const nativeState = useNativeGeolocation(!isWeb && enabled);

  if (isWeb) return webState;
  return nativeState;
}

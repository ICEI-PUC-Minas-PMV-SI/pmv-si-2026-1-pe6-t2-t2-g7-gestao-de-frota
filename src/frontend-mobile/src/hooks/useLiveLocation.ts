import { useEffect, useState } from "react";
import * as Location from "expo-location";

export type LiveLocationState = {
  status: "idle" | "asking" | "denied" | "tracking" | "error";
  coords: Location.LocationObjectCoords | null;
  error: string | null;
};

export function useLiveLocation(enabled = true) {
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
      } catch (err: any) {
        if (cancelled) return;
        setState({
          status: "error",
          coords: null,
          error: err?.message ?? "Erro ao obter localização.",
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

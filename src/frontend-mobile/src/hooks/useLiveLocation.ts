import { useEffect, useState } from "react";
import { Platform } from "react-native";
import * as Location from "expo-location";

export type LiveLocationState = {
  status: "idle" | "asking" | "denied" | "tracking" | "error";
  coords: Location.LocationObjectCoords | null;
  error: string | null;
};

/** Tempo máximo aguardando o 1º fix antes de cair no fallback (emulador sem GPS trava aqui). */
const FIRST_FIX_TIMEOUT_MS = 8000;

/**
 * Posição padrão (centro de Belo Horizonte) usada SOMENTE em desenvolvimento
 * quando o emulador/dispositivo não entrega nenhum fix. Serve só para o mapa
 * abrir — a jornada é simulada e não depende do GPS real.
 */
const DEV_FALLBACK_COORDS: Location.LocationObjectCoords = {
  latitude: -19.9167,
  longitude: -43.9345,
  altitude: 0,
  accuracy: 0,
  altitudeAccuracy: null,
  heading: 0,
  speed: 0,
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

      const servicesEnabled = await Location.hasServicesEnabledAsync();
      if (cancelled) return;
      if (!servicesEnabled) {
        setState({
          status: "error",
          coords: null,
          error:
            "Localização indisponível. Ative os serviços de localização do dispositivo (no emulador: Extended Controls › Location › defina e envie uma posição).",
        });
        return;
      }

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
        // 1) Tenta a última posição conhecida (instantânea, se existir).
        const last = await Location.getLastKnownPositionAsync();
        if (cancelled) return;
        if (last) {
          setState({ status: "tracking", coords: last.coords, error: null });
        }

        // 2) Corre o getCurrentPositionAsync contra um timeout. No emulador sem
        //    fix esse método trava indefinidamente — o timeout evita o spinner
        //    eterno. (.catch para não estourar unhandled rejection.)
        const current = await Promise.race([
          Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          }).catch(() => null),
          new Promise<null>((resolve) =>
            setTimeout(() => resolve(null), FIRST_FIX_TIMEOUT_MS),
          ),
        ]);
        if (cancelled) return;

        if (current) {
          setState({ status: "tracking", coords: current.coords, error: null });
        } else if (!last) {
          // 3) Sem nenhum fix. Em dev, abre o mapa numa posição padrão para
          //    não bloquear o trabalho; em produção, sinaliza o erro.
          if (__DEV__) {
            setState({
              status: "tracking",
              coords: DEV_FALLBACK_COORDS,
              error: null,
            });
          } else {
            setState({
              status: "error",
              coords: null,
              error:
                "Não foi possível obter a posição do GPS. Tentaremos novamente assim que houver sinal.",
            });
          }
        }

        // 4) Mantém o watch ativo: se um fix real chegar depois (inclusive
        //    recuperando do erro/fallback), a posição é atualizada.
        subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Balanced,
            distanceInterval: 10,
            timeInterval: 5000,
          },
          (loc) => {
            if (cancelled) return;
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

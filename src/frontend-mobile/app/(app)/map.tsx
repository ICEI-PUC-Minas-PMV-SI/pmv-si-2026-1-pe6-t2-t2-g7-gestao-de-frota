import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, Text, View } from "react-native";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";

import { Badge } from "../../src/components/ui/Badge";
import { Button } from "../../src/components/ui/Button";
import { useAuthorizedToken } from "../../src/hooks/useAuthorizedToken";
import { useLiveLocation } from "../../src/hooks/useLiveLocation";
import { journeyModule } from "../../src/core/modules/journeys/journeys";
import { vehicleModule } from "../../src/core/modules/vehicles/vehicles";

type Point = { latitude: number; longitude: number };

export default function MapScreen() {
  const getToken = useAuthorizedToken();
  const live = useLiveLocation(true);
  const [vehicleId, setVehicleId] = useState<string | null>(null);
  const [journeyId, setJourneyId] = useState<string | null>(null);
  const [trail, setTrail] = useState<Point[]>([]);
  const [busy, setBusy] = useState(false);
  const lastRecordedRef = useRef<number>(0);

  useEffect(() => {
    (async () => {
      try {
        const idToken = await getToken();
        const res = await vehicleModule.gateways.list.exec({ idToken });
        if (res.body[0]) setVehicleId(res.body[0].id);
      } catch {
        // ignore — user can still see the map even if vehicles are unavailable
      }
    })();
  }, [getToken]);

  useEffect(() => {
    if (!journeyId || !live.coords) return;
    const now = Date.now();
    if (now - lastRecordedRef.current < 5000) return;
    lastRecordedRef.current = now;
    const { latitude, longitude } = live.coords;
    setTrail((t) => [...t, { latitude, longitude }]);
    (async () => {
      try {
        const idToken = await getToken();
        await journeyModule.gateways.recordPosition.exec({
          idToken,
          journeyId,
          latitude,
          longitude,
        });
      } catch (err) {
        console.warn("[record position]", err);
      }
    })();
  }, [live.coords, journeyId, getToken]);

  const onStart = useCallback(async () => {
    if (!live.coords) {
      Alert.alert("Localização indisponível", "Aguarde o GPS sincronizar.");
      return;
    }
    if (!vehicleId) {
      Alert.alert(
        "Sem veículo",
        "Cadastre um veículo na web antes de iniciar uma jornada.",
      );
      return;
    }
    setBusy(true);
    try {
      const idToken = await getToken();
      const res = await journeyModule.gateways.create.exec({
        idToken,
        vehicleId,
        paradas: [
          {
            ordem: 0,
            latitude: live.coords.latitude,
            longitude: live.coords.longitude,
          },
        ],
      });
      setJourneyId(res.body.id);
      setTrail([{ latitude: live.coords.latitude, longitude: live.coords.longitude }]);
    } catch (err: any) {
      Alert.alert("Erro", err?.message ?? "Não foi possível iniciar a jornada.");
    } finally {
      setBusy(false);
    }
  }, [live.coords, vehicleId, getToken]);

  const onStop = useCallback(async () => {
    if (!journeyId) return;
    setBusy(true);
    try {
      const idToken = await getToken();
      await journeyModule.gateways.complete.exec({ idToken, journeyId });
      setJourneyId(null);
      setTrail([]);
    } catch (err: any) {
      Alert.alert("Erro", err?.message ?? "Não foi possível encerrar.");
    } finally {
      setBusy(false);
    }
  }, [journeyId, getToken]);

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

  return (
    <View className="flex-1">
      {live.coords ? (
        <MapView
          provider={PROVIDER_GOOGLE}
          style={{ flex: 1 }}
          showsUserLocation
          initialRegion={{
            latitude: live.coords.latitude,
            longitude: live.coords.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
        >
          <Marker
            coordinate={{
              latitude: live.coords.latitude,
              longitude: live.coords.longitude,
            }}
            title="Você está aqui"
          />
          {trail.length > 1 ? (
            <Polyline
              coordinates={trail}
              strokeColor="#1a237e"
              strokeWidth={4}
            />
          ) : null}
        </MapView>
      ) : null}

      <View className="absolute bottom-6 left-5 right-5 gap-y-3 rounded-2xl border border-border bg-card p-4 shadow-lg">
        <View className="flex-row items-center justify-between">
          <Text className="text-sm font-semibold text-foreground">Jornada</Text>
          <Badge tone={journeyId ? "success" : "neutral"}>
            {journeyId ? "Em andamento" : "Parada"}
          </Badge>
        </View>
        {journeyId ? (
          <Button variant="destructive" onPress={onStop} loading={busy}>
            Encerrar jornada
          </Button>
        ) : (
          <Button onPress={onStart} loading={busy}>
            Iniciar jornada
          </Button>
        )}
      </View>
    </View>
  );
}

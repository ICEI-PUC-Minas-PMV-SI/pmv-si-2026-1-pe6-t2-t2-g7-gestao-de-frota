import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";

import { Badge } from "../components/ui/Badge";
import { BottomSheetModal } from "../components/ui/BottomSheetModal";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { journeyModule } from "../core/modules/journeys/journeys";
import { vehicleModule } from "../core/modules/vehicles/vehicles";
import { useAuthorizedToken } from "../hooks/useAuthorizedToken";
import { useLiveLocation } from "../hooks/useLiveLocation";
import { JourneyHistory } from "../core/modules/journeys/types";

type Point = { latitude: number; longitude: number };
const journeyStatusLabel: Record<JourneyHistory["status"], string> = {
  in_progress: "Em andamento",
  completed: "Concluída",
  cancelled: "Cancelada",
};
const journeyStatusTone: Record<
  JourneyHistory["status"],
  "primary" | "success" | "warning"
> = {
  in_progress: "primary",
  completed: "success",
  cancelled: "warning",
};

export default function MapScreenNative() {
  const getToken = useAuthorizedToken();
  const live = useLiveLocation(true);
  const [vehicleId, setVehicleId] = useState<string | null>(null);
  const [journeyId, setJourneyId] = useState<string | null>(null);
  const [journeyHistory, setJourneyHistory] = useState<JourneyHistory[]>([]);
  const [selectedJourney, setSelectedJourney] = useState<JourneyHistory | null>(null);
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
        // ignore - user can still see the map even if vehicles are unavailable
      }
    })();
  }, [getToken]);

  useEffect(() => {
    if (!vehicleId) return;
    (async () => {
      try {
        const idToken = await getToken();
        const res = await journeyModule.gateways.listVehicleJourneys.exec({
          idToken,
          vehicleId,
        });
        setJourneyHistory(res.body);
      } catch {
        // ignore - history is supplemental to the live map
      }
    })();
  }, [vehicleId, getToken, journeyId]);

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
      setJourneyHistory((current) => [res.body as JourneyHistory, ...current]);
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
      if (vehicleId) {
        const res = await journeyModule.gateways.listVehicleJourneys.exec({
          idToken,
          vehicleId,
        });
        setJourneyHistory(res.body);
      }
    } catch (err: any) {
      Alert.alert("Erro", err?.message ?? "Não foi possível encerrar.");
    } finally {
      setBusy(false);
    }
  }, [journeyId, vehicleId, getToken]);

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
    <>
      <ScrollView className="flex-1 bg-background">
        <View className="gap-y-4 px-5 py-5">
          <View className="gap-y-2 px-1">
            <Text className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Mapa
            </Text>
            <Text className="text-3xl font-semibold tracking-tight text-foreground">
              Jornada atual
            </Text>
            <Text className="text-sm text-muted-foreground">
              Inicie, acompanhe e revise seus trajetos.
            </Text>
          </View>

          <View className="overflow-hidden rounded-2xl border border-border bg-card">
            {live.coords ? (
              <MapView
                provider={PROVIDER_GOOGLE}
                style={{ height: 320, width: "100%" }}
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
          </View>

          <Card className="gap-y-4">
            <View className="flex-row items-center justify-between">
              <Text className="text-base font-semibold text-foreground">Status</Text>
              <Badge tone={journeyId ? "success" : "neutral"}>
                {journeyId ? "Em andamento" : "Parada"}
              </Badge>
            </View>
            <Text className="text-sm text-muted-foreground">
              Registre a movimentação do seu veículo com um toque.
            </Text>
            {journeyId ? (
              <Button variant="destructive" onPress={onStop} loading={busy}>
                Encerrar jornada
              </Button>
            ) : (
              <Button onPress={onStart} loading={busy}>
                Iniciar jornada
              </Button>
            )}
          </Card>

          <Card className="gap-y-4">
            <Text className="text-base font-semibold text-foreground">
              Histórico
            </Text>
            <Text className="text-sm text-muted-foreground">
              Jornadas recentes do veículo selecionado.
            </Text>

            <View className="gap-y-3">
              {journeyHistory.length === 0 ? (
                <Text className="text-sm text-muted-foreground">
                  Nenhuma jornada registrada ainda.
                </Text>
              ) : (
                journeyHistory.map((journey) => (
                  <Pressable
                    key={journey.id}
                    onPress={() => setSelectedJourney(journey)}
                    className="rounded-xl border border-border bg-background p-3"
                  >
                    <View className="flex-row items-center justify-between">
                      <Text className="text-sm font-semibold text-foreground">
                        {journey.nome ?? "Jornada sem nome"}
                      </Text>
                      <Badge tone={journeyStatusTone[journey.status]}>
                        {journeyStatusLabel[journey.status]}
                      </Badge>
                    </View>
                    <View className="mt-3 flex-row flex-wrap gap-x-5 gap-y-2">
                      <Meta
                        label="Início"
                        value={new Date(journey.iniciadaEm).toLocaleDateString("pt-BR")}
                      />
                      <Meta label="Km" value={journey.kmRodados.toFixed(1)} />
                      <Meta
                        label="Combustível"
                        value={`${journey.combustivelGasto.toFixed(1)} L`}
                      />
                    </View>
                  </Pressable>
                ))
              )}
            </View>
          </Card>
        </View>
      </ScrollView>

      <BottomSheetModal
        open={Boolean(selectedJourney)}
        onClose={() => setSelectedJourney(null)}
        title={selectedJourney?.nome ?? "Jornada sem nome"}
        description="Resumo da jornada registrada."
      >
        {selectedJourney ? (
          <View className="gap-y-4">
            <Badge tone={journeyStatusTone[selectedJourney.status]}>
              {journeyStatusLabel[selectedJourney.status]}
            </Badge>
            <View className="flex-row flex-wrap gap-4">
              <Meta
                label="Início"
                value={new Date(selectedJourney.iniciadaEm).toLocaleDateString("pt-BR")}
              />
              <Meta label="Km rodados" value={selectedJourney.kmRodados.toFixed(1)} />
              <Meta
                label="Combustível"
                value={`${selectedJourney.combustivelGasto.toFixed(1)} L`}
              />
              <Meta
                label="Nível"
                value={`${selectedJourney.nivelCombustivel.toFixed(1)} L`}
              />
            </View>
          </View>
        ) : null}
      </BottomSheetModal>
    </>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <View>
      <Text className="text-[11px] uppercase tracking-widest text-muted-foreground">
        {label}
      </Text>
      <Text className="text-sm font-medium text-foreground">{value}</Text>
    </View>
  );
}

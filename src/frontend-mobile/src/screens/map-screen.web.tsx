import { useCallback, useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";

import { Badge } from "../components/ui/Badge";
import { Card } from "../components/ui/Card";
import { journeyModule, JourneyHistory } from "../core/modules/journeys/journeys";
import { vehicleModule, Vehicle } from "../core/modules/vehicles/vehicles";
import { useAuthorizedToken } from "../hooks/useAuthorizedToken";

export default function MapScreenWeb() {
  const getToken = useAuthorizedToken();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [history, setHistory] = useState<JourneyHistory[]>([]);

  const load = useCallback(async () => {
    try {
      const idToken = await getToken();
      const vehiclesRes = await vehicleModule.gateways.list.exec({ idToken });
      const selected = vehiclesRes.body[0] ?? null;
      setVehicle(selected);
      if (!selected) {
        setHistory([]);
        return;
      }
      const historyRes = await journeyModule.gateways.listVehicleJourneys.exec({
        idToken,
        vehicleId: selected.id,
      });
      setHistory(historyRes.body);
    } catch {
      setVehicle(null);
      setHistory([]);
    }
  }, [getToken]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="gap-y-5 px-5 py-5">
        <Card>
          <Text className="text-lg font-semibold text-foreground">
            Mapa indisponível na versão web
          </Text>
          <Text className="mt-3 text-sm leading-6 text-muted-foreground">
            Esta tela usa `react-native-maps`, que é suportado no app nativo.
            No navegador, o histórico das jornadas ainda pode ser consultado abaixo.
          </Text>
        </Card>

        <Card>
          <Text className="text-base font-semibold text-foreground">
            Jornadas registradas
          </Text>
          <Text className="mt-1 text-sm text-muted-foreground">
            {vehicle
              ? `Veículo selecionado: ${vehicle.marca} ${vehicle.modelo}`
              : "Cadastre um veículo para visualizar o histórico das jornadas."}
          </Text>

          <View className="mt-4 gap-y-3">
            {history.length === 0 ? (
              <Text className="text-sm text-muted-foreground">
                Nenhuma jornada registrada.
              </Text>
            ) : (
              history.map((journey) => (
                <View
                  key={journey.id}
                  className="rounded-xl border border-border bg-background p-4"
                >
                  <View className="flex-row items-center justify-between">
                    <Text className="text-base font-semibold text-foreground">
                      {journey.nome ?? "Jornada sem nome"}
                    </Text>
                    <Badge tone={journey.status === "completed" ? "success" : "primary"}>
                      {journey.status}
                    </Badge>
                  </View>
                  <Text className="mt-2 text-sm text-muted-foreground">
                    Iniciada em {new Date(journey.iniciadaEm).toLocaleDateString("pt-BR")}
                  </Text>
                </View>
              ))
            )}
          </View>
        </Card>
      </View>
    </ScrollView>
  );
}

import { useCallback, useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTabScreenBottomInset } from "../../src/components/layout/useTabScreenBottomInset";

import { Badge } from "../../src/components/ui/Badge";
import { BottomSheetModal } from "../../src/components/ui/BottomSheetModal";
import { Button } from "../../src/components/ui/Button";
import { Card } from "../../src/components/ui/Card";
import { Input } from "../../src/components/ui/Input";
import {
  VehicleFormSheet,
} from "../../src/components/vehicles/VehicleFormSheet";
import { VehicleDetailSheet } from "../../src/components/vehicles/VehicleDetailSheet";
import {
  incidentModule,
  Incident,
  IncidentSeverity,
  IncidentType,
} from "../../src/core/modules/incidents/incidents";
import { vehicleModule, Vehicle } from "../../src/core/modules/vehicles/vehicles";
import { useAuthorizedToken } from "../../src/hooks/useAuthorizedToken";
import { notifySuccess, showToast } from "../../src/components/ui/toast";
import { getApiErrorMessage } from "../../src/utils/apiError";

const incidentTypes: IncidentType[] = ["sinistro", "multa"];
const incidentSeverityOptions: IncidentSeverity[] = [
  "baixa",
  "media",
  "alta",
  "critica",
];
const VEHICLE_PAGE_SIZE = 3;

type IncidentFormState = {
  vehicleId: string | null;
  tipo: IncidentType;
  severidade: IncidentSeverity;
  descricao: string;
  valor: string;
  local: string;
};

const incidentInitialState: IncidentFormState = {
  vehicleId: null,
  tipo: "sinistro",
  severidade: "media",
  descricao: "",
  valor: "",
  local: "",
};

export default function VehiclesScreen() {
  const insets = useSafeAreaInsets();
  const bottomInset = useTabScreenBottomInset();
  const router = useRouter();
  const { openVehicle, view } = useLocalSearchParams<{
    openVehicle?: string;
    view?: string;
  }>();
  const getToken = useAuthorizedToken();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [screenError, setScreenError] = useState<string | null>(null);
  const [incidentForm, setIncidentForm] = useState<IncidentFormState>(incidentInitialState);
  const [savingIncident, setSavingIncident] = useState(false);
  const [visibleVehicleCount, setVisibleVehicleCount] = useState(VEHICLE_PAGE_SIZE);
  const [vehicleFormOpen, setVehicleFormOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [deletingVehicleId, setDeletingVehicleId] = useState<string | null>(null);
  const [incidentModalVehicle, setIncidentModalVehicle] = useState<Vehicle | null>(null);
  const [detailVehicle, setDetailVehicle] = useState<Vehicle | null>(null);
  const [detailSubView, setDetailSubView] = useState<"incidents" | "journeys" | null>(
    null,
  );
  const [vehicleToDelete, setVehicleToDelete] = useState<Vehicle | null>(null);

  const load = useCallback(async () => {
    try {
      setScreenError(null);
      const idToken = await getToken();
      const [vehiclesRes, incidentsRes] = await Promise.all([
        vehicleModule.gateways.list.exec({ idToken }),
        incidentModule.gateways.list.exec({ idToken }),
      ]);
      setVehicles(vehiclesRes.body);
      setIncidents(incidentsRes.body);
      setVisibleVehicleCount(VEHICLE_PAGE_SIZE);
    } catch (err: unknown) {
      setScreenError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [getToken]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!openVehicle || loading) return;

    const match = vehicles.find((item) => item.id === openVehicle);
    if (match) {
      setDetailVehicle(match);
      if (view === "incidents" || view === "journeys") {
        setDetailSubView(view);
      }
    }

    router.replace("/(app)/vehicles");
  }, [openVehicle, view, loading, vehicles, router]);

  function openVehicleDetail(vehicle: Vehicle) {
    setDetailSubView(null);
    setDetailVehicle(vehicle);
  }

  function closeVehicleDetail() {
    setDetailVehicle(null);
    setDetailSubView(null);
  }

  function openVehicleForm(vehicle: Vehicle | null) {
    setEditingVehicle(vehicle);
    setVehicleFormOpen(true);
  }

  async function onDeleteVehicle(vehicle: Vehicle) {
    setDeletingVehicleId(vehicle.id);
    try {
      const idToken = await getToken();
      await vehicleModule.gateways.delete.exec({
        idToken,
        vehicleId: vehicle.id,
      });
      setVehicleToDelete(null);
      notifySuccess("Veículo excluído com sucesso.");
      await load();
    } catch {
      // Toast exibido pelo AxiosAdapter.
    } finally {
      setDeletingVehicleId(null);
    }
  }

  async function onCreateIncident() {
    if (!incidentForm.vehicleId) {
      showToast({ message: "Selecione um veículo.", tone: "error" });
      return;
    }
    if (!incidentForm.descricao.trim()) {
      showToast({ message: "Informe a descrição do incidente.", tone: "error" });
      return;
    }

    setSavingIncident(true);
    try {
      const idToken = await getToken();
      await incidentModule.gateways.create.exec({
        idToken,
        vehicleId: incidentForm.vehicleId,
        tipo: incidentForm.tipo,
        status: "aberto",
        severidade: incidentForm.severidade,
        descricao: incidentForm.descricao.trim(),
        valor: incidentForm.valor ? Number(incidentForm.valor) : undefined,
        local: incidentForm.local.trim() || undefined,
        data: new Date().toISOString(),
      });
      setIncidentForm(incidentInitialState);
      setIncidentModalVehicle(null);
      notifySuccess("Incidente registrado com sucesso.");
      await load();
    } catch {
      // Toast exibido pelo AxiosAdapter.
    } finally {
      setSavingIncident(false);
    }
  }

  function onLoadMoreVehicles() {
    if (visibleVehicleCount >= vehicles.length) return;
    setVisibleVehicleCount((current) =>
      Math.min(current + VEHICLE_PAGE_SIZE, vehicles.length),
    );
  }

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator color="#1a237e" />
      </View>
    );
  }

  return (
    <>
      <FlatList
        className="flex-1 bg-background"
        contentContainerStyle={{
          padding: 20,
          paddingTop: 20 + insets.top,
          paddingBottom: bottomInset,
          gap: 20,
        }}
        data={vehicles.slice(0, visibleVehicleCount)}
        keyExtractor={(item) => item.id}
        onEndReached={onLoadMoreVehicles}
        onEndReachedThreshold={0.35}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              load();
            }}
          />
        }
        ListHeaderComponent={
          <View className="gap-y-4">
            <View className="gap-y-2 px-1">
              <Text className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                Veículos
              </Text>
              <Text className="text-3xl font-semibold tracking-tight text-foreground">
                Sua frota pessoal
              </Text>
              <Text className="text-sm text-muted-foreground">
                Gerencie seus veículos e incidentes em um fluxo único.
              </Text>
            </View>

            <View className="flex-row gap-3">
              <MetricCard label="Veículos" value={String(vehicles.length)} />
              <MetricCard label="Incidentes" value={String(incidents.length)} />
            </View>

            <Card>
              <View className="gap-y-4">
                <View className="gap-y-1">
                  <Text className="text-base font-semibold text-foreground">
                    Adicionar veículo
                  </Text>
                  <Text className="mt-1 text-sm text-muted-foreground">
                    Cadastre placa, foto e consumo.
                  </Text>
                </View>
                <Button onPress={() => openVehicleForm(null)}>Novo veículo</Button>
              </View>
            </Card>

            {screenError ? (
              <Card>
                <Text className="text-sm text-red-500">{screenError}</Text>
              </Card>
            ) : null}

            {vehicles.length === 0 ? (
              <Card>
                <Text className="text-base font-semibold text-foreground">
                  Nenhum veículo cadastrado
                </Text>
                <Text className="mt-2 text-sm text-muted-foreground">
                  Crie o seu primeiro veículo para começar a registrar incidentes, jornadas e localizações.
                </Text>
              </Card>
            ) : null}
          </View>
        }
        ListFooterComponent={
          vehicles.length > 0 && visibleVehicleCount >= vehicles.length ? (
            <Text className="py-4 text-center text-xs text-muted-foreground">
              Todos os veículos carregados.
            </Text>
          ) : null
        }
        renderItem={({ item: vehicle }) => {
          const vehicleIncidents = incidents.filter((item) => item.vehicleId === vehicle.id);

          return (
          <Card className="p-4">
            <Image
              source={{ uri: vehicle.fotoUrl }}
              className="h-44 w-full rounded-xl bg-muted"
              resizeMode="cover"
            />

            <View className="mt-4 flex-row items-start justify-between">
              <View className="flex-1 pr-3">
                <Text className="text-lg font-semibold text-foreground">
                  {vehicle.marca} {vehicle.modelo}
                </Text>
                <Text className="mt-1 text-sm text-muted-foreground">
                  {vehicle.placa}
                </Text>
              </View>
              <Badge tone="primary">{vehicleIncidents.length} incidentes</Badge>
            </View>

            <View className="mt-4 flex-row flex-wrap gap-x-5 gap-y-3">
              <Metric label="Ano" value={String(vehicle.ano)} />
              <Metric label="Tanque" value={`${vehicle.tamanhoTanque} L`} />
              <Metric
                label="Consumo"
                value={`${vehicle.consumoMedio.toFixed(1)} km/L`}
              />
            </View>

            <View className="mt-5 gap-y-3">
              <View className="flex-row gap-3">
                <View className="flex-1">
                  <Button
                    variant="outline"
                    onPress={() => openVehicleDetail(vehicle)}
                  >
                    Abrir veículo
                  </Button>
                </View>
                <View className="flex-1">
                  <Button
                    variant="outline"
                    onPress={() => {
                      setIncidentForm({
                        ...incidentInitialState,
                        vehicleId: vehicle.id,
                      });
                      setIncidentModalVehicle(vehicle);
                    }}
                  >
                    Novo incidente
                  </Button>
                </View>
              </View>

              <View className="flex-row gap-3">
                <View className="flex-1">
                  <Button variant="outline" onPress={() => openVehicleForm(vehicle)}>
                    Editar
                  </Button>
                </View>
                <View className="flex-1">
                  <Button
                    variant="destructive"
                    loading={deletingVehicleId === vehicle.id}
                    disabled={Boolean(deletingVehicleId)}
                    onPress={() => setVehicleToDelete(vehicle)}
                  >
                    Excluir
                  </Button>
                </View>
              </View>

              <Text className="text-sm text-muted-foreground">
                {vehicleIncidents.length === 0
                  ? "Nenhum incidente registrado."
                  : `${vehicleIncidents.length} incidente(s) registrado(s). Abra o veículo para ver tudo.`}
              </Text>
            </View>
          </Card>
          );
        }}
      />

      <VehicleFormSheet
        visible={vehicleFormOpen}
        vehicle={editingVehicle}
        onClose={() => setVehicleFormOpen(false)}
        onSaved={load}
      />

      <VehicleDetailSheet
        open={Boolean(detailVehicle)}
        vehicle={detailVehicle}
        initialSubView={detailSubView}
        onClose={closeVehicleDetail}
      />

      <BottomSheetModal
        open={Boolean(vehicleToDelete)}
        onClose={() => setVehicleToDelete(null)}
        title="Excluir veículo"
        description={
          vehicleToDelete
            ? `Remover ${vehicleToDelete.marca} ${vehicleToDelete.modelo} (${vehicleToDelete.placa})?`
            : undefined
        }
      >
        <View className="gap-y-3">
          <Button
            variant="destructive"
            loading={Boolean(vehicleToDelete && deletingVehicleId === vehicleToDelete.id)}
            onPress={() => vehicleToDelete && void onDeleteVehicle(vehicleToDelete)}
          >
            Excluir veículo
          </Button>
          <Button variant="outline" onPress={() => setVehicleToDelete(null)}>
            Cancelar
          </Button>
        </View>
      </BottomSheetModal>

      <BottomSheetModal
        open={Boolean(incidentModalVehicle)}
        onClose={() => setIncidentModalVehicle(null)}
        title="Registrar incidente"
        description={
          incidentModalVehicle
            ? `Novo incidente para ${incidentModalVehicle.marca} ${incidentModalVehicle.modelo}.`
            : undefined
        }
      >
        <View className="gap-y-4">
          <ChoiceRow
            label="Tipo"
            options={incidentTypes}
            selected={incidentForm.tipo}
            onSelect={(value) =>
              setIncidentForm((current) => ({ ...current, tipo: value as IncidentType }))
            }
          />
          <ChoiceRow
            label="Severidade"
            options={incidentSeverityOptions}
            selected={incidentForm.severidade}
            onSelect={(value) =>
              setIncidentForm((current) => ({
                ...current,
                severidade: value as IncidentSeverity,
              }))
            }
          />
          <Input
            label="Descrição"
            placeholder="Descreva o incidente"
            multiline
            numberOfLines={4}
            value={incidentForm.descricao}
            onChangeText={(value) =>
              setIncidentForm((current) => ({ ...current, descricao: value }))
            }
          />
          <Input
            label="Valor (opcional)"
            placeholder="500.00"
            keyboardType="decimal-pad"
            value={incidentForm.valor}
            onChangeText={(value) =>
              setIncidentForm((current) => ({ ...current, valor: value }))
            }
          />
          <Input
            label="Local (opcional)"
            placeholder="BR-381 km 420"
            value={incidentForm.local}
            onChangeText={(value) =>
              setIncidentForm((current) => ({ ...current, local: value }))
            }
          />
          <Button onPress={onCreateIncident} loading={savingIncident}>
            Salvar incidente
          </Button>
        </View>
      </BottomSheetModal>
    </>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View>
      <Text className="text-[11px] uppercase tracking-widest text-muted-foreground">
        {label}
      </Text>
      <Text className="text-sm font-medium text-foreground">{value}</Text>
    </View>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-1 rounded-2xl border border-border bg-card px-4 py-3">
      <Text className="text-[11px] uppercase tracking-widest text-muted-foreground">
        {label}
      </Text>
      <Text className="mt-1 text-lg font-semibold text-foreground">{value}</Text>
    </View>
  );
}

function ChoiceRow({
  label,
  options,
  selected,
  onSelect,
}: {
  label: string;
  options: string[];
  selected: string;
  onSelect: (value: string) => void;
}) {
  return (
    <View className="gap-y-2">
      <Text className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
        {label}
      </Text>
      <View className="flex-row flex-wrap gap-2">
        {options.map((option) => {
          const active = option === selected;
          return (
            <Pressable
              key={option}
              onPress={() => onSelect(option)}
              className={`rounded-full border px-3 py-2 ${
                active
                  ? "border-primary bg-accent"
                  : "border-border bg-background"
              }`}
            >
              <Text
                className={`text-xs font-semibold uppercase ${
                  active ? "text-accent-foreground" : "text-muted-foreground"
                }`}
              >
                {option.replaceAll("_", " ")}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

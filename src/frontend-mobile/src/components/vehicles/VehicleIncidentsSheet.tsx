import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { Badge } from "../ui/Badge";
import { BottomSheetModal } from "../ui/BottomSheetModal";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Input } from "../ui/Input";
import {
  incidentModule,
  Incident,
  IncidentSeverity,
  IncidentStatus,
  IncidentType,
} from "../../core/modules/incidents/incidents";
import type { Vehicle } from "../../core/modules/vehicles/vehicles";
import { useAuthorizedToken } from "../../hooks/useAuthorizedToken";
import { notifySuccess, showToast } from "../ui/toast";
import { getApiErrorMessage } from "../../utils/apiError";

const incidentTypes: IncidentType[] = ["sinistro", "multa"];
const incidentSeverityOptions: IncidentSeverity[] = [
  "baixa",
  "media",
  "alta",
  "critica",
];
const incidentStatusLabel: Record<IncidentStatus, string> = {
  aberto: "Aberto",
  em_analise: "Em análise",
  resolvido: "Resolvido",
  cancelado: "Cancelado",
};
const severityTone: Record<
  IncidentSeverity,
  "success" | "warning" | "destructive" | "neutral"
> = {
  baixa: "success",
  media: "warning",
  alta: "destructive",
  critica: "destructive",
};

type IncidentFormState = {
  tipo: IncidentType;
  severidade: IncidentSeverity;
  descricao: string;
  valor: string;
  local: string;
};

const incidentInitialState: IncidentFormState = {
  tipo: "sinistro",
  severidade: "media",
  descricao: "",
  valor: "",
  local: "",
};

type Props = {
  open: boolean;
  vehicle: Vehicle;
  onClose: () => void;
  onChanged?: () => void;
};

export function VehicleIncidentsSheet({ open, vehicle, onClose, onChanged }: Props) {
  const getToken = useAuthorizedToken();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [incidentOpen, setIncidentOpen] = useState(false);
  const [incidentForm, setIncidentForm] = useState<IncidentFormState>(incidentInitialState);
  const [savingIncident, setSavingIncident] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const idToken = await getToken();
      const incidentsRes = await incidentModule.gateways.listByVehicle.exec({
        idToken,
        vehicleId: vehicle.id,
      });
      setIncidents(incidentsRes.body);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [getToken, vehicle.id]);

  useEffect(() => {
    if (!open) {
      setIncidentOpen(false);
      setSelectedIncident(null);
      setIncidentForm(incidentInitialState);
      return;
    }
    void load();
  }, [open, load]);

  async function onCreateIncident() {
    if (!incidentForm.descricao.trim()) {
      showToast({ message: "Informe a descrição do incidente.", tone: "error" });
      return;
    }
    setSavingIncident(true);
    try {
      const idToken = await getToken();
      await incidentModule.gateways.create.exec({
        idToken,
        vehicleId: vehicle.id,
        tipo: incidentForm.tipo,
        status: "aberto",
        severidade: incidentForm.severidade,
        descricao: incidentForm.descricao.trim(),
        valor: incidentForm.valor ? Number(incidentForm.valor) : undefined,
        local: incidentForm.local.trim() || undefined,
        data: new Date().toISOString(),
      });
      setIncidentForm(incidentInitialState);
      setIncidentOpen(false);
      notifySuccess("Incidente registrado com sucesso.");
      await load();
      onChanged?.();
    } catch {
      // Toast exibido pelo AxiosAdapter.
    } finally {
      setSavingIncident(false);
    }
  }

  return (
    <>
      <BottomSheetModal
        open={open}
        onClose={onClose}
        title="Incidentes"
        description={`${vehicle.marca} ${vehicle.modelo} · ${vehicle.placa}`}
      >
        {loading ? (
          <View className="items-center py-10">
            <ActivityIndicator color="#1a237e" />
          </View>
        ) : (
          <View className="gap-y-4 pb-4">
            <View className="flex-row gap-3">
              <MetricCard label="Registros" value={String(incidents.length)} />
              <MetricCard
                label="Abertos"
                value={String(incidents.filter((item) => item.status === "aberto").length)}
              />
            </View>

            <View className="flex-row items-center justify-between">
              <Text className="text-base font-semibold text-foreground">
                Tabela de incidentes
              </Text>
              <Button variant="outline" onPress={() => setIncidentOpen(true)}>
                Novo incidente
              </Button>
            </View>

            {error ? <Text className="text-sm text-red-500">{error}</Text> : null}

            {incidents.length === 0 ? (
              <Card>
                <Text className="text-sm text-muted-foreground">
                  Nenhum incidente registrado para este veículo.
                </Text>
              </Card>
            ) : (
              <View className="-mx-5">
                <DataTable
                  headers={["Tipo", "Status", "Data"]}
                  rows={incidents.map((incident) => ({
                    key: incident.id,
                    values: [
                      capitalize(incident.tipo),
                      incidentStatusLabel[incident.status],
                      new Date(incident.data).toLocaleDateString("pt-BR"),
                    ],
                    badge: {
                      label: incident.severidade,
                      tone: severityTone[incident.severidade],
                    },
                    onPress: () => setSelectedIncident(incident),
                  }))}
                />
              </View>
            )}
          </View>
        )}
      </BottomSheetModal>

      <BottomSheetModal
        open={incidentOpen}
        onClose={() => setIncidentOpen(false)}
        title="Registrar incidente"
        description={`Novo incidente para ${vehicle.marca} ${vehicle.modelo}.`}
      >
        <View className="gap-y-4 pb-4">
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

      <BottomSheetModal
        open={Boolean(selectedIncident)}
        onClose={() => setSelectedIncident(null)}
        title={selectedIncident ? capitalize(selectedIncident.tipo) : "Incidente"}
        description="Detalhes completos do incidente."
      >
        {selectedIncident ? (
          <View className="gap-y-4 pb-4">
            <View className="flex-row items-center justify-between">
              <Badge tone={severityTone[selectedIncident.severidade]}>
                {selectedIncident.severidade}
              </Badge>
              <Badge tone="neutral">
                {incidentStatusLabel[selectedIncident.status]}
              </Badge>
            </View>
            <View className="rounded-2xl border border-border bg-background p-4">
              <Text className="text-[11px] uppercase tracking-widest text-muted-foreground">
                Descrição
              </Text>
              <Text className="mt-2 text-sm text-foreground">
                {selectedIncident.descricao}
              </Text>
            </View>
            <View className="flex-row flex-wrap gap-x-5 gap-y-4">
              <Meta
                label="Data"
                value={new Date(selectedIncident.data).toLocaleDateString("pt-BR")}
              />
              <Meta label="Local" value={selectedIncident.local ?? "Nao informado"} />
              <Meta
                label="Valor"
                value={
                  typeof selectedIncident.valor === "number"
                    ? `R$ ${selectedIncident.valor.toFixed(2)}`
                    : "Nao informado"
                }
              />
            </View>
          </View>
        ) : null}
      </BottomSheetModal>
    </>
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

function DataTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: {
    key: string;
    values: [string, string, string];
    badge: {
      label: string;
      tone: "primary" | "success" | "warning" | "destructive" | "neutral";
    };
    onPress: () => void;
  }[];
}) {
  return (
    <View className="overflow-hidden border-y border-border bg-card">
      <View className="flex-row border-b border-border bg-muted/40 px-5 py-3">
        {headers.map((header) => (
          <Text
            key={header}
            className="flex-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground"
          >
            {header}
          </Text>
        ))}
      </View>
      {rows.map((row, index) => (
        <Pressable
          key={row.key}
          onPress={row.onPress}
          className={`bg-card px-5 py-3 ${
            index < rows.length - 1 ? "border-b border-border" : ""
          }`}
        >
          <View className="flex-row items-center">
            <View className="flex-1 pr-2">
              <Text className="text-sm font-medium text-foreground">{row.values[0]}</Text>
            </View>
            <View className="flex-1 pr-2">
              <Text className="text-sm text-muted-foreground">{row.values[1]}</Text>
            </View>
            <View className="flex-1 items-end">
              <Text className="text-sm text-muted-foreground">{row.values[2]}</Text>
            </View>
          </View>
          <View className="mt-3 flex-row items-center justify-between">
            <Badge tone={row.badge.tone}>{row.badge.label}</Badge>
            <View className="flex-row items-center gap-1">
              <Text className="text-xs font-medium text-primary">Ver detalhes</Text>
              <Ionicons name="chevron-forward" size={14} color="#1a237e" />
            </View>
          </View>
        </Pressable>
      ))}
    </View>
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

function capitalize(value: string) {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

import { useEffect, useState } from "react";
import { Alert, Text, View } from "react-native";

import { Button } from "../ui/Button";
import { FormSheet } from "../ui/FormSheet";
import { Input } from "../ui/Input";
import { OptionChips } from "../ui/OptionChips";
import { useAuthorizedToken } from "../../hooks/useAuthorizedToken";
import {
  incidentModule,
  type Incident,
  type IncidentSeverity,
  type IncidentStatus,
  type IncidentType,
} from "../../core/modules/incidents/incidents";
import type { Vehicle } from "../../core/modules/vehicles/types";
import {
  SEVERITY_LABEL,
  STATUS_LABEL,
} from "../../theme/incidents";

type Props = {
  visible: boolean;
  incident: Incident | null;
  vehicles: Vehicle[];
  onClose: () => void;
  onSaved: () => void;
};

const TIPO_OPTIONS: { value: IncidentType; label: string }[] = [
  { value: "multa", label: "Multa" },
  { value: "sinistro", label: "Sinistro" },
];

const STATUS_OPTIONS: { value: IncidentStatus; label: string }[] = [
  { value: "aberto", label: STATUS_LABEL.aberto },
  { value: "em_analise", label: STATUS_LABEL.em_analise },
  { value: "resolvido", label: STATUS_LABEL.resolvido },
  { value: "cancelado", label: STATUS_LABEL.cancelado },
];

const SEVERITY_OPTIONS: { value: IncidentSeverity; label: string }[] = [
  { value: "baixa", label: SEVERITY_LABEL.baixa },
  { value: "media", label: SEVERITY_LABEL.media },
  { value: "alta", label: SEVERITY_LABEL.alta },
  { value: "critica", label: SEVERITY_LABEL.critica },
];

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

export function IncidentFormSheet({
  visible,
  incident,
  vehicles,
  onClose,
  onSaved,
}: Props) {
  const getToken = useAuthorizedToken();
  const isEdit = Boolean(incident);
  const [vehicleId, setVehicleId] = useState("");
  const [tipo, setTipo] = useState<IncidentType>("multa");
  const [status, setStatus] = useState<IncidentStatus>("aberto");
  const [severidade, setSeveridade] = useState<IncidentSeverity>("media");
  const [descricao, setDescricao] = useState("");
  const [data, setData] = useState(todayIsoDate());
  const [codigoInfracao, setCodigoInfracao] = useState("");
  const [valor, setValor] = useState("");
  const [localInfracao, setLocalInfracao] = useState("");
  const [natureza, setNatureza] = useState("");
  const [local, setLocal] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;
    setError(null);
    if (incident) {
      setVehicleId(incident.vehicleId);
      setTipo(incident.tipo);
      setStatus(incident.status);
      setSeveridade(incident.severidade);
      setDescricao(incident.descricao);
      setData(incident.data?.slice(0, 10) ?? todayIsoDate());
      setCodigoInfracao(incident.codigoInfracao ?? "");
      setValor(
        typeof incident.valor === "number" ? String(incident.valor) : "",
      );
      setLocalInfracao(incident.localInfracao ?? "");
      setNatureza(incident.natureza ?? "");
      setLocal(incident.local ?? "");
    } else {
      setVehicleId(vehicles[0]?.id ?? "");
      setTipo("multa");
      setStatus("aberto");
      setSeveridade("media");
      setDescricao("");
      setData(todayIsoDate());
      setCodigoInfracao("");
      setValor("");
      setLocalInfracao("");
      setNatureza("");
      setLocal("");
    }
  }, [visible, incident, vehicles]);

  async function onSubmit() {
    setError(null);
    if (!vehicleId) {
      setError("Selecione um veículo.");
      return;
    }
    if (!descricao.trim()) {
      setError("Informe a descrição.");
      return;
    }

    const payload = {
      vehicleId,
      tipo,
      status,
      severidade,
      descricao: descricao.trim(),
      data: data ? new Date(data).toISOString() : undefined,
      codigoInfracao: codigoInfracao.trim() || undefined,
      valor: valor.trim() ? Number(valor) : undefined,
      localInfracao: localInfracao.trim() || undefined,
      natureza: natureza.trim() || undefined,
      local: local.trim() || undefined,
    };

    setSaving(true);
    try {
      const idToken = await getToken();
      if (isEdit && incident) {
        await incidentModule.gateways.update.exec({
          idToken,
          incidentId: incident.id,
          ...payload,
        });
      } else {
        await incidentModule.gateways.create.exec({ idToken, ...payload });
      }
      onSaved();
      onClose();
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Erro ao salvar incidente.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <FormSheet
      visible={visible}
      title={isEdit ? "Editar incidente" : "Novo incidente"}
      description="Multas e sinistros vinculados à frota."
      onClose={onClose}
      footer={
        <Button onPress={onSubmit} loading={saving} disabled={vehicles.length === 0}>
          {isEdit ? "Salvar alterações" : "Registrar incidente"}
        </Button>
      }
    >
      <View className="gap-y-4 pb-6">
        {error ? (
          <Text className="text-sm text-destructive">{error}</Text>
        ) : null}
        {vehicles.length === 0 ? (
          <Text className="text-sm text-muted-foreground">
            Cadastre um veículo antes de registrar incidentes.
          </Text>
        ) : (
          <OptionChips
            label="Veículo"
            options={vehicles.map((v) => ({
              value: v.id,
              label: `${v.placa} · ${v.marca}`,
            }))}
            value={vehicleId}
            onChange={setVehicleId}
          />
        )}
        <OptionChips label="Tipo" options={TIPO_OPTIONS} value={tipo} onChange={setTipo} />
        <OptionChips
          label="Status"
          options={STATUS_OPTIONS}
          value={status}
          onChange={setStatus}
        />
        <OptionChips
          label="Severidade"
          options={SEVERITY_OPTIONS}
          value={severidade}
          onChange={setSeveridade}
        />
        <Input
          label="Descrição"
          value={descricao}
          onChangeText={setDescricao}
          placeholder="Descreva o ocorrido..."
          multiline
          numberOfLines={3}
          style={{ minHeight: 80, textAlignVertical: "top" }}
        />
        <Input
          label="Data"
          value={data}
          onChangeText={setData}
          placeholder="AAAA-MM-DD"
        />
        <Input
          label="Código infração (opcional)"
          value={codigoInfracao}
          onChangeText={setCodigoInfracao}
        />
        <Input
          label="Valor (opcional)"
          value={valor}
          onChangeText={setValor}
          keyboardType="decimal-pad"
        />
        <Input
          label="Local infração (opcional)"
          value={localInfracao}
          onChangeText={setLocalInfracao}
        />
        <Input label="Natureza (opcional)" value={natureza} onChangeText={setNatureza} />
        <Input label="Local (opcional)" value={local} onChangeText={setLocal} />
      </View>
    </FormSheet>
  );
}

export function confirmDeleteIncident(
  incident: Incident,
  onConfirm: () => void,
) {
  Alert.alert(
    "Excluir incidente",
    `Remover este registro (${incident.tipo})?`,
    [
      { text: "Cancelar", style: "cancel" },
      { text: "Excluir", style: "destructive", onPress: onConfirm },
    ],
  );
}

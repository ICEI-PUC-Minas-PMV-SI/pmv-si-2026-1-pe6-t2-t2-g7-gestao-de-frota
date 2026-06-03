import { useEffect, useState } from "react";
import { Alert, Text, View } from "react-native";

import { Button } from "../ui/Button";
import { CurrencyInput } from "../ui/CurrencyInput";
import { DateInput } from "../ui/DateInput";
import { FormSheet } from "../ui/FormSheet";
import { Input } from "../ui/Input";
import { OptionChips } from "../ui/OptionChips";
import { SelectField } from "../ui/SelectField";
import {
  isoToDateBrMask,
  parseDateBrMaskToIso,
  todayDateBrMask,
} from "../../utils/inputMasks";
import { useAuthorizedToken } from "../../hooks/useAuthorizedToken";
import { notifySuccess, showToast } from "../ui/toast";
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
  const [data, setData] = useState(todayDateBrMask());
  const [codigoInfracao, setCodigoInfracao] = useState("");
  const [valor, setValor] = useState<number | undefined>();
  const [localInfracao, setLocalInfracao] = useState("");
  const [natureza, setNatureza] = useState("");
  const [local, setLocal] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!visible) return;
    if (incident) {
      setVehicleId(incident.vehicleId);
      setTipo(incident.tipo);
      setStatus(incident.status);
      setSeveridade(incident.severidade);
      setDescricao(incident.descricao);
      setData(isoToDateBrMask(incident.data) || todayDateBrMask());
      setCodigoInfracao(incident.codigoInfracao ?? "");
      setValor(typeof incident.valor === "number" ? incident.valor : undefined);
      setLocalInfracao(incident.localInfracao ?? "");
      setNatureza(incident.natureza ?? "");
      setLocal(incident.local ?? "");
    } else {
      setVehicleId(vehicles[0]?.id ?? "");
      setTipo("multa");
      setStatus("aberto");
      setSeveridade("media");
      setDescricao("");
      setData(todayDateBrMask());
      setCodigoInfracao("");
      setValor(undefined);
      setLocalInfracao("");
      setNatureza("");
      setLocal("");
    }
  }, [visible, incident, vehicles]);

  async function onSubmit() {
    if (!vehicleId) {
      showToast({ message: "Selecione um veículo.", tone: "error" });
      return;
    }
    if (!descricao.trim()) {
      showToast({ message: "Informe a descrição.", tone: "error" });
      return;
    }

    const dataIso = parseDateBrMaskToIso(data);
    if (!dataIso) {
      showToast({
        message: "Informe uma data válida (DD/MM/AAAA).",
        tone: "error",
      });
      return;
    }

    const payload: {
      vehicleId: string;
      tipo: IncidentType;
      status: IncidentStatus;
      severidade: IncidentSeverity;
      descricao: string;
      data?: string;
      codigoInfracao?: string;
      valor?: number;
      localInfracao?: string;
      natureza?: string;
      local?: string;
    } = {
      vehicleId,
      tipo,
      status,
      severidade,
      descricao: descricao.trim(),
      data: dataIso,
    };

    if (tipo === "multa") {
      payload.codigoInfracao = codigoInfracao.trim() || undefined;
      payload.valor = valor;
      payload.localInfracao = localInfracao.trim() || undefined;
    } else {
      payload.natureza = natureza.trim() || undefined;
      payload.local = local.trim() || undefined;
    }

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
      notifySuccess(
        isEdit ? "Incidente atualizado com sucesso." : "Incidente registrado com sucesso.",
      );
      onSaved();
      onClose();
    } catch {
      // Toast exibido pelo AxiosAdapter.
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
        {vehicles.length === 0 ? (
          <Text className="text-sm text-muted-foreground">
            Cadastre um veículo antes de registrar incidentes.
          </Text>
        ) : (
          <SelectField
            label="Veículo"
            placeholder="Selecione o veículo"
            options={vehicles.map((v) => ({
              value: v.id,
              label: `${v.placa} · ${v.marca} ${v.modelo}`.trim(),
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
          nativeID="incident-descricao"
          value={descricao}
          onChangeText={setDescricao}
          placeholder="Descreva o ocorrido..."
          multiline
          numberOfLines={3}
          style={{ minHeight: 80, textAlignVertical: "top" }}
        />
        <DateInput
          label="Data do incidente"
          value={data}
          onChangeValue={setData}
        />
        {tipo === "multa" ? (
          <>
            <Input
              label="Código da infração"
              nativeID="incident-codigoInfracao"
              value={codigoInfracao}
              onChangeText={setCodigoInfracao}
              placeholder="Ex.: 745-50"
            />
            <CurrencyInput
              label="Valor (R$)"
              nativeID="incident-valor"
              value={valor}
              onChangeValue={setValor}
            />
            <Input
              label="Local da infração"
              nativeID="incident-localInfracao"
              value={localInfracao}
              onChangeText={setLocalInfracao}
              placeholder="Onde ocorreu a multa"
            />
          </>
        ) : (
          <>
            <Input
              label="Natureza"
              value={natureza}
              onChangeText={setNatureza}
              placeholder="ex: colisão, roubo, avaria"
            />
            <Input
              label="Local"
              value={local}
              onChangeText={setLocal}
              placeholder="Local do sinistro"
            />
          </>
        )}
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

import { Pressable, Text, View } from "react-native";

import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";
import type { Incident } from "../../core/modules/incidents/types";
import type { Vehicle } from "../../core/modules/vehicles/types";
import {
  SEVERITY_LABEL,
  SEVERITY_TONE,
  STATUS_LABEL,
  STATUS_TONE,
} from "../../theme/incidents";
import { formatCurrency, formatRelative } from "../../utils/format";

type Props = {
  incident: Incident;
  vehicle?: Vehicle;
  onEdit: () => void;
  onDelete: () => void;
};

export function IncidentCard({
  incident,
  vehicle,
  onEdit,
  onDelete,
}: Props) {
  return (
    <Card>
      <View className="flex-row items-center justify-between">
        <Text className="text-base font-semibold capitalize text-foreground">
          {incident.tipo}
        </Text>
        <Badge tone={SEVERITY_TONE[incident.severidade]}>
          {SEVERITY_LABEL[incident.severidade]}
        </Badge>
      </View>
      <Text className="mt-2 text-sm text-muted-foreground">{incident.descricao}</Text>
      {vehicle ? (
        <Text className="mt-2 font-mono text-xs text-muted-foreground">
          {vehicle.placa} · {vehicle.marca} {vehicle.modelo}
        </Text>
      ) : null}
      <View className="mt-3 flex-row items-center justify-between">
        <Text className="text-xs text-muted-foreground">
          {formatRelative(incident.data)}
        </Text>
        <Badge tone={STATUS_TONE[incident.status]}>
          {STATUS_LABEL[incident.status]}
        </Badge>
      </View>
      {typeof incident.valor === "number" ? (
        <Text className="mt-2 text-sm font-medium text-foreground">
          {formatCurrency(incident.valor)}
        </Text>
      ) : null}
      <View className="mt-4 flex-row gap-2">
        <Pressable
          onPress={onEdit}
          accessibilityRole="button"
          accessibilityLabel="Editar incidente"
          className="flex-1 items-center rounded-lg border border-border py-2.5"
        >
          <Text className="text-sm font-medium text-foreground">Editar</Text>
        </Pressable>
        <Pressable
          onPress={onDelete}
          accessibilityRole="button"
          accessibilityLabel="Excluir incidente"
          className="flex-1 items-center rounded-lg border border-destructive/40 py-2.5"
        >
          <Text className="text-sm font-medium text-destructive">Excluir</Text>
        </Pressable>
      </View>
    </Card>
  );
}

import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Image } from "expo-image";

import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";
import type { Vehicle } from "../../core/modules/vehicles/types";
import {
  FALLBACK_VEHICLE_IMAGE,
  resolveVehiclePhotoUri,
} from "../../utils/vehicleImage";

type Props = {
  vehicle: Vehicle;
  onEdit: () => void;
  onDelete: () => void;
};

export function VehicleCard({ vehicle, onEdit, onDelete }: Props) {
  const [photoUri, setPhotoUri] = useState(() =>
    resolveVehiclePhotoUri(vehicle.fotoUrl),
  );

  return (
    <Card className="overflow-hidden p-0">
      <Image
        source={{ uri: photoUri }}
        style={{ width: "100%", height: 140 }}
        contentFit="cover"
        transition={200}
        onError={() => setPhotoUri(FALLBACK_VEHICLE_IMAGE)}
      />
      <View className="p-4">
        <View className="flex-row items-center justify-between gap-2">
          <Text
            className="flex-1 text-base font-semibold text-foreground"
            numberOfLines={1}
          >
            {vehicle.marca} {vehicle.modelo}
          </Text>
          <Badge tone="primary">{vehicle.placa}</Badge>
        </View>
        <View className="mt-3 flex-row flex-wrap gap-4">
          <Stat label="Ano" value={String(vehicle.ano)} />
          <Stat label="Tanque" value={`${vehicle.tamanhoTanque} L`} />
          <Stat
            label="Consumo"
            value={`${vehicle.consumoMedio.toFixed(1)} km/L`}
          />
        </View>
        <View className="mt-4 flex-row gap-2">
          <Pressable
            onPress={onEdit}
            className="flex-1 items-center rounded-lg border border-border py-2.5"
          >
            <Text className="text-sm font-medium text-foreground">Editar</Text>
          </Pressable>
          <Pressable
            onPress={onDelete}
            className="flex-1 items-center rounded-lg border border-destructive/40 py-2.5"
          >
            <Text className="text-sm font-medium text-destructive">Excluir</Text>
          </Pressable>
        </View>
      </View>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View>
      <Text className="text-[11px] uppercase tracking-widest text-muted-foreground">
        {label}
      </Text>
      <Text className="text-sm font-medium text-foreground">{value}</Text>
    </View>
  );
}

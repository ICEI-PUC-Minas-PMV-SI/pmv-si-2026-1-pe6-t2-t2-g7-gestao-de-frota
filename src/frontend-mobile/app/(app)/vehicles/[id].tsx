import { Redirect, useLocalSearchParams } from "expo-router";

export default function VehicleDetailsAliasScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  if (!id) {
    return <Redirect href="/vehicles" />;
  }

  return <Redirect href={`/(app)/vehicle/${id}`} />;
}

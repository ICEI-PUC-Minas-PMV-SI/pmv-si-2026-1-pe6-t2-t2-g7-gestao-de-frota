import { Redirect, useLocalSearchParams } from "expo-router";

export default function VehicleIncidentsRouteRedirect() {
  const { id } = useLocalSearchParams<{ id: string }>();

  if (!id) {
    return <Redirect href="/(app)/vehicles" />;
  }

  return <Redirect href={`/(app)/vehicles?openVehicle=${id}&view=incidents`} />;
}

import { Redirect, useLocalSearchParams } from "expo-router";

export default function VehicleJourneysRouteRedirect() {
  const { id } = useLocalSearchParams<{ id: string }>();

  if (!id) {
    return <Redirect href="/(app)/vehicles" />;
  }

  return <Redirect href={`/(app)/vehicles?openVehicle=${id}&view=journeys`} />;
}

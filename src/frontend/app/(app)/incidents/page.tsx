import IncidentsPageClient, {
  type Incident,
  type Vehicle,
} from "./page.client";
import { serverFetchJson } from "@/lib/server-api";

export default async function IncidentsPage() {
  const [initialIncidents, initialVehicles] = await Promise.all([
    serverFetchJson<Incident[]>("/incident"),
    serverFetchJson<Vehicle[]>("/vehicle"),
  ]);

  return (
    <IncidentsPageClient
      initialIncidents={initialIncidents ?? []}
      initialVehicles={initialVehicles ?? []}
    />
  );
}

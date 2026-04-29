import DashboardPageClient, {
  type Incident,
  type Vehicle,
} from "./page.client";
import { serverFetchJson } from "@/lib/server-api";

async function getInitialDashboardData() {
  const [initialVehicles, initialIncidents] = await Promise.all([
    serverFetchJson<Vehicle[]>("/vehicle"),
    serverFetchJson<Incident[]>("/incident"),
  ]);

  return {
    initialVehicles: Array.isArray(initialVehicles) ? initialVehicles : [],
    initialIncidents: Array.isArray(initialIncidents) ? initialIncidents : [],
    initialRefreshedAt: new Date().toISOString(),
  };
}

export default async function DashboardPage() {
  const { initialVehicles, initialIncidents, initialRefreshedAt } =
    await getInitialDashboardData();

  return (
    <DashboardPageClient
      initialVehicles={initialVehicles}
      initialIncidents={initialIncidents}
      initialRefreshedAt={initialRefreshedAt}
    />
  );
}

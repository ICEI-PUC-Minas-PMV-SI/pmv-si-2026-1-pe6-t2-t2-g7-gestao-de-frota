import VehiclesPageClient, { type Vehicle } from "./page.client";
import { serverFetchJson } from "@/lib/server-api";

export default async function VehiclesPage() {
  const initialVehicles =
    (await serverFetchJson<Vehicle[]>("/vehicle")) ?? [];

  return <VehiclesPageClient initialVehicles={initialVehicles} />;
}

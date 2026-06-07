import { useCallback, useEffect, useMemo, useState } from "react";

import { journeyModule } from "../core/modules/journeys/journeys";
import type { JourneyHistory } from "../core/modules/journeys/types";
import { incidentModule, Incident } from "../core/modules/incidents/incidents";
import { vehicleModule, Vehicle } from "../core/modules/vehicles/vehicles";
import { useAuthorizedToken } from "./useAuthorizedToken";
import { notifyApiError } from "../components/ui/toast";
import { getApiErrorMessage } from "../utils/apiError";

export function useFleetData() {
  const getToken = useAuthorizedToken();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [journeys, setJourneys] = useState<
    (JourneyHistory & { vehicle?: Vehicle })[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshedAt, setRefreshedAt] = useState<Date | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const idToken = await getToken();
      const [vRes, iRes] = await Promise.all([
        vehicleModule.gateways.list.exec({ idToken }),
        incidentModule.gateways.list.exec({ idToken }),
      ]);
      const vehiclesList = vRes.body;
      setVehicles(vehiclesList);
      setIncidents(iRes.body);

      const journeyLists = await Promise.all(
        vehiclesList.map(async (vehicle) => {
          try {
            const jRes = await journeyModule.gateways.listVehicleJourneys.exec({
              idToken,
              vehicleId: vehicle.id,
            });
            return jRes.body.map((journey) => ({ ...journey, vehicle }));
          } catch {
            return [];
          }
        }),
      );
      setJourneys(journeyLists.flat());
      setRefreshedAt(new Date());
    } catch (err: unknown) {
      const message =
        getApiErrorMessage(err) || "Erro ao carregar dados da frota.";
      setError(message);
      notifyApiError(err, "Erro ao carregar dados da frota.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [getToken]);

  useEffect(() => {
    load();
  }, [load]);

  const stats = useMemo(() => {
    const byStatus = {
      aberto: 0,
      em_analise: 0,
      resolvido: 0,
      cancelado: 0,
    } as Record<Incident["status"], number>;
    const bySeverity = {
      baixa: 0,
      media: 0,
      alta: 0,
      critica: 0,
    } as Record<Incident["severidade"], number>;

    let multasValor = 0;
    let multasCount = 0;
    let sinistrosCount = 0;

    for (const inc of incidents) {
      byStatus[inc.status]++;
      bySeverity[inc.severidade]++;
      if (inc.tipo === "multa") {
        multasCount++;
        if (typeof inc.valor === "number") multasValor += inc.valor;
      } else {
        sinistrosCount++;
      }
    }

    const total = incidents.length;
    const ativos = byStatus.aberto + byStatus.em_analise;
    const resolvidos = byStatus.resolvido;
    const taxaResolucao =
      total > 0 ? Math.round((resolvidos / total) * 100) : 0;

    return {
      total,
      ativos,
      resolvidos,
      taxaResolucao,
      byStatus,
      bySeverity,
      multasValor,
      multasCount,
      sinistrosCount,
    };
  }, [incidents]);

  const journeyStats = useMemo(() => {
    const inProgress = journeys.filter((j) => j.status === "in_progress").length;
    const completed = journeys.filter((j) => j.status === "completed").length;
    const totalKm = journeys.reduce((sum, j) => sum + (j.kmRodados ?? 0), 0);
    return {
      total: journeys.length,
      inProgress,
      completed,
      totalKm,
    };
  }, [journeys]);

  const recentJourneys = useMemo(
    () =>
      [...journeys]
        .sort(
          (a, b) =>
            new Date(b.iniciadaEm).getTime() - new Date(a.iniciadaEm).getTime(),
        )
        .slice(0, 3),
    [journeys],
  );

  return {
    vehicles,
    incidents,
    journeys,
    journeyStats,
    recentJourneys,
    stats,
    loading,
    refreshing,
    error,
    refreshedAt,
    refresh: () => {
      setRefreshing(true);
      return load();
    },
  };
}

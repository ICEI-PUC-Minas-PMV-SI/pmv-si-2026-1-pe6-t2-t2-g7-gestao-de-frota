import { useCallback, useEffect, useMemo, useState } from "react";

import { incidentModule, Incident } from "../core/modules/incidents/incidents";
import { vehicleModule, Vehicle } from "../core/modules/vehicles/vehicles";
import { useAuthorizedToken } from "./useAuthorizedToken";

export function useFleetData() {
  const getToken = useAuthorizedToken();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
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
      setVehicles(vRes.body);
      setIncidents(iRes.body);
      setRefreshedAt(new Date());
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Erro ao carregar dados da frota.";
      setError(message);
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

  const recentIncidents = useMemo(() => {
    const vehicleById = new Map(vehicles.map((v) => [v.id, v]));
    return [...incidents]
      .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
      .slice(0, 5)
      .map((inc) => ({ ...inc, vehicle: vehicleById.get(inc.vehicleId) }));
  }, [incidents, vehicles]);

  return {
    vehicles,
    incidents,
    stats,
    recentIncidents,
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

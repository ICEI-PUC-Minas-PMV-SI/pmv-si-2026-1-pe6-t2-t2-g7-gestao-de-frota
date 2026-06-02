export type JourneyHistoryStatus = "in_progress" | "completed" | "cancelled";

export type JourneyHistory = {
  id: string;
  userId: number;
  vehicleId: string;
  nome?: string;
  status: JourneyHistoryStatus;
  kmRodados: number;
  combustivelGasto: number;
  nivelCombustivel: number;
  iniciadaEm: string;
  criadaEm: string;
  atualizadaEm: string;
};

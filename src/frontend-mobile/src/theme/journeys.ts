import type { JourneyHistoryStatus } from "../core/modules/journeys/types";
import type { Tone } from "../components/ui/Badge";

export const JOURNEY_STATUS_LABEL: Record<JourneyHistoryStatus, string> = {
  in_progress: "Em andamento",
  completed: "Concluída",
  cancelled: "Cancelada",
};

export const JOURNEY_STATUS_TONE: Record<JourneyHistoryStatus, Tone> = {
  in_progress: "primary",
  completed: "success",
  cancelled: "warning",
};

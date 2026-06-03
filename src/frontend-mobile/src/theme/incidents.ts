import type {
  IncidentSeverity,
  IncidentStatus,
} from "../core/modules/incidents/types";
import type { Tone } from "../components/ui/Badge";

export const SEVERITY_LABEL: Record<IncidentSeverity, string> = {
  baixa: "Baixa",
  media: "Média",
  alta: "Alta",
  critica: "Crítica",
};

export const STATUS_LABEL: Record<IncidentStatus, string> = {
  aberto: "Aberto",
  em_analise: "Em análise",
  resolvido: "Resolvido",
  cancelado: "Cancelado",
};

export const SEVERITY_TONE: Record<IncidentSeverity, Tone> = {
  baixa: "success",
  media: "warning",
  alta: "destructive",
  critica: "destructive",
};

export const STATUS_TONE: Record<IncidentStatus, Tone> = {
  aberto: "warning",
  em_analise: "primary",
  resolvido: "success",
  cancelado: "neutral",
};

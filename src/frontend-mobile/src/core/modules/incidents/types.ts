export type IncidentType = "multa" | "sinistro";
export type IncidentStatus =
  | "aberto"
  | "em_analise"
  | "resolvido"
  | "cancelado";
export type IncidentSeverity = "baixa" | "media" | "alta" | "critica";

export type Incident = {
  id: string;
  vehicleId: string;
  tipo: IncidentType;
  status: IncidentStatus;
  severidade: IncidentSeverity;
  descricao: string;
  codigoInfracao?: string;
  valor?: number;
  localInfracao?: string;
  natureza?: string;
  local?: string;
  data: string;
  createdAt: string;
  updatedAt: string;
};

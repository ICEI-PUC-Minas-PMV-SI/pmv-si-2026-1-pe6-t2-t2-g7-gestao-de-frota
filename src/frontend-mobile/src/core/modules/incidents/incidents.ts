import { ListIncidentsGateway } from "./gateways/ListIncidents.gateway";

export const incidentModule = {
  gateways: {
    list: new ListIncidentsGateway(),
  },
};

export type {
  Incident,
  IncidentSeverity,
  IncidentStatus,
  IncidentType,
} from "./types";

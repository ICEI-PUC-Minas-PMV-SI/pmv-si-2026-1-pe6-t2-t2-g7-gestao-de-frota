import { CreateIncidentGateway } from "./gateways/CreateIncident.gateway";
import { ListIncidentsGateway } from "./gateways/ListIncidents.gateway";
import { ListIncidentsByVehicleGateway } from "./gateways/ListIncidentsByVehicle.gateway";

export const incidentModule = {
  gateways: {
    create: new CreateIncidentGateway(),
    list: new ListIncidentsGateway(),
    listByVehicle: new ListIncidentsByVehicleGateway(),
  },
};

export type {
  Incident,
  IncidentSeverity,
  IncidentStatus,
  IncidentType,
} from "./types";

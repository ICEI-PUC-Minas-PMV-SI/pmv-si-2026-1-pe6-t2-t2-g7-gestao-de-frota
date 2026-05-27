import { CreateIncidentGateway } from "./gateways/CreateIncident.gateway";
import { DeleteIncidentGateway } from "./gateways/DeleteIncident.gateway";
import { ListIncidentsGateway } from "./gateways/ListIncidents.gateway";
import { UpdateIncidentGateway } from "./gateways/UpdateIncident.gateway";

export const incidentModule = {
  gateways: {
    list: new ListIncidentsGateway(),
    create: new CreateIncidentGateway(),
    update: new UpdateIncidentGateway(),
    delete: new DeleteIncidentGateway(),
  },
};

export type {
  Incident,
  IncidentSeverity,
  IncidentStatus,
  IncidentType,
} from "./types";

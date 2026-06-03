import { CreateIncidentGateway } from "./gateways/CreateIncident.gateway";
import { DeleteIncidentGateway } from "./gateways/DeleteIncident.gateway";
import { ListIncidentsGateway } from "./gateways/ListIncidents.gateway";
import { ListIncidentsByVehicleGateway } from "./gateways/ListIncidentsByVehicle.gateway";
import { UpdateIncidentGateway } from "./gateways/UpdateIncident.gateway";

export const incidentModule = {
  gateways: {
    create: new CreateIncidentGateway(),
    list: new ListIncidentsGateway(),
    listByVehicle: new ListIncidentsByVehicleGateway(),
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

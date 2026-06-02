import { adapters } from "../../../adapters/adapters";
import { constants } from "../../../constants";
import { Incident, IncidentSeverity, IncidentStatus, IncidentType } from "../types";

export type CreateIncidentInput = {
  idToken: string;
  vehicleId: string;
  tipo: IncidentType;
  status: IncidentStatus;
  severidade: IncidentSeverity;
  descricao: string;
  valor?: number;
  local?: string;
  localInfracao?: string;
  natureza?: string;
  codigoInfracao?: string;
  data?: string;
};

export class CreateIncidentGateway {
  async exec(props: CreateIncidentInput) {
    const url = constants.API_BASE;
    return adapters.http.post<Incident>({
      url: `${url}/incident`,
      headers: new Headers({
        Authorization: `Bearer ${props.idToken}`,
      }),
      body: {
        vehicleId: props.vehicleId,
        tipo: props.tipo,
        status: props.status,
        severidade: props.severidade,
        descricao: props.descricao,
        valor: props.valor,
        local: props.local,
        localInfracao: props.localInfracao,
        natureza: props.natureza,
        codigoInfracao: props.codigoInfracao,
        data: props.data,
      },
    });
  }
}

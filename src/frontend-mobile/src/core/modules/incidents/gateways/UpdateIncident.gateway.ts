import { adapters } from "../../../adapters/adapters";
import { constants } from "../../../constants";
import { Incident } from "../types";

export type UpdateIncidentInput = {
  idToken: string;
  incidentId: string;
  vehicleId?: string;
  tipo?: Incident["tipo"];
  status?: Incident["status"];
  severidade?: Incident["severidade"];
  descricao?: string;
  codigoInfracao?: string;
  valor?: number;
  localInfracao?: string;
  natureza?: string;
  local?: string;
  data?: string;
};

export class UpdateIncidentGateway {
  async exec(props: UpdateIncidentInput) {
    const url = constants.API_BASE;
    const { idToken, incidentId, ...body } = props;
    return adapters.http.patch<Incident>({
      url: `${url}/incident/${incidentId}`,
      headers: new Headers({
        Authorization: `Bearer ${idToken}`,
        "Content-Type": "application/json",
      }),
      body,
    });
  }
}

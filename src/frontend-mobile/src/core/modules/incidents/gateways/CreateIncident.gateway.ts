import { adapters } from "../../../adapters/adapters";
import { constants } from "../../../constants";
import { Incident } from "../types";

export type CreateIncidentInput = {
  idToken: string;
  vehicleId: string;
  tipo: Incident["tipo"];
  status: Incident["status"];
  severidade: Incident["severidade"];
  descricao: string;
  codigoInfracao?: string;
  valor?: number;
  localInfracao?: string;
  natureza?: string;
  local?: string;
  data?: string;
};

export class CreateIncidentGateway {
  async exec(props: CreateIncidentInput) {
    const url = constants.API_BASE;
    const { idToken, ...body } = props;
    return adapters.http.post<Incident>({
      url: `${url}/incident`,
      headers: new Headers({
        Authorization: `Bearer ${idToken}`,
        "Content-Type": "application/json",
      }),
      body,
    });
  }
}

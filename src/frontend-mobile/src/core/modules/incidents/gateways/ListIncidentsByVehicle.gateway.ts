import { adapters } from "../../../adapters/adapters";
import { constants } from "../../../constants";
import { Incident } from "../types";

export class ListIncidentsByVehicleGateway {
  async exec(props: { idToken: string; vehicleId: string }) {
    const url = constants.API_BASE;
    return adapters.http.get<Incident[]>({
      url: `${url}/incident/vehicle/${props.vehicleId}`,
      headers: new Headers({
        Authorization: `Bearer ${props.idToken}`,
      }),
    });
  }
}

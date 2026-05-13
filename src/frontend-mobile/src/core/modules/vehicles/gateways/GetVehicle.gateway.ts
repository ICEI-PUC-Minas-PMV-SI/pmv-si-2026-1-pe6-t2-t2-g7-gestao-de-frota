import { adapters } from "../../../adapters/adapters";
import { constants } from "../../../constants";
import { Vehicle } from "../types";

export class GetVehicleGateway {
  async exec(props: { idToken: string; vehicleId: string }) {
    const url = constants.API_BASE;
    return adapters.http.get<Vehicle>({
      url: `${url}/vehicle/${props.vehicleId}`,
      headers: new Headers({
        Authorization: `Bearer ${props.idToken}`,
      }),
    });
  }
}

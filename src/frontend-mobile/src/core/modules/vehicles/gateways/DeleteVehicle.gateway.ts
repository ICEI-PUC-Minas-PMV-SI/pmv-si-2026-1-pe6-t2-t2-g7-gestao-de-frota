import { adapters } from "../../../adapters/adapters";
import { constants } from "../../../constants";

export class DeleteVehicleGateway {
  async exec(props: { idToken: string; vehicleId: string }) {
    const url = constants.API_BASE;
    return adapters.http.delete<void>({
      url: `${url}/vehicle/${props.vehicleId}`,
      headers: new Headers({
        Authorization: `Bearer ${props.idToken}`,
      }),
    });
  }
}

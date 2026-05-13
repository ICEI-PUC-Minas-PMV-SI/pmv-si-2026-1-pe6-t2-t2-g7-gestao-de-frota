import { adapters } from "../../../adapters/adapters";
import { constants } from "../../../constants";
import { Vehicle } from "../types";

export class ListVehiclesGateway {
  async exec(props: { idToken: string }) {
    const url = constants.API_BASE;
    return adapters.http.get<Vehicle[]>({
      url: `${url}/vehicle`,
      headers: new Headers({
        Authorization: `Bearer ${props.idToken}`,
      }),
    });
  }
}

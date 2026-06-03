import { adapters } from "../../../adapters/adapters";
import { constants } from "../../../constants";
import { JourneyHistory } from "../types";

export class ListVehicleJourneysGateway {
  async exec(props: { idToken: string; vehicleId: string }) {
    const url = constants.API_BASE;
    return adapters.http.get<JourneyHistory[]>({
      url: `${url}/vehicle/${props.vehicleId}/journeys`,
      headers: new Headers({
        Authorization: `Bearer ${props.idToken}`,
      }),
    });
  }
}

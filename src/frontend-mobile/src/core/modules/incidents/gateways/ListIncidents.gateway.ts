import { adapters } from "../../../adapters/adapters";
import { constants } from "../../../constants";
import { Incident } from "../types";

export class ListIncidentsGateway {
  async exec(props: { idToken: string }) {
    const url = constants.API_BASE;
    return adapters.http.get<Incident[]>({
      url: `${url}/incident`,
      headers: new Headers({
        Authorization: `Bearer ${props.idToken}`,
      }),
    });
  }
}

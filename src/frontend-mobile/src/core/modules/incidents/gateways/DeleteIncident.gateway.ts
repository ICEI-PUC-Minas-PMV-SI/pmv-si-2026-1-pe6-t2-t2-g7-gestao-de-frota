import { adapters } from "../../../adapters/adapters";
import { constants } from "../../../constants";

export class DeleteIncidentGateway {
  async exec(props: { idToken: string; incidentId: string }) {
    const url = constants.API_BASE;
    return adapters.http.delete<void>({
      url: `${url}/incident/${props.incidentId}`,
      headers: new Headers({
        Authorization: `Bearer ${props.idToken}`,
      }),
    });
  }
}

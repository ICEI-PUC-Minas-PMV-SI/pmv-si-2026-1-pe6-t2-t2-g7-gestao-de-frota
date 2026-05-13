import { adapters } from "../../../adapters/adapters";
import { constants } from "../../../constants";

interface IProps {
  idToken: string;
  name?: string;
}

export class SyncUserGateway {
  async exec(props: IProps) {
    const url = constants.API_BASE;
    await adapters.http.post({
      url: `${url}/account/sync`,
      headers: new Headers({
        Authorization: `Bearer ${props.idToken}`,
      }),
      body: { name: props.name },
    });
  }
}

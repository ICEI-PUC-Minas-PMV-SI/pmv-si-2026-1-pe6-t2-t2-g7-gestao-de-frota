import { adapters } from "../../../adapters/adapters";
import { constants } from "../../../constants";
import { ApiUser } from "../types";

interface IProps {
  idToken: string;
  name?: string;
}

export class SyncUserGateway {
  async exec(props: IProps) {
    const url = constants.API_BASE;
    return adapters.http.post<ApiUser>({
      url: `${url}/account/sync`,
      headers: new Headers({
        Authorization: `Bearer ${props.idToken}`,
        "Content-Type": "application/json",
      }),
      body: { name: props.name },
    });
  }
}

import { adapters } from "../../../adapters/adapters";
import { constants } from "../../../constants";
import { ApiUser } from "../types";

export class UpdateUserGateway {
  async exec(props: { idToken: string; userId: number; name: string }) {
    const url = constants.API_BASE;
    const res = await adapters.http.patch<ApiUser>({
      url: `${url}/account/${props.userId}`,
      headers: new Headers({
        Authorization: `Bearer ${props.idToken}`,
        "Content-Type": "application/json",
      }),
      body: { name: props.name },
    });
    return res;
  }
}

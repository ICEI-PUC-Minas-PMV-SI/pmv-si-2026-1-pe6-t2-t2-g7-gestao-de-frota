import { adapters } from "../../../adapters/adapters";
import { constants } from "../../../constants";
import { MembersResponse } from "../types";

export class ListMembersGateway {
  async exec(props: { idToken: string; limit?: number }) {
    const url = constants.API_BASE;
    const limit = props.limit ?? 20;
    return adapters.http.get<MembersResponse>({
      url: `${url}/members?limit=${limit}`,
      headers: new Headers({
        Authorization: `Bearer ${props.idToken}`,
      }),
    });
  }
}

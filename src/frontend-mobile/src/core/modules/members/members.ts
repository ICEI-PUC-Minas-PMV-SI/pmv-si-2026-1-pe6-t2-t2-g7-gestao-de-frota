import { ListMembersGateway } from "./gateways/ListMembers.gateway";

export const memberModule = {
  gateways: {
    list: new ListMembersGateway(),
  },
};

export type { Member, MemberRole, MembersResponse } from "./types";

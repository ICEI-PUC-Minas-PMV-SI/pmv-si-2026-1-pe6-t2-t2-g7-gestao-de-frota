import { SyncUserGateway } from "./gateways/SyncUser.gateway";
import { UpdateUserGateway } from "./gateways/UpdateUser.gateway";

export const userModule = {
  gateways: {
    sync: new SyncUserGateway(),
    update: new UpdateUserGateway(),
  },
};

export type { ApiUser } from "./types";

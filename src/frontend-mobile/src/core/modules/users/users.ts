import { SyncUserGateway } from "./gateways/SyncUser.gateway";

export const userModule = {
  gateways: {
    sync: new SyncUserGateway(),
  },
};

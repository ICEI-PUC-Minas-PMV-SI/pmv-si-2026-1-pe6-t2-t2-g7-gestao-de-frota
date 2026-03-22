import { SyncUserGateway } from "./gateways/user/SyncUser.gateway";

export const userModule = {
	gateways: {
		sync: new SyncUserGateway()
	}
}

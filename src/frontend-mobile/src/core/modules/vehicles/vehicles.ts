import { CreateVehicleGateway } from "./gateways/CreateVehicle.gateway";
import { DeleteVehicleGateway } from "./gateways/DeleteVehicle.gateway";
import { GetVehicleGateway } from "./gateways/GetVehicle.gateway";
import { ListVehiclesGateway } from "./gateways/ListVehicles.gateway";
import { UpdateVehicleGateway } from "./gateways/UpdateVehicle.gateway";

export const vehicleModule = {
  gateways: {
    create: new CreateVehicleGateway(),
    delete: new DeleteVehicleGateway(),
    list: new ListVehiclesGateway(),
    get: new GetVehicleGateway(),
    update: new UpdateVehicleGateway(),
  },
};

export type { Vehicle } from "./types";

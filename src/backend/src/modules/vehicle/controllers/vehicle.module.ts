import { Module } from '@nestjs/common';
import { VehicleRepoModule } from '../repositories/vehicleRepo.module';
import { CreateVehicleService } from '../services/CreateVehicle.service';
import { UpdateVehicleService } from '../services/UpdateVehicle.service';
import { FindVehicleService } from '../services/FindVehicle.service';
import { FindAllVehiclesService } from '../services/FindAllVehicles.service';
import { DeleteVehicleService } from '../services/DeleteVehicle.service';
import { CreateVehicleController } from './vehicle/CreateVehicle.controller';
import { FindVehicleController } from './vehicle/FindVehicle.controller';
import { FindAllVehiclesController } from './vehicle/FindAllVehicles.controller';
import { UpdateVehicleController } from './vehicle/UpdateVehicle.controller';
import { DeleteVehicleController } from './vehicle/DeleteVehicle.controller';

@Module({
  imports: [VehicleRepoModule],
  controllers: [
    CreateVehicleController,
    FindVehicleController,
    FindAllVehiclesController,
    UpdateVehicleController,
    DeleteVehicleController,
  ],
  providers: [
    CreateVehicleService,
    UpdateVehicleService,
    FindVehicleService,
    FindAllVehiclesService,
    DeleteVehicleService,
  ],
})
export class VehicleModule {}

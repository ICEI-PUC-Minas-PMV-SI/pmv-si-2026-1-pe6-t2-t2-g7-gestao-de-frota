import { Injectable } from '@nestjs/common';
import { VehicleRepo } from '../repositories/vehicle/interface';

@Injectable()
export class FindAllVehiclesService {
  constructor(private readonly vehicleRepo: VehicleRepo) {}

  async exec() {
    return await this.vehicleRepo.findAll();
  }
}

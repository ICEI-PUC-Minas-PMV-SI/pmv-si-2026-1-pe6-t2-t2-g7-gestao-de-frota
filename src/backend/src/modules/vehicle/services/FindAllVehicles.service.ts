import { Injectable } from '@nestjs/common';
import { VehicleRepo } from '../repositories/vehicle/interface';

@Injectable()
export class FindAllVehiclesService {
  constructor(private readonly vehicleRepo: VehicleRepo) {}

  async exec(userId: number) {
    return await this.vehicleRepo.findAllByUserId(userId);
  }
}

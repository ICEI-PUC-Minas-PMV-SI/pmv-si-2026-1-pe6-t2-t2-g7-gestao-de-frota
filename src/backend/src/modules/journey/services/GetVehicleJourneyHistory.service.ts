import { Injectable, NotFoundException } from '@nestjs/common';
import { JourneyRepo } from '../repositories/journey/interface';
import { VehicleRepo } from '../../vehicle/repositories/vehicle/interface';

export type GetVehicleJourneyHistoryInput = {
  vehicleId: string;
};

@Injectable()
export class GetVehicleJourneyHistoryService {
  constructor(
    private readonly vehicleRepo: VehicleRepo,
    private readonly journeyRepo: JourneyRepo,
  ) {}

  async exec(input: GetVehicleJourneyHistoryInput) {
    const vehicle = await this.vehicleRepo.findById(input.vehicleId);
    if (!vehicle) {
      throw new NotFoundException('Veículo não encontrado.');
    }

    const journeys = await this.journeyRepo.findByVehicleId(input.vehicleId);
    return journeys.map((journey) => ({
      id: journey.id,
      userId: journey.userId,
      vehicleId: journey.vehicleId,
      nome: journey.name,
      status: journey.status,
      kmRodados: journey.kmRodados,
      combustivelGasto: journey.combustivelGasto,
      nivelCombustivel: journey.nivelCombustivel,
      iniciadaEm: journey.startedAt.toISOString(),
      criadaEm: journey.createdAt.toISOString(),
      atualizadaEm: journey.updatedAt.toISOString(),
    }));
  }
}

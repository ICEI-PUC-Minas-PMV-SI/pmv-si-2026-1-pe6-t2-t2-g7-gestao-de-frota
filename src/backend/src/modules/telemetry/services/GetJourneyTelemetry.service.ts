import { Injectable, NotFoundException } from '@nestjs/common';
import { TelemetryRepo } from '../repositories/telemetry/interface';
import { VehicleRepo } from '../../vehicle/repositories/vehicle/interface';

export type GetJourneyTelemetryInput = {
  vehicleId: string;
};

@Injectable()
export class GetJourneyTelemetryService {
  constructor(
    private readonly vehicleRepo: VehicleRepo,
    private readonly telemetryRepo: TelemetryRepo,
  ) {}

  async exec(input: GetJourneyTelemetryInput) {
    const vehicle = await this.vehicleRepo.findById(input.vehicleId);
    if (!vehicle) {
      throw new NotFoundException('Veículo não encontrado.');
    }

    const rows = await this.telemetryRepo.findByVehicleId(input.vehicleId);

    return rows.map((row) => ({
      id: row.id,
      vehicleId: row.vehicleId,
      kmRodados: row.kmRodados,
      combustivelGasto: row.combustivelGasto,
      nivelCombustivel: row.nivelCombustivel,
      velocidadeMedia: row.velocidadeMedia,
      registradaEm: row.recordedAt.toISOString(),
    }));
  }
}

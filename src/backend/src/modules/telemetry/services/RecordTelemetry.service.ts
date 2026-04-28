import { Injectable, NotFoundException } from '@nestjs/common';
import { TelemetryRepo } from '../repositories/telemetry/interface';
import { TelemetryModel } from '../models/Telemetry.model';
import { VehicleRepo } from '../../vehicle/repositories/vehicle/interface';

export type RecordTelemetryInput = {
  vehicleId: string;
  kmRodados: number;
  combustivelGasto: number;
  nivelCombustivel: number;
  velocidadeMedia: number;
};

@Injectable()
export class RecordTelemetryService {
  constructor(
    private readonly vehicleRepo: VehicleRepo,
    private readonly telemetryRepo: TelemetryRepo,
  ) {}

  async exec(input: RecordTelemetryInput) {
    const vehicle = await this.vehicleRepo.findById(input.vehicleId);
    if (!vehicle) {
      throw new NotFoundException('Veículo não encontrado.');
    }

    const row = new TelemetryModel({
      vehicleId: input.vehicleId,
      kmRodados: input.kmRodados,
      combustivelGasto: input.combustivelGasto,
      nivelCombustivel: input.nivelCombustivel,
      velocidadeMedia: input.velocidadeMedia,
    });
    await this.telemetryRepo.create(row);

    return {
      id: row.id,
      vehicleId: row.vehicleId,
      kmRodados: row.kmRodados,
      combustivelGasto: row.combustivelGasto,
      nivelCombustivel: row.nivelCombustivel,
      velocidadeMedia: row.velocidadeMedia,
      registradaEm: row.recordedAt.toISOString(),
    };
  }
}

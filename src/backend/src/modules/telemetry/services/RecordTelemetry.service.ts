import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JourneyRepo } from '../../journey/repositories/journey/interface';
import { TelemetryRepo } from '../repositories/telemetry/interface';
import { TelemetryModel } from '../models/Telemetry.model';

export type RecordTelemetryInput = {
  userId: number;
  journeyId: string;
  vehicleId: string;
  kmRodados: number;
  combustivelGasto: number;
  nivelCombustivel: number;
  latitude: number;
  longitude: number;
  velocidadeMedia: number;
};

@Injectable()
export class RecordTelemetryService {
  constructor(
    private readonly journeyRepo: JourneyRepo,
    private readonly telemetryRepo: TelemetryRepo,
  ) {}

  async exec(input: RecordTelemetryInput) {
    const journey = await this.journeyRepo.findByIdForUser(
      input.journeyId,
      input.userId,
    );
    if (!journey) {
      throw new NotFoundException('Jornada não encontrada.');
    }
    if (journey.status !== 'in_progress') {
      throw new ForbiddenException(
        'Só é possível registrar telemetria em jornadas em curso.',
      );
    }

    const row = new TelemetryModel({
      journeyId: input.journeyId,
      vehicleId: input.vehicleId,
      kmRodados: input.kmRodados,
      combustivelGasto: input.combustivelGasto,
      nivelCombustivel: input.nivelCombustivel,
      latitude: input.latitude,
      longitude: input.longitude,
      velocidadeMedia: input.velocidadeMedia,
    });
    await this.telemetryRepo.create(row);

    return {
      id: row.id,
      journeyId: row.journeyId,
      vehicleId: row.vehicleId,
      kmRodados: row.kmRodados,
      combustivelGasto: row.combustivelGasto,
      nivelCombustivel: row.nivelCombustivel,
      latitude: row.latitude,
      longitude: row.longitude,
      velocidadeMedia: row.velocidadeMedia,
      registradaEm: row.recordedAt.toISOString(),
    };
  }
}

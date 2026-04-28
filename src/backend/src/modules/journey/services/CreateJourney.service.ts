import { Injectable, NotFoundException } from '@nestjs/common';
import { JourneyRepo } from '../repositories/journey/interface';
import { JourneyModel } from '../models/Journey.model';
import { JourneyStopModel } from '../models/JourneyStop.model';
import { VehicleRepo } from '../../vehicle/repositories/vehicle/interface';

export type CreateJourneyInput = {
  userId: number;
  vehicleId: string;
  nome?: string;
  paradas: { ordem: number; latitude: number; longitude: number }[];
};

@Injectable()
export class CreateJourneyService {
  constructor(
    private readonly journeyRepo: JourneyRepo,
    private readonly vehicleRepo: VehicleRepo,
  ) {}

  async exec(input: CreateJourneyInput) {
    const vehicle = await this.vehicleRepo.findById(input.vehicleId);
    if (!vehicle) {
      throw new NotFoundException('Veículo não encontrado.');
    }

    const startedAt = new Date();
    const journey = new JourneyModel({
      userId: input.userId,
      vehicleId: input.vehicleId,
      name: input.nome?.trim() || undefined,
      status: 'in_progress',
      kmRodados: 0,
      combustivelGasto: 0,
      nivelCombustivel: 100,
      startedAt,
    });

    const sorted = [...input.paradas].sort((a, b) => a.ordem - b.ordem);
    const stops = sorted.map(
      (p) =>
        new JourneyStopModel({
          journeyId: journey.id,
          stopOrder: p.ordem,
          latitude: p.latitude,
          longitude: p.longitude,
        }),
    );

    const { journey: saved, stops: savedStops } =
      await this.journeyRepo.createWithStops(journey, stops);

    return {
      id: saved.id,
      userId: saved.userId,
      vehicleId: saved.vehicleId,
      nome: saved.name,
      status: saved.status,
      kmRodados: saved.kmRodados,
      combustivelGasto: saved.combustivelGasto,
      nivelCombustivel: saved.nivelCombustivel,
      iniciadaEm: saved.startedAt.toISOString(),
      paradas: savedStops.map((s) => ({
        id: s.id,
        ordem: s.stopOrder,
        latitude: s.latitude,
        longitude: s.longitude,
      })),
      criadaEm: saved.createdAt.toISOString(),
      atualizadaEm: saved.updatedAt.toISOString(),
    };
  }
}

import { Injectable } from '@nestjs/common';
import { JourneyRepo } from '../repositories/journey/interface';
import { JourneyModel } from '../models/Journey.model';
import { JourneyStopModel } from '../models/JourneyStop.model';

export type CreateJourneyInput = {
  userId: number;
  nome?: string;
  paradas: { ordem: number; latitude: number; longitude: number }[];
};

@Injectable()
export class CreateJourneyService {
  constructor(private readonly journeyRepo: JourneyRepo) {}

  async exec(input: CreateJourneyInput) {
    const startedAt = new Date();
    const journey = new JourneyModel({
      userId: input.userId,
      name: input.nome?.trim() || undefined,
      status: 'in_progress',
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
      nome: saved.name,
      status: saved.status,
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

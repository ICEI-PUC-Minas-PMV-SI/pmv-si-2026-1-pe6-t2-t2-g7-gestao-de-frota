import { Injectable, NotFoundException } from '@nestjs/common';
import { JourneyRepo } from '../repositories/journey/interface';
import { VehicleRepo } from '../../vehicle/repositories/vehicle/interface';
import { TelemetryRepo } from '../../telemetry/repositories/telemetry/interface';
import { TelemetryModel } from '../../telemetry/models/Telemetry.model';

export type CompleteJourneyInput = {
  userId: number;
  journeyId: string;
};

function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

@Injectable()
export class CompleteJourneyService {
  constructor(
    private readonly journeyRepo: JourneyRepo,
    private readonly vehicleRepo: VehicleRepo,
    private readonly telemetryRepo: TelemetryRepo,
  ) {}

  async exec(input: CompleteJourneyInput) {
    const journey = await this.journeyRepo.findByIdForUser(
      input.journeyId,
      input.userId,
    );
    if (!journey) {
      throw new NotFoundException('Jornada não encontrada.');
    }

    if (journey.status === 'completed') {
      const stops = await this.journeyRepo.findStopsByJourneyId(journey.id);
      return {
        id: journey.id,
        userId: journey.userId,
        vehicleId: journey.vehicleId,
        nome: journey.name,
        status: journey.status,
        kmRodados: journey.kmRodados,
        combustivelGasto: journey.combustivelGasto,
        nivelCombustivel: journey.nivelCombustivel,
        iniciadaEm: journey.startedAt.toISOString(),
        paradas: stops.map((stop) => ({
          id: stop.id,
          ordem: stop.stopOrder,
          latitude: stop.latitude,
          longitude: stop.longitude,
        })),
        criadaEm: journey.createdAt.toISOString(),
        atualizadaEm: journey.updatedAt.toISOString(),
      };
    }

    const vehicle = await this.vehicleRepo.findById(journey.vehicleId);
    if (!vehicle) {
      throw new NotFoundException(
        'Veículo vinculado à jornada não encontrado.',
      );
    }

    const stops = await this.journeyRepo.findStopsByJourneyId(journey.id);
    let kmRodados = 0;
    for (let index = 0; index < stops.length - 1; index++) {
      kmRodados += haversineKm(
        stops[index].latitude,
        stops[index].longitude,
        stops[index + 1].latitude,
        stops[index + 1].longitude,
      );
    }

    const combustivelGasto = kmRodados / vehicle.consumoMedio;
    const litrosRestantes = vehicle.tamanhoTanque - combustivelGasto;
    const nivelCombustivel = Math.max(
      0,
      Math.min(100, (litrosRestantes / vehicle.tamanhoTanque) * 100),
    );

    journey.status = 'completed';
    journey.kmRodados = Number(kmRodados.toFixed(2));
    journey.combustivelGasto = Number(combustivelGasto.toFixed(2));
    journey.nivelCombustivel = Number(nivelCombustivel.toFixed(2));

    const updated = await this.journeyRepo.update(journey);

    const latestTelemetry = await this.telemetryRepo.findLatestByVehicleId(
      updated.vehicleId,
    );
    if (!latestTelemetry) {
      await this.telemetryRepo.create(
        new TelemetryModel({
          vehicleId: updated.vehicleId,
          kmRodados: updated.kmRodados,
          combustivelGasto: updated.combustivelGasto,
          nivelCombustivel: updated.nivelCombustivel,
          velocidadeMedia: 0,
        }),
      );
    } else {
      latestTelemetry.kmRodados = updated.kmRodados;
      latestTelemetry.combustivelGasto = updated.combustivelGasto;
      latestTelemetry.nivelCombustivel = updated.nivelCombustivel;
      latestTelemetry.velocidadeMedia = 0;
      latestTelemetry.recordedAt = new Date();
      await this.telemetryRepo.update(latestTelemetry);
    }

    return {
      id: updated.id,
      userId: updated.userId,
      vehicleId: updated.vehicleId,
      nome: updated.name,
      status: updated.status,
      kmRodados: updated.kmRodados,
      combustivelGasto: updated.combustivelGasto,
      nivelCombustivel: updated.nivelCombustivel,
      iniciadaEm: updated.startedAt.toISOString(),
      paradas: stops.map((stop) => ({
        id: stop.id,
        ordem: stop.stopOrder,
        latitude: stop.latitude,
        longitude: stop.longitude,
      })),
      criadaEm: updated.createdAt.toISOString(),
      atualizadaEm: updated.updatedAt.toISOString(),
    };
  }
}

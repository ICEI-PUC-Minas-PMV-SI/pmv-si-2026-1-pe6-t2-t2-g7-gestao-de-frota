import { CreateJourneyService } from '../../../../../src/modules/journey/services/CreateJourney.service';
import { JourneyRepo } from '../../../../../src/modules/journey/repositories/journey/interface';
import { JourneyModel } from '../../../../../src/modules/journey/models/Journey.model';
import { JourneyStopModel } from '../../../../../src/modules/journey/models/JourneyStop.model';
import { VehicleRepo } from '../../../../../src/modules/vehicle/repositories/vehicle/interface';

describe('CreateJourneyService', () => {
  it('deve criar jornada com paradas ordenadas por ordem', async () => {
    const startedAt = new Date('2026-04-07T10:00:00.000Z');
    const createdAt = new Date('2026-04-07T10:01:00.000Z');
    const updatedAt = new Date('2026-04-07T10:02:00.000Z');

    const repo: Pick<JourneyRepo, 'createWithStops'> = {
      createWithStops: jest.fn((journey, stops) => {
        const savedJourney = new JourneyModel({
          id: 'journey-1',
          userId: journey.userId,
          vehicleId: journey.vehicleId,
          name: journey.name,
          status: journey.status,
          kmRodados: 0,
          combustivelGasto: 0,
          nivelCombustivel: 100,
          startedAt,
          createdAt,
          updatedAt,
        });

        const savedStops = stops.map(
          (stop, index) =>
            new JourneyStopModel({
              id: `stop-${index + 1}`,
              journeyId: 'journey-1',
              stopOrder: stop.stopOrder,
              latitude: stop.latitude,
              longitude: stop.longitude,
              createdAt,
            }),
        );

        return Promise.resolve({ journey: savedJourney, stops: savedStops });
      }),
    };

    const vehicleRepo: Pick<VehicleRepo, 'findById'> = {
      findById: jest.fn(() => Promise.resolve({ id: 'vehicle-1-id' } as never)),
    };
    const service = new CreateJourneyService(
      repo as JourneyRepo,
      vehicleRepo as VehicleRepo,
    );

    const result = await service.exec({
      userId: 10,
      vehicleId: 'vehicle-1-id',
      nome: '  Rota manhã  ',
      paradas: [
        { ordem: 3, latitude: -19.9, longitude: -43.9 },
        { ordem: 1, latitude: -19.8, longitude: -43.8 },
        { ordem: 2, latitude: -19.85, longitude: -43.85 },
      ],
    });

    expect(repo.createWithStops).toHaveBeenCalledTimes(1);
    const [, stopsArg] = (repo.createWithStops as jest.Mock).mock.calls[0] as [
      JourneyModel,
      JourneyStopModel[],
    ];
    expect(stopsArg.map((stop) => stop.stopOrder)).toEqual([1, 2, 3]);

    expect(result).toEqual({
      id: 'journey-1',
      userId: 10,
      vehicleId: 'vehicle-1-id',
      nome: 'Rota manhã',
      status: 'in_progress',
      kmRodados: 0,
      combustivelGasto: 0,
      nivelCombustivel: 100,
      iniciadaEm: startedAt.toISOString(),
      paradas: [
        { id: 'stop-1', ordem: 1, latitude: -19.8, longitude: -43.8 },
        { id: 'stop-2', ordem: 2, latitude: -19.85, longitude: -43.85 },
        { id: 'stop-3', ordem: 3, latitude: -19.9, longitude: -43.9 },
      ],
      criadaEm: createdAt.toISOString(),
      atualizadaEm: updatedAt.toISOString(),
    });
  });
});

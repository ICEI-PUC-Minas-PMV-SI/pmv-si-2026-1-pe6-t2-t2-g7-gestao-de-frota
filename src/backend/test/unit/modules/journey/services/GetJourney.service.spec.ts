import { NotFoundException } from '@nestjs/common';
import { JourneyModel } from '../../../../../src/modules/journey/models/Journey.model';
import { JourneyStopModel } from '../../../../../src/modules/journey/models/JourneyStop.model';
import { GetJourneyService } from '../../../../../src/modules/journey/services/GetJourney.service';
import { JourneyRepo } from '../../../../../src/modules/journey/repositories/journey/interface';

describe('GetJourneyService', () => {
  it('deve retornar jornada com paradas mapeadas', async () => {
    const journey = new JourneyModel({
      id: 'j1',
      userId: 1,
      vehicleId: 'vehicle-1-id',
      name: 'Entrega',
      status: 'in_progress',
      startedAt: new Date('2026-04-10T00:00:00.000Z'),
      createdAt: new Date('2026-04-10T00:00:00.000Z'),
      updatedAt: new Date('2026-04-10T00:00:00.000Z'),
    });
    const stop = new JourneyStopModel({
      id: 's1',
      journeyId: 'j1',
      stopOrder: 1,
      latitude: -10,
      longitude: -20,
    });
    const repo: Pick<JourneyRepo, 'findByIdForUser' | 'findStopsByJourneyId'> =
      {
        findByIdForUser: jest.fn(() => Promise.resolve(journey)),
        findStopsByJourneyId: jest.fn(() => Promise.resolve([stop])),
      };
    const service = new GetJourneyService(repo as JourneyRepo);

    await expect(
      service.exec({ userId: 1, journeyId: 'j1' }),
    ).resolves.toMatchObject({
      id: 'j1',
      nome: 'Entrega',
      paradas: [{ id: 's1', ordem: 1 }],
    });
  });

  it('deve retornar 404 quando a jornada nao existir', async () => {
    const repo: Pick<JourneyRepo, 'findByIdForUser'> = {
      findByIdForUser: jest.fn(() => Promise.resolve(null)),
    };
    const service = new GetJourneyService(repo as JourneyRepo);

    await expect(service.exec({ userId: 1, journeyId: 'j1' })).rejects.toThrow(
      NotFoundException,
    );
  });
});

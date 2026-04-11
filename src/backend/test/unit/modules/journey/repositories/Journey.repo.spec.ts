import { JourneyModel } from 'src/modules/journey/models/Journey.model';
import { JourneyStopModel } from 'src/modules/journey/models/JourneyStop.model';
import { JourneyRepoImpl } from 'src/modules/journey/repositories/journey/Journey.repo';

describe('JourneyRepoImpl', () => {
  it('deve criar jornada com paradas em transacao e executar buscas', async () => {
    const journeyInsertMock = jest.fn(() => Promise.resolve(undefined));
    const stopInsertMock = jest.fn(() => Promise.resolve(undefined));
    const findOneByMock = jest.fn(() => Promise.resolve({ id: 'j1' }));
    const findMock = jest.fn(() => Promise.resolve([{ id: 's1' }]));
    const transactionMock = jest.fn(
      (
        callback: (manager: {
          getRepository: (
            model: typeof JourneyModel | typeof JourneyStopModel,
          ) => {
            insert: jest.Mock<Promise<void>, []>;
          };
        }) => Promise<void>,
      ) =>
        Promise.resolve(
          callback({
            getRepository: (model) =>
              model === JourneyModel
                ? { insert: journeyInsertMock }
                : { insert: stopInsertMock },
          }),
        ),
    );
    const repo = new JourneyRepoImpl({
      transaction: transactionMock,
      getRepository: jest.fn((model) =>
        model === JourneyModel
          ? { findOneBy: findOneByMock }
          : { find: findMock },
      ),
    } as never);
    const journey = new JourneyModel({
      id: 'j1',
      userId: 1,
      name: 'Entrega',
      status: 'in_progress',
    });
    const stop = new JourneyStopModel({
      id: 's1',
      journeyId: 'j1',
      stopOrder: 1,
      latitude: -10,
      longitude: -20,
    });

    await expect(repo.createWithStops(journey, [stop])).resolves.toEqual({
      journey,
      stops: [stop],
    });
    await expect(repo.findByIdForUser('j1', 1)).resolves.toEqual({ id: 'j1' });
    await expect(repo.findStopsByJourneyId('j1')).resolves.toEqual([
      { id: 's1' },
    ]);
  });
});

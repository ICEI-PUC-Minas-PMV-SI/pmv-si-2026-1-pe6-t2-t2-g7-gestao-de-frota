import { JourneyPositionModel } from '../../../../../src/modules/journey/models/JourneyPosition.model';
import { JourneyPositionRepoImpl } from '../../../../../src/modules/journey/repositories/journeyPosition/JourneyPosition.repo';

describe('JourneyPositionRepoImpl', () => {
  it('deve criar posicao e buscar a ultima por jornada', async () => {
    const insertMock = jest.fn(() => Promise.resolve(undefined));
    const findMock = jest.fn(() => Promise.resolve([{ id: 'p1' }]));
    const repo = new JourneyPositionRepoImpl({
      getRepository: jest.fn(() => ({
        insert: insertMock,
        find: findMock,
      })),
    } as never);
    const row = new JourneyPositionModel({
      id: 'p1',
      journeyId: 'j1',
      latitude: -10,
      longitude: -20,
    });

    await expect(repo.create(row)).resolves.toBe(row);
    await expect(repo.findLatestByJourneyId('j1')).resolves.toEqual({
      id: 'p1',
    });
  });
});

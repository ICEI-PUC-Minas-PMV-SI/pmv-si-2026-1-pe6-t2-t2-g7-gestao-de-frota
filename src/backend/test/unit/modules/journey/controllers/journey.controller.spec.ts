import { CreateJourneyController } from '../../../../../src/modules/journey/controllers/journey/CreateJourney.controller';
import { GetJourneyController } from '../../../../../src/modules/journey/controllers/journey/GetJourney.controller';
import { GetLatestJourneyPositionController } from '../../../../../src/modules/journey/controllers/journey/GetLatestJourneyPosition.controller';
import { RecordJourneyPositionController } from '../../../../../src/modules/journey/controllers/journey/RecordJourneyPosition.controller';

describe('Journey controllers', () => {
  const container = { user: { id: 1 } } as never;

  it('deve criar jornada mapeando paradas', async () => {
    const execMock = jest.fn(() =>
      Promise.resolve({ id: 'j1', paradas: [{ ordem: 1 }] }),
    );
    const controller = new CreateJourneyController({ exec: execMock } as never);

    await expect(
      controller.exec(
        {
          nome: 'Entrega',
          paradas: [{ ordem: 1, latitude: -10, longitude: -20 }],
        },
        container,
      ),
    ).resolves.toMatchObject({ id: 'j1' });
    expect(execMock).toHaveBeenCalledWith({
      userId: 1,
      nome: 'Entrega',
      paradas: [{ ordem: 1, latitude: -10, longitude: -20 }],
    });
  });

  it('deve obter jornada', async () => {
    const execMock = jest.fn(() => Promise.resolve({ id: 'j1' }));
    const controller = new GetJourneyController({ exec: execMock } as never);

    await expect(controller.exec('j1', container)).resolves.toEqual({
      id: 'j1',
    });
  });

  it('deve obter ultima posicao', async () => {
    const execMock = jest.fn(() => Promise.resolve({ temPosicao: false }));
    const controller = new GetLatestJourneyPositionController({
      exec: execMock,
    } as never);

    await expect(controller.exec('j1', container)).resolves.toEqual({
      temPosicao: false,
    });
  });

  it('deve registrar posicao', async () => {
    const execMock = jest.fn(() =>
      Promise.resolve({ journeyId: 'j1', latitude: -10, longitude: -20 }),
    );
    const controller = new RecordJourneyPositionController({
      exec: execMock,
    } as never);

    await expect(
      controller.exec('j1', { latitude: -10, longitude: -20 }, container),
    ).resolves.toMatchObject({ journeyId: 'j1' });
  });
});

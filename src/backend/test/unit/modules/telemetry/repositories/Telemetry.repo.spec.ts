import { TelemetryModel } from '../../../../../src/modules/telemetry/models/Telemetry.model';
import { TelemetryRepoImpl } from '../../../../../src/modules/telemetry/repositories/telemetry/Telemetry.repo';

describe('TelemetryRepoImpl', () => {
  it('deve criar/atualizar telemetria e buscar por veículo', async () => {
    const insertMock = jest.fn(() => Promise.resolve(undefined));
    const updateMock = jest.fn(() => Promise.resolve(undefined));
    const findMock = jest
      .fn()
      .mockResolvedValueOnce([{ id: 't1' }])
      .mockResolvedValueOnce([{ id: 't2' }]);
    const repo = new TelemetryRepoImpl({
      getRepository: jest.fn(() => ({
        insert: insertMock,
        update: updateMock,
        find: findMock,
      })),
    } as never);
    const row = new TelemetryModel({
      id: 't1',
      vehicleId: 'v1',
      kmRodados: 10,
      combustivelGasto: 2,
      nivelCombustivel: 50,
      velocidadeMedia: 70,
    });

    await expect(repo.create(row)).resolves.toBe(row);
    await expect(repo.update(row)).resolves.toBe(row);
    await expect(repo.findByVehicleId('v1')).resolves.toEqual([{ id: 't1' }]);
    await expect(repo.findLatestByVehicleId('v1')).resolves.toEqual({
      id: 't2',
    });
  });
});

import { VehicleModel } from '../../../../../src/modules/vehicle/models/Vehicle.model';
import { VehicleRepoImpl } from '../../../../../src/modules/vehicle/repositories/vehicle/Vehicle.repo';

describe('VehicleRepoImpl', () => {
  it('deve executar create, update, delete e buscas', async () => {
    const insertMock = jest.fn(() => Promise.resolve(undefined));
    const updateMock = jest.fn(() => Promise.resolve(undefined));
    const deleteMock = jest.fn(() => Promise.resolve(undefined));
    const findOneByMock = jest.fn(() => Promise.resolve({ id: 'v1' }));
    const findMock = jest.fn(() => Promise.resolve([{ id: 'v1' }]));
    const repo = new VehicleRepoImpl({
      getRepository: jest.fn(() => ({
        insert: insertMock,
        update: updateMock,
        delete: deleteMock,
        findOneBy: findOneByMock,
        find: findMock,
      })),
    } as never);
    const vehicle = new VehicleModel({
      id: 'v1',
      marca: 'Fiat',
      modelo: 'Uno',
      ano: 2020,
      placa: 'ABC1D23',
    });

    await expect(repo.create(vehicle)).resolves.toBe(vehicle);
    await expect(repo.update(vehicle)).resolves.toBe(vehicle);
    await expect(repo.delete('v1')).resolves.toBeUndefined();
    await expect(repo.findById('v1')).resolves.toEqual({ id: 'v1' });
    await expect(repo.findAll()).resolves.toEqual([{ id: 'v1' }]);

    expect(insertMock).toHaveBeenCalled();
    expect(updateMock).toHaveBeenCalled();
    expect(deleteMock).toHaveBeenCalledWith({ id: 'v1' });
  });
});

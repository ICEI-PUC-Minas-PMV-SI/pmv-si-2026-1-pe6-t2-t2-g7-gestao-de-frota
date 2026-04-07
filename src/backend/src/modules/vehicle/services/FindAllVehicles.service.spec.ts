import { FindAllVehiclesService } from './FindAllVehicles.service';
import { VehicleRepo } from '../repositories/vehicle/interface';
import { VehicleModel } from '../models/Vehicle.model';

describe('FindAllVehiclesService', () => {
  it('deve retornar lista de veículos', async () => {
    const repo: Pick<VehicleRepo, 'findAll'> = {
      findAll: jest.fn(() =>
        Promise.resolve([
          new VehicleModel({
            id: 'v1',
            marca: 'Fiat',
            modelo: 'Uno',
            ano: 2020,
            placa: 'ABC1D23',
          }),
        ]),
      ),
    };
    const service = new FindAllVehiclesService(repo as VehicleRepo);

    const result = await service.exec();

    expect(repo.findAll).toHaveBeenCalledTimes(1);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('v1');
  });
});

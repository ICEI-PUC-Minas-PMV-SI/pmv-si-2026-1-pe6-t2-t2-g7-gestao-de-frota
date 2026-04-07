import { FindVehicleService } from '../../../../../src/modules/vehicle/services/FindVehicle.service';
import { VehicleRepo } from '../../../../../src/modules/vehicle/repositories/vehicle/interface';
import { VehicleModel } from '../../../../../src/modules/vehicle/models/Vehicle.model';

describe('FindVehicleService', () => {
  it('deve retornar veículo por id', async () => {
    const repo: Pick<VehicleRepo, 'findById'> = {
      findById: jest.fn(() =>
        Promise.resolve(
          new VehicleModel({
            id: 'v1',
            marca: 'Fiat',
            modelo: 'Uno',
            ano: 2020,
            placa: 'ABC1D23',
          }),
        ),
      ),
    };
    const service = new FindVehicleService(repo as VehicleRepo);

    const result = await service.exec('v1');

    expect(repo.findById).toHaveBeenCalledWith('v1');
    expect(result?.id).toBe('v1');
  });
});

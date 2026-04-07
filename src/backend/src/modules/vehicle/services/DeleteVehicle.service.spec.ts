import { DeleteVehicleService } from './DeleteVehicle.service';
import { VehicleRepo } from '../repositories/vehicle/interface';

describe('DeleteVehicleService', () => {
  it('deve chamar repositório para remover por id', async () => {
    const repo: Pick<VehicleRepo, 'delete'> = {
      delete: jest.fn(() => Promise.resolve()),
    };
    const service = new DeleteVehicleService(repo as VehicleRepo);

    await service.exec('v1');

    expect(repo.delete).toHaveBeenCalledWith('v1');
    expect(repo.delete).toHaveBeenCalledTimes(1);
  });
});

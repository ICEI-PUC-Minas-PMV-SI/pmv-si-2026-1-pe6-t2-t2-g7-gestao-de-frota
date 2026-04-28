import { BadRequestException } from '@nestjs/common';
import { CreateVehicleService } from '../../../../../src/modules/vehicle/services/CreateVehicle.service';
import { VehicleRepo } from '../../../../../src/modules/vehicle/repositories/vehicle/interface';
import { VehicleModel } from '../../../../../src/modules/vehicle/models/Vehicle.model';

describe('CreateVehicleService', () => {
  it('deve criar veículo com dados válidos', async () => {
    const createdAt = new Date('2026-04-07T10:00:00.000Z');
    const updatedAt = new Date('2026-04-07T10:00:00.000Z');
    const repo: Pick<VehicleRepo, 'create'> = {
      create: jest.fn((vehicle) =>
        Promise.resolve(
          new VehicleModel({
            ...vehicle.toJSON(),
            id: 'vehicle-1',
            createdAt,
            updatedAt,
          }),
        ),
      ),
    };

    const service = new CreateVehicleService(repo as VehicleRepo);
    const result = await service.exec({
      marca: 'Fiat',
      modelo: 'Uno',
      ano: 2020,
      placa: 'ABC1D23',
      fotoUrl: 'https://example.com/uno.jpg',
      tamanhoTanque: 50,
      consumoMedio: 10,
    });

    expect(repo.create).toHaveBeenCalledTimes(1);
    expect(result.id).toBe('vehicle-1');
    expect(result.placa).toBe('ABC1D23');
  });

  it('deve falhar com placa inválida', async () => {
    const repo: Pick<VehicleRepo, 'create'> = {
      create: jest.fn(),
    };
    const service = new CreateVehicleService(repo as VehicleRepo);

    await expect(
      service.exec({
        marca: 'Fiat',
        modelo: 'Uno',
        ano: 2020,
        placa: 'PLACAINVALIDA',
        fotoUrl: 'https://example.com/uno.jpg',
        tamanhoTanque: 50,
        consumoMedio: 10,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(repo.create).not.toHaveBeenCalled();
  });
});

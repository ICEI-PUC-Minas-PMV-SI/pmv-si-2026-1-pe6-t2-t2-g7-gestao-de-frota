import { BadRequestException } from '@nestjs/common';
import { CreateVehicleService } from './CreateVehicle.service';
import { VehicleRepo } from '../repositories/vehicle/interface';
import { VehicleModel } from '../models/Vehicle.model';

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
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(repo.create).not.toHaveBeenCalled();
  });
});

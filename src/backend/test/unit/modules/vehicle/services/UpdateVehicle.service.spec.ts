import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UpdateVehicleService } from '../../../../../src/modules/vehicle/services/UpdateVehicle.service';
import { VehicleRepo } from '../../../../../src/modules/vehicle/repositories/vehicle/interface';
import { VehicleModel } from '../../../../../src/modules/vehicle/models/Vehicle.model';

describe('UpdateVehicleService', () => {
  it('deve lançar NotFoundException quando veículo não existe', async () => {
    const repo: Pick<VehicleRepo, 'findById' | 'update'> = {
      findById: jest.fn(() => Promise.resolve(null)),
      update: jest.fn(),
    };
    const service = new UpdateVehicleService(repo as VehicleRepo);

    await expect(
      service.exec({
        id: 'v1',
        modelo: 'Uno Way',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);

    expect(repo.update).not.toHaveBeenCalled();
  });

  it('deve lançar BadRequestException para placa inválida', async () => {
    const repo: Pick<VehicleRepo, 'findById' | 'update'> = {
      findById: jest.fn(),
      update: jest.fn(),
    };
    const service = new UpdateVehicleService(repo as VehicleRepo);

    await expect(
      service.exec({
        id: 'v1',
        placa: 'INVALIDA',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('deve atualizar veículo existente', async () => {
    const repo: Pick<VehicleRepo, 'findById' | 'update'> = {
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
      update: jest.fn((vehicle) =>
        Promise.resolve(
          new VehicleModel({
            ...vehicle.toJSON(),
            updatedAt: new Date('2026-04-07T10:10:00.000Z'),
          }),
        ),
      ),
    };
    const service = new UpdateVehicleService(repo as VehicleRepo);

    const result = await service.exec({
      id: 'v1',
      modelo: 'Uno Way',
      ano: 2021,
    });

    expect(repo.findById).toHaveBeenCalledWith('v1');
    expect(repo.update).toHaveBeenCalledTimes(1);
    expect(result.modelo).toBe('Uno Way');
    expect(result.ano).toBe(2021);
  });
});

import { CreateVehicleController } from '../../../../../src/modules/vehicle/controllers/vehicle/CreateVehicle.controller';
import { DeleteVehicleController } from '../../../../../src/modules/vehicle/controllers/vehicle/DeleteVehicle.controller';
import { FindAllVehiclesController } from '../../../../../src/modules/vehicle/controllers/vehicle/FindAllVehicles.controller';
import { FindVehicleController } from '../../../../../src/modules/vehicle/controllers/vehicle/FindVehicle.controller';
import { UpdateVehicleController } from '../../../../../src/modules/vehicle/controllers/vehicle/UpdateVehicle.controller';
import { VehicleModel } from '../../../../../src/modules/vehicle/models/Vehicle.model';

describe('Vehicle controllers', () => {
  it('deve criar veiculo mapeando o body', async () => {
    const vehicle = new VehicleModel({
      id: 'v1',
      marca: 'Fiat',
      modelo: 'Uno',
      ano: 2020,
      placa: 'ABC1D23',
      fotoUrl: 'https://example.com/uno.jpg',
      tamanhoTanque: 50,
      consumoMedio: 10,
    });
    const execMock = jest.fn(() => Promise.resolve(vehicle));
    const controller = new CreateVehicleController({ exec: execMock } as never);

    await expect(
      controller.exec({
        marca: 'Fiat',
        modelo: 'Uno',
        ano: 2020,
        placa: 'ABC1D23',
        fotoUrl: 'https://example.com/uno.jpg',
        tamanhoTanque: 50,
        consumoMedio: 10,
      }),
    ).resolves.toMatchObject({ id: 'v1', placa: 'ABC1D23' });
  });

  it('deve listar e mapear veiculos', async () => {
    const execMock = jest.fn(() =>
      Promise.resolve([
        new VehicleModel({
          id: 'v1',
          marca: 'Fiat',
          modelo: 'Uno',
          ano: 2020,
          placa: 'ABC1D23',
          fotoUrl: 'https://example.com/uno.jpg',
          tamanhoTanque: 50,
          consumoMedio: 10,
        }),
      ]),
    );
    const controller = new FindAllVehiclesController({
      exec: execMock,
    } as never);

    await expect(controller.exec()).resolves.toMatchObject([
      { id: 'v1', marca: 'Fiat' },
    ]);
  });

  it('deve buscar um veiculo por id', async () => {
    const execMock = jest.fn(() =>
      Promise.resolve(
        new VehicleModel({
          id: 'v1',
          marca: 'Fiat',
          modelo: 'Uno',
          ano: 2020,
          placa: 'ABC1D23',
          fotoUrl: 'https://example.com/uno.jpg',
          tamanhoTanque: 50,
          consumoMedio: 10,
        }),
      ),
    );
    const controller = new FindVehicleController({ exec: execMock } as never);

    await expect(controller.exec('v1')).resolves.toMatchObject({ id: 'v1' });
    expect(execMock).toHaveBeenCalledWith('v1');
  });

  it('deve atualizar veiculo mapeando apenas campos enviados', async () => {
    const execMock = jest.fn(() =>
      Promise.resolve(
        new VehicleModel({
          id: 'v1',
          marca: 'Fiat',
          modelo: 'Uno Way',
          ano: 2022,
          placa: 'DEF2G45',
          fotoUrl: 'https://example.com/uno-way.jpg',
          tamanhoTanque: 52,
          consumoMedio: 11,
        }),
      ),
    );
    const controller = new UpdateVehicleController({ exec: execMock } as never);

    await expect(
      controller.exec({ modelo: 'Uno Way', ano: 2022, placa: 'DEF2G45' }, 'v1'),
    ).resolves.toMatchObject({ id: 'v1', modelo: 'Uno Way' });
    expect(execMock).toHaveBeenCalledWith({
      id: 'v1',
      modelo: 'Uno Way',
      ano: 2022,
      placa: 'DEF2G45',
    });
  });

  it('deve remover veiculo pelo service', async () => {
    const execMock = jest.fn(() => Promise.resolve(undefined));
    const controller = new DeleteVehicleController({ exec: execMock } as never);

    await expect(controller.exec('v1')).resolves.toBeUndefined();
    expect(execMock).toHaveBeenCalledWith('v1');
  });
});

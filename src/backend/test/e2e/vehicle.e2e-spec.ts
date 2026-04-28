import request from 'supertest';
import { getE2eHttpServer, getE2eState } from './setup';

const auth = (token: string) => `Bearer ${token}`;

describe('VehicleModule (e2e)', () => {
  describe('autenticação', () => {
    it('deve exigir autenticação para listar veículos', async () => {
      await request(getE2eHttpServer()).get('/vehicle').expect(403);

      expect(getE2eState().verifyIdToken).not.toHaveBeenCalled();
    });
  });

  describe('veículos', () => {
    it('deve listar todos os veículos para usuário autenticado', async () => {
      const response = await request(getE2eHttpServer())
        .get('/vehicle')
        .set('Authorization', auth('valid-user-token'))
        .expect(200);

      expect(response.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: 'vehicle-1-id',
            marca: 'Fiat',
            modelo: 'Uno',
            ano: 2020,
            placa: 'ABC1D23',
          }),
          expect.objectContaining({
            id: 'vehicle-2-id',
            marca: 'Volkswagen',
            modelo: 'Gol',
            ano: 2021,
            placa: 'XYZ9K87',
          }),
        ]),
      );
    });

    it('deve buscar um veículo por id', async () => {
      const response = await request(getE2eHttpServer())
        .get('/vehicle/vehicle-1-id')
        .set('Authorization', auth('valid-user-token'))
        .expect(200);

      expect(response.body).toMatchObject({
        id: 'vehicle-1-id',
        marca: 'Fiat',
        modelo: 'Uno',
        ano: 2020,
        placa: 'ABC1D23',
      });
    });

    it('deve criar um veículo com payload válido', async () => {
      const response = await request(getE2eHttpServer())
        .post('/vehicle')
        .set('Authorization', auth('valid-user-token'))
        .send({
          marca: 'Toyota',
          modelo: 'Corolla',
          ano: 2024,
          placa: 'BRA2E19',
          fotoUrl: 'https://example.com/corolla.jpg',
          tamanhoTanque: 55,
          consumoMedio: 12,
        })
        .expect(201);

      expect(response.body).toEqual({
        id: expect.any(String),
        marca: 'Toyota',
        modelo: 'Corolla',
        ano: 2024,
        placa: 'BRA2E19',
        fotoUrl: 'https://example.com/corolla.jpg',
        tamanhoTanque: 55,
        consumoMedio: 12,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
    });

    it('deve rejeitar criação com placa inválida', async () => {
      await request(getE2eHttpServer())
        .post('/vehicle')
        .set('Authorization', auth('valid-user-token'))
        .send({
          marca: 'Toyota',
          modelo: 'Corolla',
          ano: 2024,
          placa: 'INVALIDA',
          fotoUrl: 'https://example.com/corolla.jpg',
          tamanhoTanque: 55,
          consumoMedio: 12,
        })
        .expect(400);
    });

    it('deve atualizar um veículo existente', async () => {
      const response = await request(getE2eHttpServer())
        .patch('/vehicle/vehicle-1-id')
        .set('Authorization', auth('valid-user-token'))
        .send({
          modelo: 'Uno Way',
          ano: 2022,
          placa: 'DEF2G45',
        })
        .expect(200);

      expect(response.body).toMatchObject({
        id: 'vehicle-1-id',
        marca: 'Fiat',
        modelo: 'Uno Way',
        ano: 2022,
        placa: 'DEF2G45',
      });
    });

    it('deve retornar 404 ao atualizar veículo inexistente', async () => {
      await request(getE2eHttpServer())
        .patch('/vehicle/vehicle-inexistente')
        .set('Authorization', auth('valid-user-token'))
        .send({ modelo: 'Nao Existe' })
        .expect(404);
    });

    it('deve remover um veículo existente', async () => {
      await request(getE2eHttpServer())
        .delete('/vehicle/vehicle-1-id')
        .set('Authorization', auth('valid-user-token'))
        .expect(204);

      expect(getE2eState().deleteVehicleRepoMock).toHaveBeenCalledWith(
        'vehicle-1-id',
      );
    });
  });
});

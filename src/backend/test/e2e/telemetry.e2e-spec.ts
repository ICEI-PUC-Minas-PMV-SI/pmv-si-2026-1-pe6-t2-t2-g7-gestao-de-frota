import request from 'supertest';
import { getE2eHttpServer } from './setup';

const auth = (token: string) => `Bearer ${token}`;
const validVehicleId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const vehicleWithoutTelemetryId = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';

describe('TelemetryModule (e2e)', () => {
  describe('autenticação', () => {
    it('deve exigir autenticação para listar telemetria do veículo', async () => {
      await request(getE2eHttpServer())
        .get(`/vehicle/${validVehicleId}/telemetry`)
        .expect(403);
    });
  });

  describe('telemetria', () => {
    it('deve registrar telemetria com dados válidos', async () => {
      const response = await request(getE2eHttpServer())
        .post(`/vehicle/${validVehicleId}/telemetry`)
        .set('Authorization', auth('valid-user-token'))
        .send({
          kmRodados: 120.5,
          combustivelGasto: 8.3,
          nivelCombustivel: 45.0,
          velocidadeMedia: 60,
        })
        .expect(201);

      expect(response.body).toMatchObject({
        id: expect.any(String),
        vehicleId: validVehicleId,
        kmRodados: 120.5,
        combustivelGasto: 8.3,
        nivelCombustivel: 45.0,
        velocidadeMedia: 60,
        registradaEm: expect.any(String),
      });
    });

    it('deve retornar 404 ao registrar telemetria para veículo inexistente', async () => {
      await request(getE2eHttpServer())
        .post(`/vehicle/${vehicleWithoutTelemetryId}/telemetry`)
        .set('Authorization', auth('valid-user-token'))
        .send({
          kmRodados: 50,
          combustivelGasto: 4,
          nivelCombustivel: 60,
          velocidadeMedia: 40,
        })
        .expect(404);
    });

    it('deve retornar 400 ao registrar telemetria com nível de combustível inválido', async () => {
      await request(getE2eHttpServer())
        .post(`/vehicle/${validVehicleId}/telemetry`)
        .set('Authorization', auth('valid-user-token'))
        .send({
          kmRodados: 10,
          combustivelGasto: 1,
          nivelCombustivel: -1,
          velocidadeMedia: 30,
        })
        .expect(400);
    });

    it('deve indicar ausência de telemetria quando não há registros no veículo', async () => {
      const response = await request(getE2eHttpServer())
        .get(`/vehicle/${validVehicleId}/telemetry/latest`)
        .set('Authorization', auth('valid-user-token'))
        .expect(200);

      expect(response.body).toEqual({
        temTelemetria: false,
      });
    });

    it('deve listar telemetrias do veículo', async () => {
      const response = await request(getE2eHttpServer())
        .get(`/vehicle/${validVehicleId}/telemetry`)
        .set('Authorization', auth('valid-user-token'))
        .expect(200);

      expect(response.body).toEqual([]);
    });
  });
});

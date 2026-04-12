import request from 'supertest';
import { getE2eHttpServer } from './setup';

const auth = (token: string) => `Bearer ${token}`;
const inProgressJourneyId = '33333333-3333-4333-8333-333333333333';
const completedJourneyId = '44444444-4444-4444-8444-444444444444';
const journeyWithoutTelemetryId = '55555555-5555-4555-8555-555555555555';
const anotherUserJourneyId = '66666666-6666-4666-8666-666666666666';
const validVehicleId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';

describe('TelemetryModule (e2e)', () => {
  describe('autenticação', () => {
    it('deve exigir autenticação para listar telemetria da jornada', async () => {
      await request(getE2eHttpServer())
        .get(`/journey/${inProgressJourneyId}/telemetry`)
        .expect(403);
    });
  });

  describe('telemetria', () => {
    it('deve registrar telemetria com dados válidos', async () => {
      const response = await request(getE2eHttpServer())
        .post(`/journey/${inProgressJourneyId}/telemetry`)
        .set('Authorization', auth('valid-user-token'))
        .send({
          vehicleId: validVehicleId,
          kmRodados: 120.5,
          combustivelGasto: 8.3,
          nivelCombustivel: 45.0,
          latitude: -19.8157,
          longitude: -43.9542,
          velocidadeMedia: 60,
        })
        .expect(201);

      expect(response.body).toMatchObject({
        id: expect.any(String),
        journeyId: inProgressJourneyId,
        vehicleId: validVehicleId,
        kmRodados: 120.5,
        combustivelGasto: 8.3,
        nivelCombustivel: 45.0,
        latitude: -19.8157,
        longitude: -43.9542,
        velocidadeMedia: 60,
        registradaEm: expect.any(String),
      });
    });

    it('deve retornar 404 ao registrar telemetria em jornada de outro usuário', async () => {
      await request(getE2eHttpServer())
        .post(`/journey/${anotherUserJourneyId}/telemetry`)
        .set('Authorization', auth('valid-user-token'))
        .send({
          vehicleId: validVehicleId,
          kmRodados: 50,
          combustivelGasto: 4,
          nivelCombustivel: 60,
          latitude: -23.5505,
          longitude: -46.6333,
          velocidadeMedia: 40,
        })
        .expect(404);
    });

    it('deve retornar 403 ao registrar telemetria em jornada finalizada', async () => {
      await request(getE2eHttpServer())
        .post(`/journey/${completedJourneyId}/telemetry`)
        .set('Authorization', auth('valid-user-token'))
        .send({
          vehicleId: validVehicleId,
          kmRodados: 30,
          combustivelGasto: 2.5,
          nivelCombustivel: 75,
          latitude: -23.5338,
          longitude: -46.6253,
          velocidadeMedia: 35,
        })
        .expect(403);
    });

    it('deve retornar 400 ao registrar telemetria com latitude fora do range', async () => {
      await request(getE2eHttpServer())
        .post(`/journey/${inProgressJourneyId}/telemetry`)
        .set('Authorization', auth('valid-user-token'))
        .send({
          vehicleId: validVehicleId,
          kmRodados: 10,
          combustivelGasto: 1,
          nivelCombustivel: 50,
          latitude: 200,
          longitude: -46.6333,
          velocidadeMedia: 30,
        })
        .expect(400);
    });

    it('deve retornar última telemetria quando há registros na jornada', async () => {
      const response = await request(getE2eHttpServer())
        .get(`/journey/${inProgressJourneyId}/telemetry/latest`)
        .set('Authorization', auth('valid-user-token'))
        .expect(200);

      expect(response.body).toMatchObject({
        temTelemetria: true,
        id: expect.any(String),
        journeyId: inProgressJourneyId,
        vehicleId: expect.any(String),
        kmRodados: expect.any(Number),
        combustivelGasto: expect.any(Number),
        nivelCombustivel: expect.any(Number),
        latitude: expect.any(Number),
        longitude: expect.any(Number),
        velocidadeMedia: expect.any(Number),
        registradaEm: expect.any(String),
      });
    });

    it('deve indicar ausência de telemetria quando não há registros na jornada', async () => {
      const response = await request(getE2eHttpServer())
        .get(`/journey/${journeyWithoutTelemetryId}/telemetry/latest`)
        .set('Authorization', auth('valid-user-token'))
        .expect(200);

      expect(response.body).toEqual({
        temTelemetria: false,
      });
    });
  });
});

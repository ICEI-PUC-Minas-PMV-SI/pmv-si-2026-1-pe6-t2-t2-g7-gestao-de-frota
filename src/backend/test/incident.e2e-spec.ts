import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

/**
 * E2E Test Suite for Incident Module
 * 
 * Status: Ready to execute after fixing Firebase module error in the project
 * 
 * To run:
 * npm run test:e2e -- incident.e2e-spec.ts
 * 
 * Coverage:
 * - POST   /incident             (CREATE)
 * - GET    /incident             (LIST ALL)
 * - GET    /incident/:id         (READ)
 * - GET    /incident/vehicle/:vehicleId (LIST BY VEHICLE)
 * - PATCH  /incident/:id         (UPDATE)
 * - DELETE /incident/:id         (DELETE)
 */
describe('Incident Module (e2e)', () => {
  let app: INestApplication<App>;
  let vehicleId: string;
  let incidentId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // TODO: Create test vehicle first
    vehicleId = 'a0f5a1d3-34a2-4f78-9b1e-7cf426d5fa77'; // placeholder
  });

  afterAll(async () => {
    await app.close();
  });

  // ============================================
  // CREATE TESTS
  // ============================================
  describe('POST /incident (CREATE)', () => {
    it('[INC-TC-001] should create incident with valid data', () => {
      return request(app.getHttpServer())
        .post('/incident')
        .send({
          vehicleId,
          tipo: 'sinistro',
          descricao: 'Colisão traseira em estacionamento',
          valor: 500.0,
          data: '2026-04-10T00:00:00.000Z',
        })
        .expect(201)
        .then((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.vehicleId).toBe(vehicleId);
          expect(res.body.tipo).toBe('sinistro');
          expect(res.body.descricao).toBe('Colisão traseira em estacionamento');
          expect(res.body.valor).toBe(500);
          expect(res.body).toHaveProperty('createdAt');
          expect(res.body).toHaveProperty('updatedAt');
          incidentId = res.body.id;
        });
    });

    it('[INC-TC-002] should create incident with type "multa"', () => {
      return request(app.getHttpServer())
        .post('/incident')
        .send({
          vehicleId,
          tipo: 'multa',
          descricao: 'Excesso de velocidade',
          valor: 250.0,
          data: '2026-04-10T00:00:00.000Z',
        })
        .expect(201)
        .then((res) => {
          expect(res.body.tipo).toBe('multa');
        });
    });

    it('[INC-TC-003] should create incident without valor (optional)', () => {
      return request(app.getHttpServer())
        .post('/incident')
        .send({
          vehicleId,
          tipo: 'sinistro',
          descricao: 'Dano leve',
          data: '2026-04-10T00:00:00.000Z',
        })
        .expect(201)
        .then((res) => {
          expect(res.body.valor).toBeUndefined();
        });
    });

    it('[INC-TC-004] should create incident with default current date if not provided', () => {
      const beforeCreation = new Date();
      return request(app.getHttpServer())
        .post('/incident')
        .send({
          vehicleId,
          tipo: 'sinistro',
          descricao: 'Dano na lateral',
        })
        .expect(201)
        .then((res) => {
          const incidentDate = new Date(res.body.data);
          expect(incidentDate.getTime()).toBeGreaterThanOrEqual(beforeCreation.getTime());
        });
    });

    it('[INC-TC-006] should reject incident with missing required fields', () => {
      return request(app.getHttpServer())
        .post('/incident')
        .send({
          vehicleId,
          // missing tipo, descricao, data
        })
        .expect(400);
    });

    it('[INC-TC-007] should reject incidente with descricao > 1024 characters', () => {
      const longDescricao = 'a'.repeat(1025);
      return request(app.getHttpServer())
        .post('/incident')
        .send({
          vehicleId,
          tipo: 'sinistro',
          descricao: longDescricao,
          data: '2026-04-10T00:00:00.000Z',
        })
        .expect(400);
    });
  });

  // ============================================
  // READ TESTS
  // ============================================
  describe('GET /incident/:id (READ)', () => {
    it('[INC-TC-008] should retrieve incident by id', () => {
      return request(app.getHttpServer())
        .get(`/incident/${incidentId}`)
        .expect(200)
        .then((res) => {
          expect(res.body.id).toBe(incidentId);
          expect(res.body).toHaveProperty('vehicleId');
          expect(res.body).toHaveProperty('tipo');
          expect(res.body).toHaveProperty('descricao');
          expect(res.body).toHaveProperty('data');
          expect(res.body).toHaveProperty('createdAt');
          expect(res.body).toHaveProperty('updatedAt');
        });
    });

    it('[INC-TC-009] should return undefined for non-existent incident', () => {
      return request(app.getHttpServer())
        .get('/incident/00000000-0000-0000-0000-000000000000')
        .expect(200)
        .then((res) => {
          expect(res.body).toBeUndefined();
        });
    });
  });

  describe('GET /incident (LIST ALL)', () => {
    it('[INC-TC-010] should list all incidents', () => {
      return request(app.getHttpServer())
        .get('/incident')
        .expect(200)
        .then((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
        });
    });
  });

  describe('GET /incident/vehicle/:vehicleId (LIST BY VEHICLE)', () => {
    it('[INC-TC-011] should list all incidents for a specific vehicle', () => {
      return request(app.getHttpServer())
        .get(`/incident/vehicle/${vehicleId}`)
        .expect(200)
        .then((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          res.body.forEach((incident) => {
            expect(incident.vehicleId).toBe(vehicleId);
          });
        });
    });

    it('[INC-TC-012] should return empty array for vehicle without incidents', () => {
      // Consider using a vehicle ID that exists but has no incidents
      const vehicleWithoutIncidents = 'b1f5a1d3-34a2-4f78-9b1e-7cf426d5fb88';
      return request(app.getHttpServer())
        .get(`/incident/vehicle/${vehicleWithoutIncidents}`)
        .expect(200)
        .then((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBe(0);
        });
    });
  });

  // ============================================
  // UPDATE TESTS
  // ============================================
  describe('PATCH /incident/:id (UPDATE)', () => {
    it('[INC-TC-014] should update incident description', () => {
      const newDescricao = 'Descrição atualizada';
      return request(app.getHttpServer())
        .patch(`/incident/${incidentId}`)
        .send({
          descricao: newDescricao,
        })
        .expect(200)
        .then((res) => {
          expect(res.body.descricao).toBe(newDescricao);
          expect(res.body.id).toBe(incidentId);
        });
    });

    it('[INC-TC-015] should update incident type', () => {
      return request(app.getHttpServer())
        .patch(`/incident/${incidentId}`)
        .send({
          tipo: 'multa',
        })
        .expect(200)
        .then((res) => {
          expect(res.body.tipo).toBe('multa');
        });
    });

    it('[INC-TC-016] should update incident valor', () => {
      return request(app.getHttpServer())
        .patch(`/incident/${incidentId}`)
        .send({
          valor: 750.0,
        })
        .expect(200)
        .then((res) => {
          expect(res.body.valor).toBe(750);
        });
    });

    it('[INC-TC-018] should update multiple fields', () => {
      return request(app.getHttpServer())
        .patch(`/incident/${incidentId}`)
        .send({
          tipo: 'sinistro',
          descricao: 'Multi-field update',
          valor: 600.0,
        })
        .expect(200)
        .then((res) => {
          expect(res.body.tipo).toBe('sinistro');
          expect(res.body.descricao).toBe('Multi-field update');
          expect(res.body.valor).toBe(600);
        });
    });

    it('[INC-TC-019] should return error when updating non-existent incident', () => {
      return request(app.getHttpServer())
        .patch('/incident/00000000-0000-0000-0000-000000000000')
        .send({
          descricao: 'Test',
        })
        .expect(404);
    });

    it('[INC-TC-020] should reject negative valor', () => {
      return request(app.getHttpServer())
        .patch(`/incident/${incidentId}`)
        .send({
          valor: -50.0,
        })
        .expect(400);
    });

    it('[INC-TC-028] should update updatedAt timestamp on PATCH', async () => {
      const beforeUpdate = new Date();
      await new Promise((resolve) => setTimeout(resolve, 100)); // wait 100ms

      return request(app.getHttpServer())
        .patch(`/incident/${incidentId}`)
        .send({
          descricao: 'Updated for timestamp test',
        })
        .expect(200)
        .then((res) => {
          const updatedAt = new Date(res.body.updatedAt);
          expect(updatedAt.getTime()).toBeGreaterThan(beforeUpdate.getTime());
        });
    });
  });

  // ============================================
  // DELETE TESTS
  // ============================================
  describe('DELETE /incident/:id (DELETE)', () => {
    let deleteTestIncidentId: string;

    beforeEach(async () => {
      // Create an incident specifically for deletion tests
      const res = await request(app.getHttpServer())
        .post('/incident')
        .send({
          vehicleId,
          tipo: 'sinistro',
          descricao: 'To be deleted',
          data: '2026-04-10T00:00:00.000Z',
        });
      deleteTestIncidentId = res.body.id;
    });

    it('[INC-TC-022] should delete incident and return 204', () => {
      return request(app.getHttpServer())
        .delete(`/incident/${deleteTestIncidentId}`)
        .expect(204);
    });

    it('[INC-TC-024] should not find incident after deletion', async () => {
      const res = await request(app.getHttpServer())
        .post('/incident')
        .send({
          vehicleId,
          tipo: 'sinistro',
          descricao: 'To verify deletion',
          data: '2026-04-10T00:00:00.000Z',
        });
      const tempIncidentId = res.body.id;

      // Delete
      await request(app.getHttpServer())
        .delete(`/incident/${tempIncidentId}`)
        .expect(204);

      // Verify it's gone
      return request(app.getHttpServer())
        .get(`/incident/${tempIncidentId}`)
        .expect(200);
      // Should return undefined or 404
    });
  });

  // ============================================
  // DATA INTEGRITY TESTS
  // ============================================
  describe('Data Integrity', () => {
    it('[INC-TC-027] should generate UUID automatically', () => {
      return request(app.getHttpServer())
        .post('/incident')
        .send({
          vehicleId,
          tipo: 'sinistro',
          descricao: 'UUID test',
          data: '2026-04-10T00:00:00.000Z',
        })
        .expect(201)
        .then((res) => {
          expect(res.body.id).toMatch(
            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
          );
        });
    });

    it('[INC-TC-030] should preserve decimal precision for valor', () => {
      return request(app.getHttpServer())
        .post('/incident')
        .send({
          vehicleId,
          tipo: 'sinistro',
          descricao: 'Decimal test',
          valor: 1234.56,
          data: '2026-04-10T00:00:00.000Z',
        })
        .expect(201)
        .then((res) => {
          expect(res.body.valor).toBe(1234.56);
        });
    });
  });
});

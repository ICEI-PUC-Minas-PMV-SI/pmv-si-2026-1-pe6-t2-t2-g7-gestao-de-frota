import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { App } from 'supertest/types';
import { AppModule } from '../../src/app.module';
import { UserModel } from '../../src/modules/commons/auth/models/User.model';
import { UserRepo } from '../../src/modules/commons/auth/repositories/user/interface';
import { FirebaseService } from '../../src/modules/commons/firebase/firebase.service';
import { typeORMConsts } from '../../src/modules/commons/typeorm/consts';
import {
  IncidentModel,
  IncidentType,
} from '../../src/modules/incident/models/Incident.model';
import { IncidentRepo } from '../../src/modules/incident/repositories/incident/interface';
import { VehicleModel } from '../../src/modules/vehicle/models/Vehicle.model';
import { VehicleRepo } from '../../src/modules/vehicle/repositories/vehicle/interface';

type TokenPayload = {
  uid: string;
  name?: string;
  email: string;
  firebase: {
    sign_in_provider: string;
  };
};

type E2eGlobals = typeof globalThis & {
  __E2E_APP__?: INestApplication<App>;
  __E2E_STATE__?: E2eTestState;
};

const now = new Date('2026-04-08T00:00:00.000Z');
const incidentVehicleOneId = '11111111-1111-4111-8111-111111111111';
const incidentVehicleTwoId = '22222222-2222-4222-8222-222222222222';

class E2eTestState {
  private users = new Map<number, UserModel>();
  private nextId = 10;
  private vehicles = new Map<string, VehicleModel>();
  private incidents = new Map<string, IncidentModel>();
  private analyticsDashboardRows = [
    {
      total_users: '3',
      total_vehicles: '2',
      total_journeys: '5',
      journeys_in_progress: '2',
      journeys_finished: '3',
    },
  ];
  private analyticsUsersRows = [
    {
      user_id: '1',
      name: 'Usuario Teste',
      email: 'user@test.com',
      role: 'user',
      total_journeys: '2',
      journeys_in_progress: '1',
      journeys_finished: '1',
    },
    {
      user_id: '2',
      name: 'Admin Teste',
      email: 'admin@test.com',
      role: 'admin',
      total_journeys: '3',
      journeys_in_progress: '1',
      journeys_finished: '2',
    },
  ];
  private analyticsJourneysRows = [
    {
      journey_id: 'journey-1',
      journey_name: 'Rota Centro',
      status: 'in_progress',
      started_at: '2026-04-01T10:00:00.000Z',
      user_id: '1',
      user_name: 'Usuario Teste',
      user_email: 'user@test.com',
    },
    {
      journey_id: 'journey-2',
      journey_name: null,
      status: 'finished',
      started_at: '2026-04-02T15:30:00.000Z',
      user_id: '2',
      user_name: null,
      user_email: 'admin@test.com',
    },
  ];

  readonly deleteUserRepoMock = jest.fn((id: number) => {
    this.users.delete(Number(id));
    return Promise.resolve(undefined);
  });

  readonly verifyIdToken = jest.fn((token: string) => {
    const payload = this.tokens[token];
    if (!payload) throw new Error('invalid token');
    return Promise.resolve(payload);
  });

  readonly deleteFirebaseUser = jest.fn(() => Promise.resolve(undefined));
  readonly deleteVehicleRepoMock = jest.fn((id: string) => {
    this.vehicles.delete(id);
    return Promise.resolve(undefined);
  });
  readonly queryDataSourceMock = jest.fn((sql: string) => {
    if (sql.includes('vw_analytics_dashboard')) {
      return Promise.resolve(this.analyticsDashboardRows);
    }

    if (sql.includes('vw_analytics_users')) {
      return Promise.resolve(this.analyticsUsersRows);
    }

    if (sql.includes('vw_journeys_users')) {
      return Promise.resolve(this.analyticsJourneysRows);
    }

    return Promise.resolve([]);
  });

  readonly userRepo: UserRepo = {
    save: jest.fn((user: UserModel) => {
      const existing = [...this.users.values()].find(
        (current) => current.email === user.email,
      );
      const saved = new UserModel({
        ...user.toJSON(),
        id: existing?.id ?? this.nextId++,
        role: user.role === 'not_provided' ? 'user' : user.role,
        createdAt: existing?.createdAt ?? now,
        updatedAt: now,
      });
      this.users.set(saved.id, saved);
      return Promise.resolve(saved);
    }),
    update: jest.fn((changes: UserModel) => {
      const existing = this.users.get(changes.id);
      if (!existing) return Promise.resolve(changes);

      const merged = new UserModel({
        ...existing.toJSON(),
        ...(changes.uid !== undefined && { uid: changes.uid }),
        ...(changes.name !== undefined && { name: changes.name }),
        ...(changes.role !== 'not_provided' && { role: changes.role }),
        updatedAt: now,
      });
      this.users.set(merged.id, merged);
      return Promise.resolve(merged);
    }),
    delete: this.deleteUserRepoMock,
    findById: jest.fn((id: number) =>
      Promise.resolve(this.users.get(Number(id)) ?? null),
    ),
    findByUid: jest.fn((uid: string) =>
      Promise.resolve(
        [...this.users.values()].find((user) => user.uid === uid) ?? null,
      ),
    ),
    findOwners: jest.fn(() =>
      Promise.resolve(
        [...this.users.values()].filter((user) => user.role === 'owner'),
      ),
    ),
    findList: jest.fn(({ limit, lastItemId }) => {
      const filtered = [...this.users.values()]
        .filter((user) => !lastItemId || user.id > Number(lastItemId))
        .sort((a, b) => a.id - b.id);

      return Promise.resolve({
        list: filtered.slice(0, Number(limit)),
        total: filtered.length,
      });
    }),
    changeRole: jest.fn((id, role) => {
      const user = this.users.get(Number(id));
      if (user && user.role !== 'owner') user.role = role;
      return Promise.resolve(undefined);
    }),
  };

  readonly firebaseService = {
    client: {
      auth: () => ({
        verifyIdToken: this.verifyIdToken,
        deleteUser: this.deleteFirebaseUser,
      }),
    },
  };

  readonly vehicleRepo: VehicleRepo = {
    create: jest.fn((vehicle: VehicleModel) => {
      this.vehicles.set(vehicle.id, vehicle);
      return Promise.resolve(vehicle);
    }),
    update: jest.fn((changes: VehicleModel) => {
      const existing = this.vehicles.get(changes.id);
      if (!existing) return Promise.resolve(changes);

      const merged = new VehicleModel({
        ...existing.toJSON(),
        ...changes.toJSON(),
        updatedAt: now,
      });
      this.vehicles.set(merged.id, merged);
      return Promise.resolve(merged);
    }),
    delete: this.deleteVehicleRepoMock,
    findById: jest.fn((id: string) =>
      Promise.resolve(this.vehicles.get(id) ?? null),
    ),
    findAll: jest.fn(() =>
      Promise.resolve(
        [...this.vehicles.values()].sort(
          (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
        ),
      ),
    ),
  };

  readonly incidentRepo: IncidentRepo = {
    create: jest.fn((incident: IncidentModel) => {
      this.incidents.set(incident.id, incident);
      return Promise.resolve(incident);
    }),
    update: jest.fn((changes: IncidentModel) => {
      const existing = this.incidents.get(changes.id);
      if (!existing) return Promise.resolve(changes);

      const merged = new IncidentModel({
        ...existing.toJSON(),
        ...changes.toJSON(),
        createdAt: existing.createdAt,
        updatedAt: now,
      });
      this.incidents.set(merged.id, merged);
      return Promise.resolve(merged);
    }),
    delete: jest.fn((id: string) => {
      this.incidents.delete(id);
      return Promise.resolve(undefined);
    }),
    findById: jest.fn((id: string) =>
      Promise.resolve(this.incidents.get(id) ?? null),
    ),
    findAll: jest.fn(() =>
      Promise.resolve(
        [...this.incidents.values()].sort(
          (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
        ),
      ),
    ),
    findByVehicleId: jest.fn((vehicleId: string) =>
      Promise.resolve(
        [...this.incidents.values()]
          .filter((incident) => incident.vehicleId === vehicleId)
          .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime()),
      ),
    ),
  };

  readonly dataSource = {
    isInitialized: true,
    destroy: jest.fn(() => Promise.resolve(undefined)),
    query: this.queryDataSourceMock,
    getRepository: jest.fn(() => ({
      countBy: jest.fn(() => Promise.resolve(0)),
      delete: jest.fn(() => Promise.resolve(undefined)),
      find: jest.fn(() => Promise.resolve([])),
      findBy: jest.fn(() => Promise.resolve([])),
      findOneBy: jest.fn(() => Promise.resolve(null)),
      findOneByOrFail: jest.fn(() => Promise.resolve(undefined)),
      insert: jest.fn(() => Promise.resolve(undefined)),
      update: jest.fn(() => Promise.resolve(undefined)),
      upsert: jest.fn(() => Promise.resolve(undefined)),
    })),
    transaction: jest.fn((callback: (manager: unknown) => Promise<void>) =>
      Promise.resolve(
        callback({
          getRepository: jest.fn(() => ({
            insert: jest.fn(() => Promise.resolve(undefined)),
          })),
        }),
      ).then(() => undefined),
    ),
  };

  readonly tokens: Record<string, TokenPayload> = {
    'valid-user-token': {
      uid: 'uid-user',
      name: 'Usuario Teste',
      email: 'user@test.com',
      firebase: { sign_in_provider: 'password' },
    },
    'valid-admin-token': {
      uid: 'uid-admin',
      name: 'Admin Teste',
      email: 'admin@test.com',
      firebase: { sign_in_provider: 'password' },
    },
    'new-user-token': {
      uid: 'uid-new-user',
      email: 'new-user@test.com',
      firebase: { sign_in_provider: 'google.com' },
    },
  };

  reset() {
    jest.clearAllMocks();
    this.nextId = 10;
    this.users = new Map(
      [
        new UserModel({
          id: 1,
          uid: 'uid-user',
          email: 'user@test.com',
          name: 'Usuario Teste',
          provider: 'password',
          role: 'user',
          createdAt: now,
          updatedAt: now,
        }),
        new UserModel({
          id: 2,
          uid: 'uid-admin',
          email: 'admin@test.com',
          name: 'Admin Teste',
          provider: 'password',
          role: 'admin',
          createdAt: now,
          updatedAt: now,
        }),
        new UserModel({
          id: 3,
          uid: 'uid-owner',
          email: 'owner@test.com',
          name: 'Owner Teste',
          provider: 'password',
          role: 'owner',
          createdAt: now,
          updatedAt: now,
        }),
      ].map((user) => [user.id, user]),
    );
    this.vehicles = new Map(
      [
        new VehicleModel({
          id: 'vehicle-1-id',
          marca: 'Fiat',
          modelo: 'Uno',
          ano: 2020,
          placa: 'ABC1D23',
          createdAt: now,
          updatedAt: now,
        }),
        new VehicleModel({
          id: 'vehicle-2-id',
          marca: 'Volkswagen',
          modelo: 'Gol',
          ano: 2021,
          placa: 'XYZ9K87',
          createdAt: new Date(now.getTime() + 1_000),
          updatedAt: new Date(now.getTime() + 1_000),
        }),
      ].map((vehicle) => [vehicle.id, vehicle]),
    );
    this.incidents = new Map(
      [
        new IncidentModel({
          id: 'incident-1-id',
          vehicleId: incidentVehicleOneId,
          tipo: IncidentType.SINISTRO,
          descricao: 'Colisao traseira leve',
          valor: 500,
          data: new Date('2026-04-05T10:00:00.000Z'),
          createdAt: now,
          updatedAt: now,
        }),
        new IncidentModel({
          id: 'incident-2-id',
          vehicleId: incidentVehicleTwoId,
          tipo: IncidentType.MULTA,
          descricao: 'Excesso de velocidade',
          valor: 250,
          data: new Date('2026-04-06T11:30:00.000Z'),
          createdAt: new Date(now.getTime() + 1_000),
          updatedAt: new Date(now.getTime() + 1_000),
        }),
      ].map((incident) => [incident.id, incident]),
    );
  }
}

const getGlobals = () => globalThis as E2eGlobals;

export const getE2eApp = () => {
  const app = getGlobals().__E2E_APP__;
  if (!app) throw new Error('E2E app was not initialized.');
  return app;
};

export const getE2eHttpServer = () => {
  return getE2eApp().getHttpServer();
};

export const getE2eState = () => {
  const state = getGlobals().__E2E_STATE__;
  if (!state) throw new Error('E2E state was not initialized.');
  return state;
};

beforeAll(async () => {
  const state = new E2eTestState();
  state.reset();

  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(FirebaseService)
    .useValue(state.firebaseService)
    .overrideProvider(UserRepo)
    .useValue(state.userRepo)
    .overrideProvider(VehicleRepo)
    .useValue(state.vehicleRepo)
    .overrideProvider(IncidentRepo)
    .useValue(state.incidentRepo)
    .overrideProvider(typeORMConsts.databaseProviders)
    .useValue(state.dataSource)
    .compile();

  const app: INestApplication<App> = moduleFixture.createNestApplication();
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
    }),
  );
  await app.init();

  getGlobals().__E2E_STATE__ = state;
  getGlobals().__E2E_APP__ = app;
});

beforeEach(() => {
  getE2eState().reset();
});

afterAll(async () => {
  await getGlobals().__E2E_APP__?.close();
  delete getGlobals().__E2E_APP__;
  delete getGlobals().__E2E_STATE__;
});

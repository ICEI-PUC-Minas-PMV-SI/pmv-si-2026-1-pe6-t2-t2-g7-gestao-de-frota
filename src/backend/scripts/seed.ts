import 'reflect-metadata';
import { randomUUID } from 'crypto';
import { getDataSource } from '../src/modules/commons/typeorm/Database.provider';
import {
  IncidentModel,
  IncidentSeverity,
  IncidentStatus,
  IncidentType,
} from '../src/modules/incident/models/Incident.model';
import { JourneyModel } from '../src/modules/journey/models/Journey.model';
import { JourneyPositionModel } from '../src/modules/journey/models/JourneyPosition.model';
import { JourneyStopModel } from '../src/modules/journey/models/JourneyStop.model';
import { TelemetryModel } from '../src/modules/telemetry/models/Telemetry.model';
import { VehicleModel } from '../src/modules/vehicle/models/Vehicle.model';
import {
  UserModel,
  type TUserProviderType,
  type TUserRole,
} from '../src/modules/commons/auth/models/User.model';

type SeedOptions = {
  users: number;
  vehicles: number;
  incidents: number;
  journeys: number;
  telemetryPerVehicle: number;
  positionsPerJourney: number;
  stopsPerJourneyMin: number;
  stopsPerJourneyMax: number;
  reset: boolean;
};

type Point = {
  latitude: number;
  longitude: number;
};

type SeedSummary = {
  users: number;
  vehicles: number;
  incidents: number;
  journeys: number;
  journeyStops: number;
  journeyPositions: number;
  telemetry: number;
};

const DEFAULTS: SeedOptions = {
  users: 40,
  vehicles: 120,
  incidents: 320,
  journeys: 260,
  telemetryPerVehicle: 14,
  positionsPerJourney: 18,
  stopsPerJourneyMin: 2,
  stopsPerJourneyMax: 6,
  reset: false,
};

const PROVIDERS: TUserProviderType[] = ['password', 'google.com', 'github.com'];
const ROLES: TUserRole[] = ['owner', 'admin', 'user'];
const BRANDS = [
  'Fiat',
  'Volkswagen',
  'Chevrolet',
  'Toyota',
  'Renault',
  'Hyundai',
  'Ford',
  'Mercedes-Benz',
  'Volvo',
  'Scania',
];
const MODELS = [
  'Strada',
  'Fiorino',
  'Saveiro',
  'Hilux',
  'Master',
  'Transit',
  'HR',
  'Accelo',
  'FH',
  'P 320',
];
const PERSON_NAMES = [
  'Ana',
  'Bruno',
  'Carla',
  'Daniel',
  'Eduarda',
  'Felipe',
  'Gabriela',
  'Henrique',
  'Isabela',
  'Joao',
  'Karen',
  'Lucas',
  'Marina',
  'Nicolas',
  'Otavio',
  'Patricia',
  'Rafael',
  'Sabrina',
  'Thiago',
  'Viviane',
];
const ROAD_NAMES = [
  'Av. Paulista',
  'Rod. Anhanguera',
  'Marginal Tiete',
  'Av. Brasil',
  'Rod. Dutra',
  'BR-101',
  'Av. das Nacoes',
  'Av. Industrial',
  'Rod. Castelo Branco',
  'Av. Atlantica',
];
const CITIES = [
  'Sao Paulo',
  'Campinas',
  'Santos',
  'Sorocaba',
  'Ribeirao Preto',
  'Curitiba',
  'Joinville',
  'Belo Horizonte',
  'Goiania',
  'Rio de Janeiro',
];
const FLEET_IMAGES = [
  'https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=1200&q=80',
];

function parseArgs(argv: string[]): SeedOptions {
  const options = { ...DEFAULTS };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1];

    if (arg === '--reset') {
      options.reset = true;
      continue;
    }

    if (!next) continue;

    if (arg === '--users') options.users = toPositiveInt(next, options.users);
    if (arg === '--vehicles') options.vehicles = toPositiveInt(next, options.vehicles);
    if (arg === '--incidents')
      options.incidents = toPositiveInt(next, options.incidents);
    if (arg === '--journeys') options.journeys = toPositiveInt(next, options.journeys);
    if (arg === '--telemetry-per-vehicle')
      options.telemetryPerVehicle = toPositiveInt(next, options.telemetryPerVehicle);
    if (arg === '--positions-per-journey')
      options.positionsPerJourney = toPositiveInt(next, options.positionsPerJourney);
    if (arg === '--stops-min')
      options.stopsPerJourneyMin = toPositiveInt(next, options.stopsPerJourneyMin);
    if (arg === '--stops-max')
      options.stopsPerJourneyMax = toPositiveInt(next, options.stopsPerJourneyMax);
  }

  if (options.stopsPerJourneyMax < options.stopsPerJourneyMin) {
    options.stopsPerJourneyMax = options.stopsPerJourneyMin;
  }

  return options;
}

function toPositiveInt(value: string, fallback: number) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function randInt(min: number, max: number) {
  return Math.floor(rand(min, max + 1));
}

function pick<T>(items: T[]) {
  return items[randInt(0, items.length - 1)];
}

function chance(probability: number) {
  return Math.random() < probability;
}

function slugify(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '.')
    .replace(/(^\.|\.$)/g, '');
}

function plateFromIndex(index: number) {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const a = letters[Math.floor(index / (26 * 26)) % 26];
  const b = letters[Math.floor(index / 26) % 26];
  const c = letters[index % 26];
  const digit = Math.floor(index / (26 * 26 * 26)) % 10;
  const tailLetter = letters[Math.floor(index / 10) % 26];
  const tailDigit = Math.floor(index / (26 * 3)) % 10;
  return `${a}${b}${c}${digit}${tailLetter}${tailDigit}`;
}

function baseTimestamp(daysAgo: number) {
  return new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
}

function shiftDate(base: Date, minMinutes: number, maxMinutes: number) {
  return new Date(base.getTime() + randInt(minMinutes, maxMinutes) * 60 * 1000);
}

function generateUsers(total: number) {
  const users: UserModel[] = [];

  for (let index = 0; index < total; index += 1) {
    const name = `${pick(PERSON_NAMES)} ${pick([
      'Silva',
      'Souza',
      'Oliveira',
      'Costa',
      'Pereira',
      'Rodrigues',
      'Almeida',
      'Nascimento',
      'Lima',
      'Gomes',
    ])}`;
    const createdAt = baseTimestamp(randInt(20, 360));
    users.push(
      new UserModel({
        id: -(index + 1),
        email: `${slugify(name)}.${index + 1}@seed.local`,
        name,
        provider: index === 0 ? 'password' : pick(PROVIDERS),
        role: index === 0 ? 'owner' : index < 4 ? 'admin' : pick(ROLES),
        uid: `seed-user-${randomUUID()}`,
        createdAt,
        updatedAt: shiftDate(createdAt, 10, 3000),
      }),
    );
  }

  return users;
}

function generateVehicles(total: number) {
  const vehicles: VehicleModel[] = [];

  for (let index = 0; index < total; index += 1) {
    const createdAt = baseTimestamp(randInt(5, 240));
    vehicles.push(
      new VehicleModel({
        marca: pick(BRANDS),
        modelo: pick(MODELS),
        ano: randInt(2014, 2026),
        placa: plateFromIndex(index + 100),
        fotoUrl: pick(FLEET_IMAGES),
        tamanhoTanque: randInt(45, 180),
        consumoMedio: Number(rand(5.5, 14.5).toFixed(2)),
        createdAt,
        updatedAt: shiftDate(createdAt, 30, 5000),
      }),
    );
  }

  return vehicles;
}

function buildRoutePoints(start: Point, totalStops: number) {
  const points: Point[] = [];
  let current = { ...start };

  for (let index = 0; index < totalStops; index += 1) {
    current = {
      latitude: Number((current.latitude + rand(-0.18, 0.18)).toFixed(6)),
      longitude: Number((current.longitude + rand(-0.18, 0.18)).toFixed(6)),
    };
    points.push(current);
  }

  return points;
}

function generateJourneys(
  total: number,
  users: UserModel[],
  vehicles: VehicleModel[],
  options: SeedOptions,
) {
  const journeys: JourneyModel[] = [];
  const stops: JourneyStopModel[] = [];
  const positions: JourneyPositionModel[] = [];

  for (let index = 0; index < total; index += 1) {
    const user = pick(users);
    const vehicle = pick(vehicles);
    const startedAt = baseTimestamp(randInt(1, 120));
    const stopCount = randInt(options.stopsPerJourneyMin, options.stopsPerJourneyMax);
    const route = buildRoutePoints(
      {
        latitude: rand(-30, -5),
        longitude: rand(-55, -35),
      },
      stopCount,
    );
    const kmRodados = Number(rand(18, 820).toFixed(2));
    const combustivelGasto = Number(rand(4, 160).toFixed(2));
    const nivelCombustivel = Number(rand(8, 100).toFixed(2));
    const statusRoll = Math.random();
    const status =
      statusRoll < 0.7
        ? 'completed'
        : statusRoll < 0.9
          ? 'in_progress'
          : 'cancelled';

    const journey = new JourneyModel({
      userId: user.id,
      vehicleId: vehicle.id,
      name: `Rota ${pick(CITIES)} ${index + 1}`,
      status,
      kmRodados,
      combustivelGasto,
      nivelCombustivel,
      startedAt,
      createdAt: startedAt,
      updatedAt: shiftDate(startedAt, 60, 720),
    });

    journeys.push(journey);

    route.forEach((point, stopIndex) => {
      stops.push(
        new JourneyStopModel({
          journeyId: journey.id,
          stopOrder: stopIndex + 1,
          latitude: point.latitude,
          longitude: point.longitude,
          createdAt: shiftDate(startedAt, stopIndex * 15, stopIndex * 25 + 5),
        }),
      );
    });

    for (let positionIndex = 0; positionIndex < options.positionsPerJourney; positionIndex += 1) {
      const anchor = route[Math.min(positionIndex % route.length, route.length - 1)];
      positions.push(
        new JourneyPositionModel({
          journeyId: journey.id,
          latitude: Number((anchor.latitude + rand(-0.01, 0.01)).toFixed(6)),
          longitude: Number((anchor.longitude + rand(-0.01, 0.01)).toFixed(6)),
          recordedAt: shiftDate(startedAt, positionIndex * 6, positionIndex * 8 + 2),
        }),
      );
    }
  }

  return { journeys, stops, positions };
}

function generateTelemetry(vehicles: VehicleModel[], perVehicle: number) {
  const telemetry: TelemetryModel[] = [];

  for (const vehicle of vehicles) {
    let kmAccumulator = rand(10, 2500);
    let fuelAccumulator = rand(2, 400);
    let fuelLevel = rand(15, 100);

    for (let index = 0; index < perVehicle; index += 1) {
      const recordedAt = baseTimestamp(randInt(0, 45));
      kmAccumulator += rand(8, 140);
      fuelAccumulator += rand(1, 18);
      fuelLevel = Math.max(2, Math.min(100, fuelLevel + rand(-22, 12)));

      telemetry.push(
        new TelemetryModel({
          vehicleId: vehicle.id,
          kmRodados: Number(kmAccumulator.toFixed(2)),
          combustivelGasto: Number(fuelAccumulator.toFixed(2)),
          nivelCombustivel: Number(fuelLevel.toFixed(2)),
          velocidadeMedia: Number(rand(25, 94).toFixed(2)),
          recordedAt,
          createdAt: recordedAt,
          updatedAt: shiftDate(recordedAt, 10, 120),
        }),
      );
    }
  }

  telemetry.sort((a, b) => a.recordedAt.getTime() - b.recordedAt.getTime());
  return telemetry;
}

function generateIncidents(total: number, vehicles: VehicleModel[]) {
  const incidents: IncidentModel[] = [];

  for (let index = 0; index < total; index += 1) {
    const vehicle = pick(vehicles);
    const tipo = chance(0.6) ? IncidentType.MULTA : IncidentType.SINISTRO;
    const createdAt = baseTimestamp(randInt(0, 180));

    incidents.push(
      new IncidentModel({
        vehicleId: vehicle.id,
        tipo,
        status: pick([
          IncidentStatus.ABERTO,
          IncidentStatus.EM_ANALISE,
          IncidentStatus.RESOLVIDO,
          IncidentStatus.CANCELADO,
        ]),
        severidade: pick([
          IncidentSeverity.BAIXA,
          IncidentSeverity.MEDIA,
          IncidentSeverity.ALTA,
          IncidentSeverity.CRITICA,
        ]),
        descricao:
          tipo === IncidentType.MULTA
            ? `Autuacao registrada por excesso de velocidade proximo a ${pick(CITIES)}.`
            : `Ocorrencia operacional com o veiculo durante deslocamento em ${pick(CITIES)}.`,
        codigoInfracao:
          tipo === IncidentType.MULTA ? `INF-${randInt(1000, 9999)}` : undefined,
        valor:
          tipo === IncidentType.MULTA
            ? Number(rand(120, 1900).toFixed(2))
            : undefined,
        localInfracao:
          tipo === IncidentType.MULTA
            ? `${pick(ROAD_NAMES)}, ${pick(CITIES)}`
            : undefined,
        natureza:
          tipo === IncidentType.SINISTRO
            ? pick(['colisao', 'avaria', 'roubo', 'pane', 'quebra mecanica'])
            : undefined,
        local:
          tipo === IncidentType.SINISTRO
            ? `${pick(ROAD_NAMES)}, ${pick(CITIES)}`
            : undefined,
        data: createdAt,
        createdAt,
        updatedAt: shiftDate(createdAt, 20, 6000),
      }),
    );
  }

  return incidents;
}

async function resetDatabase() {
  const dataSource = await getDataSource();

  try {
    await dataSource.transaction(async (manager) => {
      await manager.query('DELETE FROM journey_positions');
      await manager.query('DELETE FROM journey_stops');
      await manager.query('DELETE FROM journeys');
      await manager.query('DELETE FROM telemetry');
      await manager.query('DELETE FROM incidents');
      await manager.query('DELETE FROM vehicles');
      await manager.query('DELETE FROM users');
    });
  } finally {
    await dataSource.destroy();
  }
}

async function insertSeed(options: SeedOptions) {
  const users = generateUsers(options.users);
  const vehicles = generateVehicles(options.vehicles);
  const incidents = generateIncidents(options.incidents, vehicles);
  const { journeys, stops, positions } = generateJourneys(
    options.journeys,
    users,
    vehicles,
    options,
  );
  const telemetry = generateTelemetry(vehicles, options.telemetryPerVehicle);

  const dataSource = await getDataSource();

  try {
    await dataSource.transaction(async (manager) => {
      await manager.getRepository(UserModel).insert(users.map((row) => row.toJSON()));
      await manager
        .getRepository(VehicleModel)
        .insert(vehicles.map((row) => row.toJSON()));
      await manager
        .getRepository(IncidentModel)
        .insert(incidents.map((row) => row.toJSON()));
      await manager
        .getRepository(JourneyModel)
        .insert(journeys.map((row) => row.toJSON()));
      await manager
        .getRepository(JourneyStopModel)
        .insert(stops.map((row) => row.toJSON()));
      await manager
        .getRepository(JourneyPositionModel)
        .insert(positions.map((row) => row.toJSON()));
      await manager
        .getRepository(TelemetryModel)
        .insert(telemetry.map((row) => row.toJSON()));
    });
  } finally {
    await dataSource.destroy();
  }

  const summary: SeedSummary = {
    users: users.length,
    vehicles: vehicles.length,
    incidents: incidents.length,
    journeys: journeys.length,
    journeyStops: stops.length,
    journeyPositions: positions.length,
    telemetry: telemetry.length,
  };

  return summary;
}

function printSummary(options: SeedOptions, summary: SeedSummary) {
  console.log('Seed concluido.');
  console.log(JSON.stringify({ options, summary }, null, 2));
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  if (options.reset) {
    console.log('Limpando dados existentes...');
    await resetDatabase();
  }

  console.log('Gerando dados...');
  const summary = await insertSeed(options);
  printSummary(options, summary);
}

void main().catch((error: unknown) => {
  console.error('Falha ao executar seed.');
  console.error(error);
  process.exitCode = 1;
});

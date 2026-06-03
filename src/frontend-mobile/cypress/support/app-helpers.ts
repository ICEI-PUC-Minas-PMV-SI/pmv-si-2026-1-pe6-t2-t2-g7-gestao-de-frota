import { realClick, realType } from "cypress-real-events";

export type TestUser = {
  displayName: string;
  email: string;
  password: string;
};

export type TestVehicle = {
  brand: string;
  model: string;
  year?: string;
  plate: string;
  tankSize?: string;
  averageConsumption?: string;
  photoUrl?: string;
};

export type TestIncident = {
  vehicleLabel?: string;
  type?: "multa" | "sinistro";
  severity?: "baixa" | "media" | "alta" | "critica";
  description: string;
  violationCode?: string;
  value?: string;
  violationLocation?: string;
};

export type MobileTab = "Painel" | "Frota" | "Mapa" | "Incidentes" | "Conta";

const DEFAULT_PHOTO_URL =
  "https://upload.wikimedia.org/wikipedia/commons/8/82/Dummies.jpg";

const TAB_BY_PATH = {
  "/dashboard": "Painel",
  "/vehicles": "Frota",
  "/map": "Mapa",
  "/incidents": "Incidentes",
  "/account": "Conta",
} as const satisfies Record<string, MobileTab>;

export function uniqueSuffix() {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

export function buildUser(prefix = "mobile-cypress"): TestUser {
  const suffix = uniqueSuffix();
  return {
    displayName: `Mobile Cypress ${suffix}`,
    email: `${prefix}-${suffix}@gmail.com`,
    password: "teste123",
  };
}

export function buildVehicle(
  modelPrefix = "Veiculo",
  brand = "Cypress",
): TestVehicle {
  const suffix = uniqueSuffix().slice(0, 6);
  const randomDigit = Math.floor(Math.random() * 10);
  const randomLetter = String.fromCharCode(
    65 + Math.floor(Math.random() * 26),
  );
  const randomTail = String(Math.floor(Math.random() * 90) + 10);

  return {
    brand,
    model: `${modelPrefix} ${suffix}`,
    year: "2024",
    plate: `MCP${randomDigit}${randomLetter}${randomTail}`,
    tankSize: "55",
    averageConsumption: "12.5",
    photoUrl: DEFAULT_PHOTO_URL,
  };
}

export function fillInput(selector: string, value: string, options?: { clear?: boolean }) {
  const shouldClear = options?.clear ?? false;
  cy.get(selector, { timeout: 15000 })
    .filter(":visible")
    .first()
    .then(($input) => {
      cy.wrap($input).realClick();
      if (shouldClear) {
        cy.wrap($input).realPress(["Control", "A"]);
        cy.wrap($input).realPress("Backspace");
      }
      if (/^[\x20-\x7E]*$/.test(value)) {
        cy.wrap($input).realType(value);
      } else {
        cy.wrap($input).type(value, { force: true });
      }
    });
}

export function signUpViaUi(user: TestUser) {
  cy.visit("/signup");
  fillInput("#signup-name", user.displayName);
  fillInput("#signup-email", user.email);
  fillInput("#signup-password", user.password);
  fillInput("#signup-password-confirm", user.password);
  cy.contains("button", "Criar conta").click();
  cy.url({ timeout: 25000 }).should("include", "/dashboard");
  cy.contains("Painel da frota", { timeout: 25000 }).should("be.visible");
}

export function loginViaUi(user: TestUser) {
  cy.visit("/login");
  fillInput("#login-email", user.email);
  fillInput("#login-password", user.password);
  cy.contains("button", "Entrar com e-mail").click();
  cy.url({ timeout: 25000 }).should("include", "/dashboard");
}

export function logoutViaTabBar() {
  goToTab("Conta");
  cy.contains("button", "Sair").click();
  cy.url({ timeout: 25000 }).should("include", "/login");
}

export function goToTab(tab: MobileTab) {
  cy.get(`button[aria-label="${tab}"]`, { timeout: 15000 })
    .should("exist")
    .click({ force: true });
}

export function goToModule(path: keyof typeof TAB_BY_PATH) {
  goToTab(TAB_BY_PATH[path]);
  cy.url({ timeout: 20000 }).should("include", path.replace(/^\//, ""));
}

function waitForVehicleFormSheet() {
  cy.contains("Novo veículo", { timeout: 15000 }).should("be.visible");
  cy.get("#vehicle-marca", { timeout: 15000 }).should("be.visible");
}

export function createVehicleViaUi(vehicle: TestVehicle) {
  cy.contains("button", "Novo veículo").click();
  waitForVehicleFormSheet();
  fillInput("#vehicle-marca", vehicle.brand);
  fillInput("#vehicle-modelo", vehicle.model);
  fillInput("#vehicle-ano", vehicle.year ?? "2024");
  fillInput("#vehicle-placa", vehicle.plate);
  fillInput("#vehicle-tamanhoTanque", vehicle.tankSize ?? "55");
  fillInput("#vehicle-consumoMedio", vehicle.averageConsumption ?? "12.5");
  fillInput("#vehicle-fotoUrl", vehicle.photoUrl ?? DEFAULT_PHOTO_URL);
  cy.contains("button", "Cadastrar veículo").click();
  cy.contains("Veículo cadastrado com sucesso.", { timeout: 20000 }).should(
    "be.visible",
  );
  cy.get("#vehicle-marca", { timeout: 15000 }).should("not.exist");
}

export function waitForIncidentFormSheet(mode: "create" | "edit" = "create") {
  cy.contains(mode === "edit" ? "Editar incidente" : "Novo incidente", {
    timeout: 20000,
  }).should("be.visible");
  cy.get("#incident-descricao", { timeout: 15000 }).should("be.visible");
}

/** Simula GPS no Expo Web (navigator.geolocation). Chamar antes de abrir o mapa. */
export function stubGeolocation(
  coords: { latitude: number; longitude: number } = {
    latitude: -14.235,
    longitude: -51.9253,
  },
) {
  cy.window().then((win) => {
    const position = {
      coords: {
        latitude: coords.latitude,
        longitude: coords.longitude,
        accuracy: 5,
        altitude: null,
        altitudeAccuracy: null,
        heading: null,
        speed: null,
      },
      timestamp: Date.now(),
    };

    cy.stub(win.navigator.geolocation, "getCurrentPosition").callsFake((success) => {
      if (typeof success === "function") success(position as GeolocationPosition);
    });
    cy.stub(win.navigator.geolocation, "watchPosition").callsFake((success) => {
      if (typeof success === "function") success(position as GeolocationPosition);
      return 1;
    });
    cy.stub(win.navigator.geolocation, "clearWatch").returns(undefined);
  });
}

export function openMapJourneyPanel() {
  cy.get('button[aria-label="Abrir painel de jornada"]', { timeout: 15000 })
    .should("exist")
    .click({ force: true });
  cy.contains("Jornada", { timeout: 10000 }).should("be.visible");
}

function closeMapJourneyPanel() {
  cy.get('[aria-label="Fechar"]', { timeout: 10000 }).first().click({ force: true });
}

/** Clica no mapa Leaflet e/ou usa GPS para adicionar paradas. */
export function addMapStops(count = 2) {
  cy.get(".leaflet-container", { timeout: 25000 }).should("be.visible");

  openMapJourneyPanel();

  if (count >= 1) {
    cy.contains("button", "Minha posição", { timeout: 10000 })
      .should("not.be.disabled")
      .click();
    cy.contains("Paradas: 1", { timeout: 10000 }).should("exist");
  }

  if (count >= 2) {
    closeMapJourneyPanel();
    cy.get(".leaflet-container").click(120, 320, { force: true });
    cy.wait(400);
    openMapJourneyPanel();
    cy.contains(`Paradas: ${count}`, { timeout: 10000 }).should("exist");
  }

  for (let extra = 3; extra <= count; extra++) {
    closeMapJourneyPanel();
    cy.get(".leaflet-container").click(120 + extra * 40, 320 + extra * 30, {
      force: true,
    });
    cy.wait(400);
    openMapJourneyPanel();
    cy.contains(`Paradas: ${extra}`, { timeout: 10000 }).should("exist");
  }
}

export function startMapJourney() {
  cy.contains("button", "Iniciar jornada", { timeout: 15000 })
    .should("not.be.disabled")
    .click();
}

export function waitForMapJourneyCompletion(timeout = 90000) {
  cy.contains("Simulação concluída", { timeout }).should("exist");
  cy.contains("button", "Iniciar jornada", { timeout: 15000 }).should("exist");
}

export function assertVehicleHasCompletedJourney(vehicleLabel: string) {
  closeMapJourneyPanel();
  cy.intercept("GET", "**/vehicle/*/journeys").as("vehicleJourneys");
  goToModule("/vehicles");
  cy.contains(vehicleLabel, { timeout: 15000 }).should("exist");
  cy.contains("button", "Exibir").click();
  cy.contains("Dados cadastrados", { timeout: 15000 }).should("be.visible");
  cy.contains("Registros do veículo", { timeout: 15000 }).scrollIntoView();
  cy.contains("1 registro(s)", { timeout: 20000 }).click({ force: true });
  cy.wait("@vehicleJourneys");
  cy.contains("Tabela de jornadas", { timeout: 15000 }).should("be.visible");
  cy.contains("Concluída", { timeout: 20000 }).should("exist");
}

export function createIncidentViaUi(incident: TestIncident) {
  cy.contains("button", "Novo incidente").click();
  waitForIncidentFormSheet();

  if ((incident.type ?? "multa") === "sinistro") {
    cy.contains("Sinistro").click({ force: true });
  }

  if (incident.vehicleLabel) {
    cy.get('[aria-label="Veículo"]').click();
    cy.contains(incident.vehicleLabel).click({ force: true });
  }

  if (incident.severity) {
    const severityLabels: Record<NonNullable<TestIncident["severity"]>, string> =
      {
        baixa: "Baixa",
        media: "Média",
        alta: "Alta",
        critica: "Crítica",
      };
    cy.contains(severityLabels[incident.severity]).click({ force: true });
  }

  fillInput("#incident-descricao", incident.description);

  if ((incident.type ?? "multa") === "multa") {
    if (incident.violationCode !== undefined) {
      fillInput("#incident-codigoInfracao", incident.violationCode);
    }
    if (incident.value !== undefined) {
      fillInput("#incident-valor", incident.value);
    }
    if (incident.violationLocation !== undefined) {
      fillInput("#incident-localInfracao", incident.violationLocation);
    }
  }

  cy.contains("button", "Registrar incidente").click();
}

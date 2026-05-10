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
  vehicleSearch: string;
  vehicleLabel?: string;
  type?: "multa" | "sinistro";
  status?: "aberto" | "em_analise" | "resolvido" | "cancelado";
  severity?: "baixa" | "media" | "alta" | "critica";
  description: string;
  date?: string;
  violationCode?: string;
  value?: string;
  violationLocation?: string;
  nature?: string;
  location?: string;
};

const DEFAULT_PHOTO_URL =
  "https://upload.wikimedia.org/wikipedia/commons/8/82/Dummies.jpg";

export function uniqueSuffix() {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

export function buildUser(prefix = "teste-cypress"): TestUser {
  const suffix = uniqueSuffix();
  return {
    displayName: `Cypress ${suffix}`,
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
    plate: `CYP${randomDigit}${randomLetter}${randomTail}`,
    tankSize: "55",
    averageConsumption: "12.5",
    photoUrl: DEFAULT_PHOTO_URL,
  };
}

export function signUpViaUi(user: TestUser) {
  cy.visit("/signup");
  cy.get("#signup-name").clear().type(user.displayName);
  cy.get("#signup-email").clear().type(user.email);
  cy.get("#signup-password").clear().type(user.password);
  cy.get("#signup-password-confirm").clear().type(user.password);
  cy.contains("button", "Criar conta").click();
  cy.url({ timeout: 20000 }).should("include", "/homepage");
}

export function loginViaUi(user: TestUser) {
  cy.visit("/login");
  cy.get("#login-email").clear().type(user.email);
  cy.get("#login-password").clear().type(user.password);
  cy.contains("button", "Entrar com e-mail").click();
  cy.url({ timeout: 20000 }).should("include", "/homepage");
}

export function logoutViaSidebar() {
  cy.get('aside button[aria-label="Sair da conta"]').click();
  cy.url({ timeout: 20000 }).should("include", "/login");
}

export function goToModule(path: string) {
  cy.get(`aside a[href="${path}"]`).click();
  cy.url({ timeout: 20000 }).should("include", path);
}

function fillInput(selector: string, value: string) {
  cy.get(selector).should("be.visible").clear();
  cy.get(selector).should("be.visible").type(value);
}

function waitForVehicleFormSheet() {
  cy.get('[data-slot="sheet-content"]', { timeout: 15000 }).should("be.visible");
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
  cy.contains("Veículo criado com sucesso.", { timeout: 15000 }).should(
    "be.visible",
  );
  cy.get("body").then(($body) => {
    if ($body.find("#vehicle-marca").length > 0) {
      cy.contains("button", "Cancelar").click({ force: true });
    }
  });
  cy.get("#vehicle-marca", { timeout: 15000 }).should("not.exist");
}

export function searchVehicle(term: string) {
  cy.get('input[placeholder="Buscar por marca, modelo ou placa…"]')
    .clear()
    .then(($input) => {
      if (term) {
        cy.wrap($input).type(term);
      }
    });
}

export function createIncidentViaUi(incident: TestIncident) {
  cy.contains("button", "Novo incidente").click();

  if ((incident.type ?? "multa") === "sinistro") {
    cy.contains("button", "sinistro").click();
  }

  cy.get("#vehicleId").clear().type(incident.vehicleSearch);
  if (incident.vehicleLabel) {
    cy.contains("button", incident.vehicleLabel).click({ force: true });
  }

  if (incident.status) {
    cy.get("#status").select(incident.status);
  }

  if (incident.severity) {
    cy.get("#severidade").select(incident.severity);
  }

  cy.get("#data").clear().type(incident.date ?? "2026-01-01T10:30");
  cy.get("#descricao").clear().type(incident.description);

  if ((incident.type ?? "multa") === "multa") {
    if (incident.violationCode !== undefined) {
      cy.get("#codigoInfracao").clear().type(incident.violationCode);
    }
    if (incident.value !== undefined) {
      cy.get("#valor").clear().type(incident.value);
    }
    if (incident.violationLocation !== undefined) {
      cy.get("#localInfracao").clear().type(incident.violationLocation);
    }
  } else {
    if (incident.nature !== undefined) {
      cy.get("#natureza").clear().type(incident.nature);
    }
    if (incident.location !== undefined) {
      cy.get("#local").clear().type(incident.location);
    }
  }
}

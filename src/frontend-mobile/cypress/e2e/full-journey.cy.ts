import {
  buildUser,
  buildVehicle,
  createIncidentViaUi,
  createVehicleViaUi,
  goToModule,
  goToTab,
  logoutViaTabBar,
  signUpViaUi,
} from "../support/app-helpers";

describe("Smoke autenticado (mobile web)", () => {
  it("cria conta, percorre módulos, cadastra frota/incidente e faz logout", () => {
    const user = buildUser("full-journey");
    const vehicle = buildVehicle("Jornada");
    const vehicleLabel = `${vehicle.plate} · ${vehicle.brand} ${vehicle.model}`;

    signUpViaUi(user);

    goToModule("/vehicles");
    cy.contains("Nenhum veículo cadastrado").should("be.visible");
    createVehicleViaUi(vehicle);
    cy.contains(`${vehicle.brand} ${vehicle.model}`).should("be.visible");

    goToModule("/incidents");
    createIncidentViaUi({
      vehicleLabel,
      description: `Smoke mobile ${Date.now()}`,
      violationCode: "SMK-001",
      value: "99",
      violationLocation: "Sao Paulo",
    });
    cy.contains("Incidente registrado com sucesso.", { timeout: 20000 }).should(
      "be.visible",
    );

    goToTab("Mapa");
    cy.url().should("include", "/map");

    goToModule("/account");
    cy.contains("Sua conta").should("be.visible");

    logoutViaTabBar();
    cy.url().should("include", "/login");
  });
});

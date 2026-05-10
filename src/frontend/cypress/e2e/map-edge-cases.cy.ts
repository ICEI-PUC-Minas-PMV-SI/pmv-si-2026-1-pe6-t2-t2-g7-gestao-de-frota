import {
  buildUser,
  buildVehicle,
  createVehicleViaUi,
  goToModule,
  logoutViaSidebar,
  signUpViaUi,
} from "../support/app-helpers";

describe("Mapa e bordas da jornada", () => {
  it("valida bloqueios, fallback de rota, remoção de paradas e cópia do JSON", () => {
    const user = buildUser("map-edge");
    const vehicle = buildVehicle("Mapa Edge");

    signUpViaUi(user);
    cy.intercept("GET", "**/vehicle").as("loadVehicles");
    cy.intercept("GET", "https://router.project-osrm.org/**", {
      statusCode: 503,
      body: { code: "NoRoute" },
    }).as("osrmRouteFallback");

    goToModule("/map");
    cy.get("select").should("be.disabled");
    cy.contains("Carregando veículos...", { timeout: 15000 }).should(
      "be.visible",
    );
    cy.wait("@loadVehicles");
    cy.contains("button", "Iniciar jornada").should("be.disabled");

    goToModule("/vehicles");
    createVehicleViaUi(vehicle);

    cy.window().then((win) => {
      const writeText = cy.stub().resolves();
      Object.defineProperty(win.navigator, "clipboard", {
        configurable: true,
        value: { writeText },
      });
      cy.wrap(writeText).as("clipboardWrite");
    });

    goToModule("/map");
    cy.get("select").should("not.be.disabled");
    cy.contains("button", "Iniciar jornada").should("be.disabled");

    cy.contains("Cliques adicionam paradas").click();
    cy.get(".leaflet-container", { timeout: 20000 }).click(220, 200, {
      force: true,
    });
    cy.contains("Paradas (0)").should("be.visible");
    cy.contains("Cliques adicionam paradas").click();

    cy.get(".leaflet-container").click(240, 220, { force: true });
    cy.contains("Paradas (1)").should("be.visible");
    cy.get('button[aria-label="Remover parada 1"]').click();
    cy.contains("Paradas (0)").should("be.visible");

    cy.get(".leaflet-container").click(260, 220, { force: true });
    cy.get(".leaflet-container").click(520, 360, { force: true });
    cy.contains("Paradas (2)").should("be.visible");
    cy.wait("@osrmRouteFallback");
    cy.contains("Linha reta (OSRM indisponível)", { timeout: 15000 }).should(
      "be.visible",
    );

    cy.contains("button", "Copiar rota (JSON)").click();
    cy.get("@clipboardWrite").should("have.been.called");

    cy.contains("button", "Limpar tudo").click();
    cy.contains("Paradas (0)").should("be.visible");
    cy.contains("button", "Iniciar jornada").should("be.disabled");
  });

  it("garante veículo disponível e conclui uma jornada no mapa", () => {
    const user = buildUser("map-journey");
    const vehicle = buildVehicle("Mapa Jornada");
    const journeyName = `Jornada Cypress ${Date.now()}`;
    const vehicleLabel = `${vehicle.brand} ${vehicle.model} · ${vehicle.plate}`;

    signUpViaUi(user);
    cy.intercept("GET", "https://router.project-osrm.org/**", {
      statusCode: 503,
      body: { code: "NoRoute" },
    }).as("osrmRoute");

    goToModule("/vehicles");
    createVehicleViaUi(vehicle);

    goToModule("/map");
    cy.contains("Nova jornada").should("be.visible");
    cy.get('input[placeholder="Ex.: Entrega região sul — manhã"]').type(
      journeyName,
    );
    cy.get("select").select(vehicleLabel);

    cy.get(".leaflet-container", { timeout: 20000 }).should("be.visible");
    cy.get(".leaflet-container").click(260, 220, { force: true });
    cy.get(".leaflet-container").click(520, 360, { force: true });
    cy.contains("Paradas (2)").should("be.visible");
    cy.wait("@osrmRoute");

    cy.contains("button", "Iniciar jornada").click();
    cy.contains("Jornada iniciada em", { timeout: 20000 }).should("be.visible");
    cy.contains("Simulação concluída", { timeout: 90000 }).should("be.visible");

    goToModule("/vehicles");
    cy.get('input[placeholder="Buscar por marca, modelo ou placa…"]')
      .clear()
      .type(vehicle.model);
    cy.contains(`${vehicle.brand} ${vehicle.model}`)
      .parents("article")
      .within(() => {
        cy.get(`button[aria-label="Remover ${vehicle.brand} ${vehicle.model}"]`).click({
          force: true,
        });
      });
    cy.get('[role="dialog"]').contains("button", "Remover").click({ force: true });
    cy.contains("Veículo removido com sucesso.", { timeout: 15000 }).should(
      "be.visible",
    );

    logoutViaSidebar();
  });
});

import {
  addMapStops,
  assertVehicleHasCompletedJourney,
  buildUser,
  buildVehicle,
  createVehicleViaUi,
  goToModule,
  signUpViaUi,
  startMapJourney,
  stubGeolocation,
  waitForMapJourneyCompletion,
} from "../support/app-helpers";

describe("Jornada no mapa (mobile web)", () => {
  it("marca paradas, inicia viagem e conclui com sucesso", () => {
    const user = buildUser("map-journey");
    const vehicle = buildVehicle("Mapa Jornada");
    const vehicleLabel = `${vehicle.brand} ${vehicle.model} - ${vehicle.plate}`;

    cy.intercept("GET", "https://router.project-osrm.org/**", {
      statusCode: 503,
      body: { code: "NoRoute" },
    }).as("osrmRoute");
    cy.intercept("POST", "**/journey").as("createJourney");
    cy.intercept("PATCH", "**/journey/*/complete").as("completeJourney");

    signUpViaUi(user);

    goToModule("/vehicles");
    createVehicleViaUi(vehicle);

    stubGeolocation();
    goToModule("/map");

    cy.contains("Operação em campo", { timeout: 20000 }).should("exist");
    cy.get(".leaflet-container", { timeout: 25000 }).should("be.visible");

    addMapStops(2);

    cy.contains(vehicleLabel).should("exist");
    cy.wait("@osrmRoute");
    cy.contains("OSRM indisponível").should("exist");

    startMapJourney();
    cy.wait("@createJourney").its("response.statusCode").should("be.oneOf", [200, 201]);

    cy.contains("Em andamento", { timeout: 20000 }).should("exist");
    cy.contains("button", "Encerrar jornada").should("exist");

    waitForMapJourneyCompletion();
    cy.wait("@completeJourney").its("response.statusCode").should("be.oneOf", [200, 204]);

    assertVehicleHasCompletedJourney(`${vehicle.brand} ${vehicle.model}`);
  });
});

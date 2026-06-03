import {
  buildUser,
  buildVehicle,
  createIncidentViaUi,
  createVehicleViaUi,
  fillInput,
  goToModule,
  signUpViaUi,
  waitForIncidentFormSheet,
} from "../support/app-helpers";

describe("Gestão de incidentes (mobile)", () => {
  it("cadastra incidente vinculado a veículo e edita descrição", () => {
    const user = buildUser("incidents-mobile");
    const vehicle = buildVehicle("Incidente Mobile");
    const vehicleLabel = `${vehicle.plate} · ${vehicle.brand} ${vehicle.model}`;
    const initialDescription = `Incidente mobile ${Date.now()}`;
    const updatedDescription = `${initialDescription} editado`;

    signUpViaUi(user);
    goToModule("/vehicles");
    createVehicleViaUi(vehicle);

    goToModule("/incidents");
    createIncidentViaUi({
      vehicleLabel,
      description: initialDescription,
      violationCode: "MOB-001",
      value: "180",
      violationLocation: "Belo Horizonte",
      severity: "alta",
    });

    cy.contains("Incidente registrado com sucesso.", { timeout: 20000 }).should(
      "be.visible",
    );

    cy.get("#incident-search").clear().type(initialDescription);
    cy.contains(initialDescription).should("be.visible");
    cy.get('[aria-label="Editar incidente"]', { timeout: 15000 })
      .first()
      .click({ force: true });
    waitForIncidentFormSheet("edit");
    fillInput("#incident-descricao", updatedDescription, { clear: true });
    cy.contains("button", "Salvar alterações").click();
    cy.contains("Incidente atualizado com sucesso.", { timeout: 20000 }).should(
      "be.visible",
    );

    cy.get("#incident-search").clear().type(updatedDescription);
    cy.contains(updatedDescription).should("be.visible");
  });
});

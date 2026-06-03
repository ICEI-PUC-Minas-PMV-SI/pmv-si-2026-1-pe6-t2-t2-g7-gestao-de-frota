import {
  buildUser,
  buildVehicle,
  createVehicleViaUi,
  fillInput,
  goToModule,
  signUpViaUi,
} from "../support/app-helpers";

describe("Gestão de veículos (mobile)", () => {
  it("cadastra veículo e edita pelo card da frota", () => {
    const user = buildUser("vehicles-mobile");
    const vehicle = buildVehicle("Frota Mobile");
    const updatedModel = `${vehicle.model} Atualizado`;

    signUpViaUi(user);
    goToModule("/vehicles");

    createVehicleViaUi(vehicle);

    cy.contains(`${vehicle.brand} ${vehicle.model}`).should("be.visible");
    cy.contains("button", "Editar").click();

    cy.get("#vehicle-modelo", { timeout: 15000 }).should("be.visible");
    fillInput("#vehicle-modelo", updatedModel, { clear: true });
    cy.contains("button", "Salvar alterações").click();
    cy.contains("Veículo atualizado com sucesso.", { timeout: 20000 }).should(
      "be.visible",
    );
    cy.contains(`${vehicle.brand} ${updatedModel}`).should("be.visible");

    cy.contains("button", "Exibir").click();
    cy.contains("Dados cadastrados", { timeout: 15000 }).should("be.visible");
    cy.contains(updatedModel).should("be.visible");
  });
});

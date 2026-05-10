import {
  buildUser,
  buildVehicle,
  createVehicleViaUi,
  goToModule,
  searchVehicle,
  signUpViaUi,
} from "../support/app-helpers";

describe("Gestão avançada de veículos", () => {
  it("edita, busca e abre telemetria do catálogo", () => {
    const user = buildUser("vehicles-management");
    const vehicle = buildVehicle("Frota 1");
    const editedVehicle = vehicle;
    const updatedModel = `${editedVehicle.model} Atualizado`;

    signUpViaUi(user);
    goToModule("/vehicles");

    createVehicleViaUi(vehicle);

    searchVehicle(editedVehicle.model);
    cy.contains(`${editedVehicle.brand} ${editedVehicle.model}`)
      .parents("article")
      .within(() => {
        cy.get(`button[aria-label="Editar ${editedVehicle.brand} ${editedVehicle.model}"]`).click();
      });

    cy.get('[data-slot="sheet-content"]', { timeout: 15000 }).should("be.visible");
    cy.get("#vehicle-modelo").clear().type(updatedModel);
    cy.contains("button", "Salvar alterações").click();
    cy.contains("Veículo atualizado com sucesso.", { timeout: 15000 }).should(
      "be.visible",
    );
    cy.contains(`${editedVehicle.brand} ${updatedModel}`).should("be.visible");

    searchVehicle(updatedModel);
    cy.contains(`${editedVehicle.brand} ${updatedModel}`)
      .parents("article")
      .within(() => {
        cy.contains("button", "Telemetria").click();
      });

    cy.get('[data-slot="dialog-content"]', { timeout: 15000 }).should(
      "be.visible",
    );
    cy.contains('[data-slot="dialog-content"]', "Telemetria").should(
      "be.visible",
    );
    cy.contains('[data-slot="dialog-content"] button', "Histórico de viagens")
      .click({ force: true });
    cy.contains('[data-slot="dialog-content"]', "Nenhuma viagem encontrada", {
      timeout: 15000,
    }).should("be.visible");
    cy.contains('[data-slot="dialog-content"] button', "Telemetria").click({
      force: true,
    });
    cy.contains('[data-slot="dialog-content"]', "Status").should("be.visible");
    cy.contains('[data-slot="dialog-content"]', "Sem registros").should(
      "be.visible",
    );
  });
});

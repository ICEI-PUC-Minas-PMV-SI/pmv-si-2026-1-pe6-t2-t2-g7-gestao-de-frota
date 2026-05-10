import {
  buildUser,
  buildVehicle,
  createIncidentViaUi,
  createVehicleViaUi,
  goToModule,
  searchVehicle,
  signUpViaUi,
} from "../support/app-helpers";

describe("Gestão avançada de incidentes", () => {
  it("valida detalhes, edição, filtros, status e seleção inválida de veículo", () => {
    const user = buildUser("incidents-management");
    const vehicle = buildVehicle("Incidente");
    const vehicleLabel = `${vehicle.brand} ${vehicle.model} · ${vehicle.plate}`;
    const initialDescription = `Incidente inicial ${Date.now()}`;
    const updatedDescription = `${initialDescription} atualizado`;

    signUpViaUi(user);
    goToModule("/vehicles");
    createVehicleViaUi(vehicle);

    cy.intercept("GET", "**/incident").as("loadIncidents");
    goToModule("/incidents");
    createIncidentViaUi({
      vehicleSearch: vehicle.plate,
      vehicleLabel,
      description: initialDescription,
      violationCode: "E2E-INC-001",
      value: "180",
      violationLocation: "Campinas",
      severity: "alta",
    });
    cy.contains("button", "Criar incidente").click();
    cy.contains("Incidente criado com sucesso.", { timeout: 15000 }).should(
      "be.visible",
    );
    cy.wait("@loadIncidents");
    cy.get('input[placeholder="Buscar por descrição, placa, código…"]')
      .clear()
      .type(initialDescription);

    cy.contains("tr", initialDescription).within(() => {
      cy.get('button[aria-label="Ações do incidente"]').click({ force: true });
    });
    cy.contains('[role="menuitem"]', "Ver detalhes").click({ force: true });
    cy.contains("Detalhes do incidente").should("be.visible");
    cy.contains(vehicle.plate).should("be.visible");
    cy.contains("Código infração").should("be.visible");
    cy.contains("Editar").click();

    cy.get("#descricao").clear().type(updatedDescription);
    cy.get("#severidade").select("critica");
    cy.contains("button", "Salvar alterações").click();
    cy.contains("Incidente atualizado com sucesso.", { timeout: 15000 }).should(
      "be.visible",
    );
    cy.wait("@loadIncidents");
    cy.get('input[placeholder="Buscar por descrição, placa, código…"]')
      .clear()
      .type(updatedDescription);
    cy.contains("td", updatedDescription).should("exist");

    cy.contains("tr", updatedDescription).within(() => {
      cy.get("select").select("resolvido");
    });
    cy.contains("Status atualizado com sucesso.", { timeout: 15000 }).should(
      "be.visible",
    );
    cy.wait("@loadIncidents");

    cy.contains("button", "Novo incidente").click();
    cy.get("#vehicleId").type("NAO-EXISTE");
    cy.get("#descricao").type("Incidente sem veículo válido");
    cy.get("#data").type("2026-01-02T11:00");
    cy.contains("button", "Criar incidente").click();
    cy.contains("Selecione um veículo válido na lista.").should("be.visible");
    cy.contains("button", "Cancelar").click();

    cy.contains("button", "Resolvido").click();
    cy.contains("button", "Crítica").click();
    cy.get('input[placeholder="Buscar por descrição, placa, código…"]')
      .clear()
      .type(updatedDescription);
    cy.contains("td", updatedDescription).should("exist");

    cy.contains("tr", updatedDescription).within(() => {
      cy.get('button[aria-label="Ações do incidente"]').click({ force: true });
    });
    cy.contains('[role="menuitem"]', "Remover").click({ force: true });
    cy.get('[role="dialog"]').contains("button", "Remover").click({ force: true });
    cy.contains("Incidente removido com sucesso.", { timeout: 15000 }).should(
      "be.visible",
    );
    cy.wait("@loadIncidents");

    goToModule("/vehicles");
    searchVehicle(vehicle.model);
    cy.contains(`${vehicle.brand} ${vehicle.model}`)
      .parents("article")
      .within(() => {
        cy.get(`button[aria-label="Remover ${vehicle.brand} ${vehicle.model}"]`).click();
      });
    cy.get('[role="dialog"]').contains("button", "Remover").click({ force: true });
    cy.contains("Veículo removido com sucesso.", { timeout: 15000 }).should(
      "be.visible",
    );
  });
});

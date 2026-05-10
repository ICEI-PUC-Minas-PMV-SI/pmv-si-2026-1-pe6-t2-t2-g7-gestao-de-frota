import { buildUser, goToModule, signUpViaUi } from "../support/app-helpers";

describe("Homepage e dashboard", () => {
  it("valida atalhos da homepage e estados vazios do dashboard", () => {
    const user = buildUser("dashboard-home");

    signUpViaUi(user);

    cy.contains("Atalhos").should("be.visible");
    cy.contains("a", "Dashboard").click();
    cy.url({ timeout: 20000 }).should("include", "/dashboard");

    cy.contains("Painel da frota").should("be.visible");
    cy.contains("Incidentes recentes").should("be.visible");
    cy.contains("Snapshot da frota").should("be.visible");
    cy.contains("Distribuição por status").should("be.visible");
    cy.contains("a", "Ver todos")
      .first()
      .should("have.attr", "href", "/incidents");
    cy.contains("a", "Ver veículos").should("have.attr", "href", "/vehicles");

    cy.contains("a", "Ver veículos").click();
    cy.url().should("include", "/vehicles");

    goToModule("/homepage");
    cy.contains("a", "Página pública")
      .should("have.attr", "href", "/");
  });
});

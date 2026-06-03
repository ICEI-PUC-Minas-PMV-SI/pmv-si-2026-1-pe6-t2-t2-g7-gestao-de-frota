import { buildUser, goToModule, goToTab, signUpViaUi } from "../support/app-helpers";

describe("Painel e navegação por tabs", () => {
  it("cadastra usuário e percorre as abas principais", () => {
    const user = buildUser("dashboard-nav");

    signUpViaUi(user);

    cy.contains("Painel da frota").should("be.visible");
    cy.contains("Visão analítica").should("be.visible");
    cy.contains("Suas últimas 3 jornadas").should("exist");

    goToTab("Frota");
    cy.url().should("include", "/vehicles");
    cy.contains("Sua frota pessoal").should("be.visible");

    goToTab("Mapa");
    cy.url().should("include", "/map");

    goToTab("Incidentes");
    cy.url().should("include", "/incidents");
    cy.contains("Multas e sinistros").should("exist");

    goToTab("Conta");
    cy.url().should("include", "/account");
    cy.contains("Sua conta").should("be.visible");

    goToModule("/dashboard");
    cy.contains("Painel da frota").should("be.visible");
  });
});

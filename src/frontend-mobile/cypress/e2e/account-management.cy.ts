import { buildUser, goToModule, logoutViaTabBar, signUpViaUi } from "../support/app-helpers";

describe("Conta (mobile)", () => {
  it("atualiza nome e faz logout", () => {
    const user = buildUser("account-mobile");
    const updatedName = `${user.displayName} Atualizado`;

    signUpViaUi(user);
    goToModule("/account");

    cy.contains("button", "Editar nome").click();
    cy.get("#account-name", { timeout: 15000 })
      .should("be.visible")
      .clear()
      .type(updatedName);
    cy.contains("button", "Salvar alterações").click();
    cy.contains("Perfil atualizado.", { timeout: 20000 }).should("be.visible");
    cy.contains(updatedName, { timeout: 15000 }).should("exist");

    logoutViaTabBar();
    cy.contains("Entrar").should("be.visible");
  });
});

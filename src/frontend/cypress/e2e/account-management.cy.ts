import { buildUser, goToModule, signUpViaUi } from "../support/app-helpers";

describe("Minha conta", () => {
  it("atualiza perfil, descarta alterações, copia identificadores e faz logout", () => {
    const user = buildUser("account-management");
    const updatedName = `${user.displayName} Atualizado`;

    signUpViaUi(user);

    cy.window().then((win) => {
      const writeText = cy.stub().resolves();
      Object.defineProperty(win.navigator, "clipboard", {
        configurable: true,
        value: { writeText },
      });
      cy.wrap(writeText).as("clipboardWrite");
    });

    goToModule("/account");
    cy.get("#account-name")
      .should("have.value", user.displayName)
      .clear()
      .should("have.value", "")
      .type(updatedName)
      .should("have.value", updatedName);
    cy.contains("button", "Salvar alterações").click();
    cy.contains("Perfil atualizado com sucesso.", { timeout: 15000 }).should(
      "be.visible",
    );
    cy.get("#account-name").should("have.value", updatedName);

    cy.get("#account-name")
      .clear()
      .should("have.value", "")
      .type("Nome temporario");
    cy.contains("button", "Descartar").click();
    cy.get("#account-name").should("have.value", updatedName);

    cy.get('button[aria-label="Mostrar"]').click();
    cy.get('button[aria-label="Ocultar"]').should("be.visible");
    cy.get('button[aria-label="Copiar"]').last().click();
    cy.get("@clipboardWrite").should("have.been.called");

    cy.contains("button", "Sair da conta").click();
    cy.url({ timeout: 20000 }).should("include", "/login");
  });
});

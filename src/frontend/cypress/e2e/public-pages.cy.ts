describe("Páginas públicas", () => {
  it("abre home e navega para login", () => {
    cy.visit("/");
    cy.contains("Plataforma inteligente para gestão de frotas").should("be.visible");
    cy.contains("button", "Acessar painel").click();
    cy.url().should("include", "/login");
    cy.contains("Entrar").should("be.visible");
    cy.get("#login-email").should("be.visible");
    cy.get("#login-password").should("be.visible");
  });

  it("abre signup diretamente e valida formulário", () => {
    cy.visit("/signup");
    cy.url().should("include", "/signup");
    cy.get("form").should("exist");
  });
});

describe("Páginas públicas (mobile web)", () => {
  it("redireciona visitante para login", () => {
    cy.visit("/");
    cy.url({ timeout: 20000 }).should("include", "/login");
    cy.contains("Entrar").should("be.visible");
    cy.get("#login-email").should("be.visible");
    cy.get("#login-password").should("be.visible");
  });

  it("abre signup e valida formulário", () => {
    cy.visit("/signup");
    cy.url().should("include", "/signup");
    cy.get("#signup-name").should("be.visible");
    cy.get("#signup-email").should("be.visible");
    cy.get("#signup-password").should("be.visible");
    cy.get("#signup-password-confirm").should("be.visible");
    cy.contains("Criar conta").should("be.visible");
  });

  it("navega de login para signup", () => {
    cy.visit("/login");
    cy.contains("Criar conta").click();
    cy.url().should("include", "/signup");
  });
});

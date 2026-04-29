describe("Paginas publicas", () => {
  it("abre home e navega para login", () => {
    cy.visit("/");
    cy.contains("Plataforma inteligente para gestao de frotas").should("be.visible");
    cy.contains("button", "Acessar painel").click();
    cy.url().should("include", "/login");
    cy.contains("Unitech").should("be.visible");
  });

  it("abre signup diretamente e valida formulario", () => {
    cy.visit("/signup");
    cy.url().should("include", "/signup");
    cy.get("form").should("exist");
  });
});

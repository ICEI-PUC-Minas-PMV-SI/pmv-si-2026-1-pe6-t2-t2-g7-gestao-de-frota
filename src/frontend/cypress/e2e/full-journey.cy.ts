describe("Smoke da aplicacao autenticada", () => {
  it("cria conta, navega pelos modulos principais e faz logout", () => {
    const randomAlphaNumeric = `${Date.now().toString(36)}${Math.random()
      .toString(36)
      .slice(2, 10)}`;
    const email = `teste-${randomAlphaNumeric}@gmail.com`;
    const password = "teste123";
    const displayName = "Teste Cypress";

    cy.visit("/signup");
    cy.contains("Criar conta").should("be.visible");

    cy.get("#signup-name").clear().type(displayName).should("have.value", displayName);
    cy.get("#signup-email").clear().type(email).should("have.value", email);
    cy.get("#signup-password").clear().type(password);
    cy.get("#signup-password-confirm").clear().type(password);
    cy.contains("button", "Criar conta").click();

    cy.url({ timeout: 20000 }).should("include", "/homepage");
    cy.contains("Área logada").should("be.visible");

    cy.get('aside button[aria-label="Sair da conta"]').click();
    cy.url({ timeout: 20000 }).should("include", "/login");

    cy.get("#login-email").clear().type(email);
    cy.get("#login-password").clear().type(password);
    cy.contains("button", "Entrar com e-mail").click();

    cy.url({ timeout: 20000 }).should("include", "/homepage");
    cy.contains("Atalhos").should("be.visible");

    cy.get('aside a[href="/dashboard"]').click();
    cy.url().should("include", "/dashboard");
    cy.contains("Painel da frota").should("be.visible");

    cy.get('aside a[href="/map"]').click();
    cy.url().should("include", "/map");
    cy.contains("Mapa").should("be.visible");

    cy.get('aside a[href="/vehicles"]').click();
    cy.url().should("include", "/vehicles");
    cy.contains("Gestão de veículos").should("be.visible");

    cy.visit("/incidents");
    cy.url().should("include", "/incidents");
    cy.contains("Incidentes").should("be.visible");

    cy.visit("/members");
    cy.url().should("include", "/members");
    cy.contains("Membros da operação").should("be.visible");

    cy.visit("/account");
    cy.url().should("include", "/account");
    cy.contains("Minha conta").should("be.visible");

    cy.get('aside button[aria-label*="Ativar modo"]').click();
    cy.get("div.dark").should("exist");
    cy.get('aside button[aria-label*="Ativar modo"]').click();
    cy.get("div.dark").should("not.exist");

    cy.get('aside button[aria-label="Sair da conta"]').click();
    cy.url({ timeout: 20000 }).should("include", "/login");
  });
});

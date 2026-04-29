describe("Validacao e CRUD de veiculo", () => {
  it("cria usuario, valida placa invalida, corrige e conclui criacao/exclusao de veiculo", () => {
    const randomAlphaNumeric = `${Date.now().toString(36)}${Math.random()
      .toString(36)
      .slice(2, 10)}`;
    const email = `teste-${randomAlphaNumeric}@gmail.com`;
    const password = "teste123";
    const displayName = "Teste Cypress";

    const vehicleBrand = "Cypress";
    const vehicleModel = `Veiculo ${randomAlphaNumeric}`;
    const invalidPlate = "123";
    const randomDigit = Math.floor(Math.random() * 10);
    const randomLetter = String.fromCharCode(
      65 + Math.floor(Math.random() * 26),
    );
    const randomTail = String(Math.floor(Math.random() * 90) + 10);
    const validPlate = `CYP${randomDigit}${randomLetter}${randomTail}`;

    cy.visit("/signup");
    cy.get("#signup-name").clear().type(displayName).should("have.value", displayName);
    cy.get("#signup-email").clear().type(email).should("have.value", email);
    cy.get("#signup-name").should("have.value", displayName);
    cy.get("#signup-password").clear().type(password);
    cy.get("#signup-password-confirm").clear().type(password);
    cy.contains("button", "Criar conta").click();

    cy.url({ timeout: 20000 }).should("include", "/homepage");
    cy.get('aside button[aria-label="Sair da conta"]').click();
    cy.url({ timeout: 20000 }).should("include", "/login");

    cy.get("#login-email").clear().type(email);
    cy.get("#login-password").clear().type(password);
    cy.contains("button", "Entrar com e-mail").click();
    cy.url({ timeout: 20000 }).should("include", "/homepage");

    cy.get('aside a[href="/vehicles"]').click();
    cy.url().should("include", "/vehicles");
    cy.intercept("POST", "**/vehicle").as("createVehicle");
    cy.contains("button", "Novo veículo").click();

    cy.get("#vehicle-marca").type(vehicleBrand);
    cy.get("#vehicle-modelo").type(vehicleModel);
    cy.get("#vehicle-ano").type("2024");
    cy.get("#vehicle-placa").type(invalidPlate);
    cy.get("#vehicle-tamanhoTanque").type("50");
    cy.get("#vehicle-consumoMedio").type("11.8");
    cy.get("#vehicle-fotoUrl").type(
      "https://upload.wikimedia.org/wikipedia/commons/8/82/Dummies.jpg",
    );
    cy.contains("button", "Cadastrar veículo").click();
    cy.wait("@createVehicle")
      .its("response.statusCode")
      .should("eq", 400);

    cy.get("#vehicle-placa").clear().type(validPlate);
    cy.contains("button", "Cadastrar veículo").click();
    cy.wait("@createVehicle")
      .its("response.statusCode")
      .should("be.oneOf", [200, 201]);
    cy.contains("Veículo criado com sucesso.", { timeout: 15000 }).should(
      "be.visible",
    );

    cy.get('input[placeholder="Buscar por marca, modelo ou placa…"]')
      .clear()
      .type(vehicleModel);
    cy.contains(`${vehicleBrand} ${vehicleModel}`).should("be.visible");

    cy.contains(`${vehicleBrand} ${vehicleModel}`)
      .parents("article")
      .within(() => {
        cy.get('button[aria-label^="Remover"]').click({ force: true });
      });
    cy.get('[role="dialog"]').contains("button", "Remover").click({ force: true });
    cy.contains("Veículo removido com sucesso.", { timeout: 15000 }).should(
      "be.visible",
    );

    cy.get('aside button[aria-label="Sair da conta"]').click();
    cy.url({ timeout: 20000 }).should("include", "/login");
  });
});

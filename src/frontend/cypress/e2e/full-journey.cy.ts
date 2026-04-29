describe("Jornada completa da aplicacao", () => {
  it("cria conta, percorre modulos, cria/remove veiculo e incidente, alterna tema e faz logout", () => {
    const randomAlphaNumeric = `${Date.now().toString(36)}${Math.random()
      .toString(36)
      .slice(2, 10)}`;
    const email = `teste-${randomAlphaNumeric}@gmail.com`;
    const password = "teste123";
    const displayName = "Teste Cypress";

    const vehicleBrand = "Cypress";
    const vehicleModel = `Dummy ${randomAlphaNumeric}`;
    const randomLetter = String.fromCharCode(
      65 + Math.floor(Math.random() * 26),
    );
    const randomDigit = Math.floor(Math.random() * 10);
    const randomTail = String(Math.floor(Math.random() * 90) + 10);
    const vehiclePlate = `CYP${randomDigit}${randomLetter}${randomTail}`;
    const incidentDescription = `Incidente E2E ${randomAlphaNumeric}`;

    cy.visit("/signup");
    cy.contains("Criar conta").should("be.visible");

    cy.get('input[placeholder="Seu nome completo"]').type(displayName);
    cy.get('input[placeholder="voce@exemplo.com"]').type(email);
    cy.get('input[placeholder="Mínimo 6 caracteres"]').type(password);
    cy.get('input[placeholder="••••••••"]').first().type(password);
    cy.contains("button", "Criar conta").click();

    cy.url({ timeout: 20000 }).should("include", "/homepage");
    cy.contains("Área logada").should("be.visible");

    cy.get('aside button[aria-label="Sair da conta"]').click();
    cy.url({ timeout: 20000 }).should("include", "/login");

    cy.get('input[placeholder="voce@exemplo.com"]').type(email);
    cy.get('input[placeholder="••••••••"]').type(password);
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

    cy.contains("button", "Novo veículo").click();
    cy.get("#vehicle-marca").type(vehicleBrand);
    cy.get("#vehicle-modelo").type(vehicleModel);
    cy.get("#vehicle-ano").type("2024");
    cy.get("#vehicle-placa").type(vehiclePlate);
    cy.get("#vehicle-tamanhoTanque").type("55");
    cy.get("#vehicle-consumoMedio").type("12.5");
    cy.get("#vehicle-fotoUrl").type(
      "https://upload.wikimedia.org/wikipedia/commons/8/82/Dummies.jpg",
    );
    cy.contains("button", "Cadastrar veículo").click();

    cy.contains("Veículo criado com sucesso.", { timeout: 15000 }).should(
      "be.visible",
    );
    cy.get('input[placeholder="Buscar por marca, modelo ou placa…"]').type(
      vehicleModel,
    );
    cy.contains(`${vehicleBrand} ${vehicleModel}`).should("be.visible");

    cy.get('aside a[href="/incidents"]').click();
    cy.url().should("include", "/incidents");
    cy.contains("Incidentes").should("be.visible");

    cy.contains("button", "Novo incidente").click();
    cy.get("#vehicleId").type(vehiclePlate);
    cy.contains("button", `${vehicleBrand} ${vehicleModel} · ${vehiclePlate}`).click({
      force: true,
    });
    cy.get("#data").type("2026-01-01T10:30");
    cy.get("#descricao").type(incidentDescription);
    cy.get("#codigoInfracao").type("E2E-001");
    cy.get("#valor").type("120");
    cy.get("#localInfracao").type("Belo Horizonte");
    cy.contains("button", "Criar incidente").click();

    cy.contains("Incidente criado com sucesso.", { timeout: 15000 }).should(
      "be.visible",
    );
    cy.contains("td", incidentDescription).should("exist");

    cy.contains("tr", incidentDescription).within(() => {
      cy.get('button[aria-label="Ações do incidente"]').click({ force: true });
    });
    cy.contains('[role="menuitem"]', "Remover").click({ force: true });
    cy.get('[role="dialog"]').contains("button", "Remover").click({ force: true });
    cy.contains("Incidente removido com sucesso.", { timeout: 15000 }).should(
      "be.visible",
    );
    cy.get('input[placeholder="Buscar por descrição, placa, código…"]')
      .clear()
      .type(incidentDescription);
    cy.contains("Nenhum incidente encontrado com esses filtros").should(
      "be.visible",
    );

    cy.get('aside a[href="/members"]').click();
    cy.url().should("include", "/members");
    cy.contains("Membros da operação").should("be.visible");

    cy.get('aside a[href="/account"]').click();
    cy.url().should("include", "/account");
    cy.contains("Minha conta").should("be.visible");

    cy.get('aside button[aria-label*="Ativar modo"]').click();
    cy.get("div.dark").should("exist");
    cy.get('aside button[aria-label*="Ativar modo"]').click();
    cy.get("div.dark").should("not.exist");

    cy.get('aside a[href="/vehicles"]').click();
    cy.get('input[placeholder="Buscar por marca, modelo ou placa…"]').clear().type(
      vehicleModel,
    );
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

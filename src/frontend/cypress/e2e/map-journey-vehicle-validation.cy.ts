describe("Jornada de mapa", () => {
  it("cria usuario, garante veiculo disponivel e conclui jornada no mapa", () => {
    const randomAlphaNumeric = `${Date.now().toString(36)}${Math.random()
      .toString(36)
      .slice(2, 10)}`;
    const email = `teste-${randomAlphaNumeric}@gmail.com`;
    const password = "teste123";
    const displayName = "Teste Cypress";

    const vehicleBrand = "Cypress";
    const vehicleModel = `Mapa ${randomAlphaNumeric}`;
    const randomDigit = Math.floor(Math.random() * 10);
    const randomLetter = String.fromCharCode(
      65 + Math.floor(Math.random() * 26),
    );
    const randomTail = String(Math.floor(Math.random() * 90) + 10);
    const validPlate = `CYP${randomDigit}${randomLetter}${randomTail}`;
    let selectedVehicleLabel = "";
    let createdVehicleByTest = false;

    cy.visit("/signup");
    cy.get('input[type="text"]')
      .first()
      .clear()
      .type(displayName)
      .should("have.value", displayName);
    cy.get('input[placeholder="voce@exemplo.com"]').type(email);
    cy.get('input[placeholder="Mínimo 6 caracteres"]').type(password);
    cy.get('input[placeholder="••••••••"]').first().type(password);
    cy.contains("button", "Criar conta").click();

    cy.url({ timeout: 20000 }).should("include", "/homepage");
    cy.get('aside button[aria-label="Sair da conta"]').click();
    cy.url({ timeout: 20000 }).should("include", "/login");

    cy.get('input[placeholder="voce@exemplo.com"]').type(email);
    cy.get('input[placeholder="••••••••"]').type(password);
    cy.contains("button", "Entrar com e-mail").click();
    cy.url({ timeout: 20000 }).should("include", "/homepage");

    // Mapa: se nao houver veiculo, cria um antes de iniciar a jornada
    cy.intercept("GET", "https://router.project-osrm.org/**", {
      statusCode: 503,
      body: { code: "NoRoute" },
    }).as("osrmRoute");

    cy.get('aside a[href="/map"]').click();
    cy.url().should("include", "/map");
    cy.contains("Nova jornada").should("be.visible");

    cy.get("select").then(($select) => {
      const selected = $select.find("option:selected").text().trim();
      const hasVehicle =
        selected.length > 0 &&
        !selected.includes("Nenhum veículo disponível") &&
        !selected.includes("Carregando veículos...");

      if (hasVehicle) {
        selectedVehicleLabel = selected;
        return;
      }

      createdVehicleByTest = true;
      selectedVehicleLabel = `${vehicleBrand} ${vehicleModel} · ${validPlate}`;

      cy.get('aside a[href="/vehicles"]').click();
      cy.url().should("include", "/vehicles");
      cy.intercept("POST", "**/vehicle").as("createVehicle");
      cy.contains("button", "Novo veículo").click();

      cy.get("#vehicle-marca").type(vehicleBrand);
      cy.get("#vehicle-modelo").type(vehicleModel);
      cy.get("#vehicle-ano").type("2024");
      cy.get("#vehicle-placa").type(validPlate);
      cy.get("#vehicle-tamanhoTanque").type("50");
      cy.get("#vehicle-consumoMedio").type("11.8");
      cy.get("#vehicle-fotoUrl").type(
        "https://upload.wikimedia.org/wikipedia/commons/8/82/Dummies.jpg",
      );
      cy.contains("button", "Cadastrar veículo").click();
      cy.wait("@createVehicle")
        .its("response.statusCode")
        .should("be.oneOf", [200, 201]);
      cy.contains("Veículo criado com sucesso.", { timeout: 15000 }).should(
        "be.visible",
      );

      cy.get('aside a[href="/map"]').click();
      cy.url().should("include", "/map");
      cy.contains("Nova jornada").should("be.visible");
    });

    cy.get('input[placeholder="Ex.: Entrega região sul — manhã"]').type(
      `Jornada Cypress ${randomAlphaNumeric}`,
    );
    cy.get("select", { timeout: 20000 }).then(($select) => {
      const options = Array.from($select.find("option"));
      const validOption = options.find((opt) => {
        const text = opt.textContent?.trim() ?? "";
        return (
          text.length > 0 &&
          !text.includes("Carregando veículos...") &&
          !text.includes("Nenhum veículo disponível")
        );
      });

      const optionToSelect = selectedVehicleLabel || validOption?.textContent?.trim() || "";
      expect(optionToSelect).to.not.equal("");

      cy.wrap($select).select(optionToSelect);
    });

    cy.get(".leaflet-container", { timeout: 20000 }).should("be.visible");
    cy.get(".leaflet-container").click(260, 220, { force: true });
    cy.get(".leaflet-container").click(520, 360, { force: true });
    cy.contains("Paradas (2)").should("be.visible");

    cy.contains("button", "Iniciar jornada").click();
    cy.contains("Jornada iniciada em", { timeout: 20000 }).should("be.visible");
    cy.contains("Simulação concluída", { timeout: 90000 }).should("be.visible");

    // Exclui veiculo somente se ele foi criado por este teste
    cy.then(() => {
      if (!createdVehicleByTest) return;

      cy.get('aside a[href="/vehicles"]').click();
      cy.get('input[placeholder="Buscar por marca, modelo ou placa…"]')
        .clear()
        .type(vehicleModel);
      cy.contains(`${vehicleBrand} ${vehicleModel}`)
        .parents("article")
        .within(() => {
          cy.get('button[aria-label^="Remover"]').click({ force: true });
        });
      cy.get('[role="dialog"]')
        .contains("button", "Remover")
        .click({ force: true });
      cy.contains("Veículo removido com sucesso.", { timeout: 15000 }).should(
        "be.visible",
      );
    });

    cy.get('aside button[aria-label="Sair da conta"]').click();
    cy.url({ timeout: 20000 }).should("include", "/login");
  });
});

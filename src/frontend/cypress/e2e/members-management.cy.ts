import {
  buildUser,
  goToModule,
  signUpViaUi,
} from "../support/app-helpers";

describe("Gestão de membros", () => {
  it("lista membros, permite busca e bloqueia alterações no próprio usuário sem papel admin", () => {
    const primaryUser = buildUser("members-primary");

    signUpViaUi(primaryUser);

    goToModule("/members");
    cy.contains("Membros da operação").should("be.visible");

    cy.contains("tr", primaryUser.email).within(() => {
      cy.contains("Você").should("be.visible");
      cy.get('button[aria-label^="Ações para"]').should("be.disabled");
    });

    cy.get('input[placeholder="Buscar por nome, e-mail ou UID…"]')
      .clear()
      .type(primaryUser.email);
    cy.contains("tr", primaryUser.email).should("be.visible");
  });
});

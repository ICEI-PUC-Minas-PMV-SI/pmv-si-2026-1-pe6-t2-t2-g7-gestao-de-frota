import {
  buildUser,
  logoutViaSidebar,
  signUpViaUi,
} from "../support/app-helpers";

describe("Autenticacao e rotas protegidas", () => {
  it("bloqueia cadastro com confirmacao de senha divergente", () => {
    const user = buildUser("signup-mismatch");

    cy.visit("/signup");
    cy.get("#signup-name").type(user.displayName);
    cy.get("#signup-email").type(user.email);
    cy.get("#signup-password").type(user.password);
    cy.get("#signup-password-confirm").type(`${user.password}x`);
    cy.contains("As senhas não coincidem.").should("be.visible");
    cy.contains("button", "Criar conta").click();
    cy.url().should("include", "/signup");
  });

  it("exibe erro para senha incorreta no login", () => {
    const user = buildUser("login-invalido");

    signUpViaUi(user);
    logoutViaSidebar();

    cy.visit("/login");
    cy.get("#login-email").type(user.email);
    cy.get("#login-password").type("senha-errada");
    cy.contains("button", "Entrar com e-mail").click();
    cy.contains("Senha incorreta.", { timeout: 20000 }).should("be.visible");
    cy.url().should("include", "/login");
  });

  it("redireciona usuario deslogado ao tentar acessar area protegida", () => {
    cy.visit("/vehicles");
    cy.url({ timeout: 20000 }).should("include", "/login");
    cy.contains("Entrar").should("be.visible");
  });

  it("exibe erro ao tentar cadastrar e-mail ja existente", () => {
    const user = buildUser("signup-duplicado");

    signUpViaUi(user);
    logoutViaSidebar();

    cy.visit("/signup");
    cy.get("#signup-name").type(user.displayName);
    cy.get("#signup-email").type(user.email);
    cy.get("#signup-password").type(user.password);
    cy.get("#signup-password-confirm").type(user.password);
    cy.contains("button", "Criar conta").click();
    cy.contains("Este e-mail já está em uso.", { timeout: 20000 }).should(
      "be.visible",
    );
  });
});

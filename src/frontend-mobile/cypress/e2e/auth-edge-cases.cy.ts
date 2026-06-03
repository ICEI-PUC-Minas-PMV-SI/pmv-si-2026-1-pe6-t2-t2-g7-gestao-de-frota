import { buildUser, fillInput, logoutViaTabBar, signUpViaUi } from "../support/app-helpers";

describe("Autenticação mobile", () => {
  it("bloqueia cadastro com confirmação de senha divergente", () => {
    const user = buildUser("signup-mismatch");

    cy.visit("/signup");
    fillInput("#signup-name", user.displayName);
    fillInput("#signup-email", user.email);
    fillInput("#signup-password", user.password);
    fillInput("#signup-password-confirm", `${user.password}x`);
    cy.contains("As senhas não coincidem.").should("be.visible");
    cy.contains("button", "Criar conta").click();
    cy.url().should("include", "/signup");
  });

  it("exibe erro para senha incorreta no login", () => {
    const user = buildUser("login-invalido");

    signUpViaUi(user);
    logoutViaTabBar();

    cy.visit("/login");
    fillInput("#login-email", user.email);
    fillInput("#login-password", "senha-errada");
    cy.contains("button", "Entrar com e-mail").click();
    cy.url({ timeout: 20000 }).should("include", "/login");
    cy.contains("Entrar").should("be.visible");
  });

  it("redireciona usuário deslogado ao acessar área protegida", () => {
    cy.visit("/vehicles");
    cy.url({ timeout: 20000 }).should("include", "/login");
    cy.contains("Entrar").should("be.visible");
  });
});

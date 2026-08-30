type Role = "RETAILER" | "DISPATCHER" | "RIDER";

declare global {
  namespace Cypress {
    interface Chainable {
      loginAs(role: Role, overrides?: Partial<{ id: string; name: string; email: string }>): Chainable<void>;
    }
  }
}

Cypress.Commands.add("loginAs", (role: Role, overrides = {}) => {
  const user = {
    id: overrides.id ?? `${role.toLowerCase()}-1`,
    name: overrides.name ?? `Test ${role.charAt(0)}${role.slice(1).toLowerCase()}`,
    email: overrides.email ?? `${role.toLowerCase()}@reflex.demo`,
    role,
  };

  cy.intercept("POST", "**/api/auth/login", {
    statusCode: 200,
    body: { token: "fake.jwt.token", user },
  }).as("login");
  // The SSE connection just needs to not error; no named events needed
  // for most specs.
  cy.intercept("GET", "**/api/events*", { statusCode: 200, body: "" });

  cy.visit("/login");
  cy.get('input[name="email"]').type(user.email);
  cy.get('input[name="password"]').type("Password123!");
  cy.contains("button", "Sign in").click();
  cy.wait("@login");
});

export {};

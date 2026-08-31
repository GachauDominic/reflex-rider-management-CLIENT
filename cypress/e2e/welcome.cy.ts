describe("welcome page", () => {
  it("shows the public welcome page to an unauthenticated visitor", () => {
    cy.visit("/");

    cy.url().should("eq", `${Cypress.config().baseUrl}/`);
    cy.contains("Know exactly where every delivery stands").should("be.visible");
    cy.contains("a", "Sign in to Reflex").should("have.attr", "href", "/login");
  });

  it("redirects an already-authenticated visitor straight to their deliveries", () => {
    cy.loginAs("RETAILER");
    cy.intercept("GET", "**/api/deliveries*", { statusCode: 200, body: [] });

    cy.visit("/");

    cy.url().should("include", "/deliveries");
    cy.url().should("not.eq", `${Cypress.config().baseUrl}/`);
  });

  it("lets an unauthenticated visitor reach the login page from the welcome page", () => {
    cy.visit("/");
    cy.contains("a", "Sign in to Reflex").click();
    cy.url().should("include", "/login");
  });
});

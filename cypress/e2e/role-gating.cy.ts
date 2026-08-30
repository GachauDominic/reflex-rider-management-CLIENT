describe("role-based route access", () => {
  it("redirects a RIDER away from the RETAILER-only new-delivery route", () => {
    cy.loginAs("RIDER");
    cy.intercept("GET", "**/api/deliveries*", { statusCode: 200, body: [] });

    cy.visit("/deliveries/new");

    cy.url().should("include", "/deliveries");
    cy.url().should("not.include", "/new");
  });

  it("redirects a RETAILER away from the DISPATCHER-only riders route", () => {
    cy.loginAs("RETAILER");
    cy.intercept("GET", "**/api/deliveries*", { statusCode: 200, body: [] });

    cy.visit("/riders");

    cy.url().should("include", "/deliveries");
    cy.url().should("not.include", "/riders");
  });

  it("lets a DISPATCHER reach both the riders page and the deliveries list", () => {
    cy.loginAs("DISPATCHER");
    cy.intercept("GET", "**/api/deliveries*", { statusCode: 200, body: [] });
    cy.intercept("GET", "**/api/riders", { statusCode: 200, body: [] }).as("listRiders");

    cy.visit("/riders");
    cy.wait("@listRiders");
    cy.url().should("include", "/riders");
    cy.contains("Riders").should("be.visible");
  });

  it("sends an unauthenticated visitor to /login", () => {
    cy.visit("/deliveries");
    cy.url().should("include", "/login");
  });
});

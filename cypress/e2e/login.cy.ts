describe("login", () => {
  it("logs a retailer in and lands on their deliveries list", () => {
    cy.intercept("POST", "**/api/auth/login", {
      statusCode: 200,
      body: {
        token: "fake.jwt.token",
        user: { id: "user-1", name: "Jane Retailer", email: "retailer@reflex.demo", role: "RETAILER" },
      },
    }).as("login");
    cy.intercept("GET", "**/api/deliveries*", { statusCode: 200, body: [] }).as("listDeliveries");
    // The SSE connection just needs to not throw; a plain 200 with no
    // named events is enough for this spec's purposes.
    cy.intercept("GET", "**/api/events*", { statusCode: 200, body: "" });

    cy.visit("/login");
    cy.get('input[name="email"]').type("retailer@reflex.demo");
    cy.get('input[name="password"]').type("Password123!");
    cy.contains("button", "Sign in").click();

    cy.wait("@login");
    cy.url().should("include", "/deliveries");
    cy.contains("My deliveries").should("be.visible");
  });

  it("shows the backend's error message on invalid credentials", () => {
    cy.intercept("POST", "**/api/auth/login", {
      statusCode: 401,
      body: { error: "Invalid email or password" },
    }).as("login");

    cy.visit("/login");
    cy.get('input[name="email"]').type("nobody@reflex.demo");
    cy.get('input[name="password"]').type("wrong");
    cy.contains("button", "Sign in").click();

    cy.wait("@login");
    cy.contains("Invalid email or password").should("be.visible");
    cy.url().should("include", "/login");
  });
});

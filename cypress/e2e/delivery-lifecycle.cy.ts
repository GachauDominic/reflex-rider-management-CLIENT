describe("delivery lifecycle", () => {
  it("lets a RETAILER create a new delivery and land on its detail page", () => {
    cy.loginAs("RETAILER");
    cy.intercept("GET", "**/api/deliveries*", { statusCode: 200, body: [] });

    const created = {
      id: "delivery-1",
      retailerId: "retailer-1",
      riderId: null,
      customerName: "Jane Wanjiku",
      customerPhone: "0712345678",
      address: "Westlands, Nairobi",
      itemDescription: "Samsung 55 inch TV",
      status: "OPEN",
      confirmationCode: "REF-DEL-A1B2C3D4-X8K2",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deliveredAt: null,
    };
    cy.intercept("POST", "**/api/deliveries", { statusCode: 201, body: created }).as("createDelivery");
    cy.intercept("GET", `**/api/deliveries/${created.id}`, {
      statusCode: 200,
      body: { ...created, events: [{ id: "evt-1", deliveryId: created.id, actorId: "retailer-1", status: "OPEN", note: null, timestamp: created.createdAt }] },
    });

    cy.visit("/deliveries/new");
    cy.get('input[name="customerName"]').type(created.customerName);
    cy.get('input[name="customerPhone"]').type(created.customerPhone);
    cy.get('textarea[name="address"]').type(created.address);
    cy.get('textarea[name="itemDescription"]').type(created.itemDescription);
    cy.contains("button", "Create delivery").click();

    cy.wait("@createDelivery");
    cy.url().should("include", `/deliveries/${created.id}`);
    cy.contains(created.customerName).should("be.visible");
    cy.contains(created.confirmationCode).should("be.visible");
  });

  it("rejects an invalid Kenyan phone number before ever calling the API", () => {
    cy.loginAs("RETAILER");
    cy.intercept("GET", "**/api/deliveries*", { statusCode: 200, body: [] });
    cy.intercept("POST", "**/api/deliveries").as("createDelivery");

    cy.visit("/deliveries/new");
    cy.get('input[name="customerName"]').type("Jane Wanjiku");
    cy.get('input[name="customerPhone"]').type("12345"); // not a valid Kenyan number
    cy.get('textarea[name="address"]').type("Westlands, Nairobi");
    cy.get('textarea[name="itemDescription"]').type("TV");
    cy.contains("button", "Create delivery").click();

    cy.contains("valid Kenyan phone number").should("be.visible");
    cy.get("@createDelivery.all").should("have.length", 0);
  });

  it("lets a RIDER confirm an in-transit delivery via the manual code fallback", () => {
    cy.loginAs("RIDER", { id: "rider-1" });

    const delivery = {
      id: "delivery-2",
      retailerId: "retailer-1",
      riderId: "rider-1",
      customerName: "Amina Hassan",
      customerPhone: "0798765432",
      address: "Kilimani, Nairobi",
      itemDescription: "Blood pressure monitor",
      status: "IN_TRANSIT",
      confirmationCode: "REF-DEL-9F8E7D6C-B4A1",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deliveredAt: null,
    };
    cy.intercept("GET", "**/api/deliveries*", { statusCode: 200, body: [delivery] });
    cy.intercept("GET", `**/api/deliveries/${delivery.id}`, {
      statusCode: 200,
      body: { ...delivery, events: [] },
    });
    cy.intercept("POST", `**/api/deliveries/${delivery.id}/confirm`, {
      statusCode: 200,
      body: { ...delivery, status: "DELIVERED", deliveredAt: new Date().toISOString() },
    }).as("confirmDelivery");

    cy.visit(`/deliveries/${delivery.id}`);
    cy.contains("button", "Confirm delivery").click();

    // Scoped to .modal-box from here on — once the modal is open, the
    // DeliveryActions trigger button (also labeled "Confirm delivery")
    // is still present underneath it, so an unscoped cy.contains() here
    // would be ambiguous between the two.
    cy.get(".modal-box").within(() => {
      // Skip the camera path entirely — this is the fallback the
      // QrScanner component exists to guarantee, and it's the only path
      // that's realistically automatable in CI.
      cy.contains("button", "Enter code manually instead").click();
      cy.get('input[placeholder="REF-DEL-XXXXXXXX-XXXX"]').type(delivery.confirmationCode);
      cy.contains("button", "Confirm delivery").click();
    });

    cy.wait("@confirmDelivery")
      .its("request.body")
      .should("deep.equal", { confirmationCode: delivery.confirmationCode });
  });
});

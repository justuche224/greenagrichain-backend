import request from "supertest";
import { db } from "../../lib/db.mjs";
import app from "../../index.mjs";

jest.mock("../../lib/db.mjs");

describe("POST /api/deposit", () => {
  it("should create a deposit successfully", async () => {
    // Mock database responses
    const mockUser = { id: "user123", name: "John Doe" };
    const mockDeposit = {
      id: "deposit123",
      userId: "user123",
      walletAddress: "abc123",
      amount: 100,
      currency: "BTC",
      status: "pending",
    };

    db.user.findUnique.mockResolvedValue(mockUser);
    db.deposit.create.mockResolvedValue(mockDeposit);

    const response = await request(app)
      .post("/api/deposit")
      .send({
        userId: "user123",
        walletAddress: "abc123",
        amount: 100,
        currency: "BTC",
      });

    expect(response.status).toBe(201);
    expect(response.body.message).toBe(
      "Deposit created successfully. Balance will be updated when the admin verifies it."
    );
    expect(response.body.deposit).toEqual(mockDeposit);
  });

  it("should return 400 if any field is missing", async () => {
    const response = await request(app)
      .post("/api/deposit")
      .send({
        userId: "user123",
        walletAddress: "abc123",
        currency: "BTC",
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("All fields are required.");
  });

  it("should return 400 if amount is less than or equal to 0", async () => {
    const response = await request(app)
      .post("/api/deposit")
      .send({
        userId: "user123",
        walletAddress: "abc123",
        amount: 0,
        currency: "BTC",
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Amount must be greater than 0.");
  });

  it("should return 400 if the user does not exist", async () => {
    db.user.findUnique.mockResolvedValue(null);

    const response = await request(app)
      .post("/api/deposit")
      .send({
        userId: "user123",
        walletAddress: "abc123",
        amount: 100,
        currency: "BTC",
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Invalid user");
  });
});

describe("GET /api/deposits with userId filter", () => {
  it("should fetch deposits for a specific user", async () => {
    const mockDeposits = [
      { id: "deposit1", userId: "user123", amount: 100, status: "pending", user: { name: "John" } },
    ];

    db.deposit.findMany.mockResolvedValue(mockDeposits);

    const response = await request(app).get("/api/deposits?userId=user123");

    expect(response.status).toBe(200);
    expect(response.body.deposits).toEqual(mockDeposits);
  });
});

describe("PUT /api/deposit/:id/status with admin validation", () => {
  it("should return 403 if the admin role is invalid", async () => {
    // Mock getUserById to return a non-admin user
    getUserById.mockResolvedValue({ id: "user123", role: "user" });

    const response = await request(app)
      .put("/api/deposit/deposit123/status")
      .send({ status: "verified", adminId: "user123" });

    expect(response.status).toBe(403);
    expect(response.body.message).toBe("Unauthorized");
  });

  it("should allow admin to update deposit status", async () => {
    const mockAdmin = { id: "admin123", role: "admin" };
    const mockDeposit = { id: "deposit123", userId: "user123", amount: 100, status: "pending" };
    const mockUpdatedDeposit = { ...mockDeposit, status: "verified" };

    getUserById.mockResolvedValue(mockAdmin);
    db.deposit.findUnique.mockResolvedValue(mockDeposit);
    db.deposit.update.mockResolvedValue(mockUpdatedDeposit);

    const response = await request(app)
      .put("/api/deposit/deposit123/status")
      .send({ status: "verified", adminId: "admin123" });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Deposit status updated successfully");
    expect(response.body.deposit).toEqual(mockUpdatedDeposit);
  });
});
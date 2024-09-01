import { Router } from "express";
import { db } from "../lib/db.mjs";
import { getUserById } from "../lib/user.mjs";

const router = Router();

router.post("/api/deposit", async (req, res) => {
  const { userId, walletAddress, amount, currency } = req.body;
  console.log(req.body);

  try {
    if (!userId || !walletAddress || !amount || !currency) {
      return res.status(400).json({ message: "All fields are required." });
    }

    if (amount <= 0) {
      return res
        .status(400)
        .json({ message: "Amount must be greater than 0." });
    }

    // make the amount a valid float
    const floatAmount = parseFloat(amount);
    console.log("float amount", floatAmount);

    const existingUser = await db.user.findUnique({
      where: { id: userId },
    });
    console.log(existingUser);

    if (!existingUser) {
      return res.status(400).json({ message: "Invalid user" });
    }

    const newDeposit = await db.deposit.create({
      data: {
        userId,
        walletAddress,
        amount: floatAmount,
        currency,
        status: "pending",
      },
    });
    console.log(newDeposit);

    return res.status(201).json({
      message:
        "Deposit created successfully. Balance will be updated when the admin verifies it.",
      deposit: newDeposit,
    });
  } catch (error) {
    console.error("Error creating deposit:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Get deposits with optional status filtering
router.get("/api/deposits", async (req, res) => {
  const { status, userId } = req.query;

  try {
    const whereClause = {};
    if (status) {
      whereClause.status = status;
    }
    if (userId) {
      whereClause.userId = userId;
    }
    // Fetch deposits with the optional status filter
    const deposits = await db.deposit.findMany({
      where: whereClause,
      include: {
        user: true,
      },
    });

    return res.status(200).json({ deposits });
  } catch (error) {
    console.error("Error fetching deposits:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Admin to update the deposit status and verify the admin role securely
router.put("/api/deposit/:id/status", async (req, res) => {
  const { id } = req.params;

  const { status, adminId } = req.body; // adminId from the request

  console.log("adminId", adminId);
  console.log("status", status);

  if (!id || !status || !adminId) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    const adminUser = await getUserById(adminId); // Fetch admin user from DB

    console.log("adminUser", adminUser);

    if (!adminUser || adminUser.role !== "ADMIN") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const deposit = await db.deposit.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!deposit) {
      return res.status(404).json({ message: "Deposit not found" });
    }

    if (!["pending", "reviewing", "verified"].includes(status)) {
      return res.status(400).json({ message: "Invalid status provided" });
    }

    const updatedDeposit = await db.deposit.update({
      where: { id },
      data: {
        status,
        verifiedAt: status === "verified" ? new Date() : null,
      },
    });

    if (status === "verified") {
      await db.$transaction(async (prisma) => {
        // Check if the user already has an account balance
        let accountBalance = await db.accountBalance.findUnique({
          where: { userId: deposit.userId },
        });

        // If accountBalance does not exist, create one
        if (!accountBalance) {
          accountBalance = await db.accountBalance.create({
            data: {
              userId: deposit.userId,
              balance: 0, // Starting balance (you can adjust this if needed)
            },
          });
        }

        // Now update the balance
        await db.accountBalance.update({
          where: { userId: deposit.userId },
          data: {
            balance: { increment: deposit.amount },
          },
        });

        // Record the transaction
        await db.transaction.create({
          data: {
            balanceId: accountBalance.id,
            type: "deposit",
            amount: deposit.amount,
          },
        });
      });
    }

    return res.status(200).json({
      message: "Deposit status updated successfully",
      deposit: updatedDeposit,
    });
  } catch (error) {
    console.error("Error updating deposit status:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default router;

import { Router } from "express";
import { db } from "../lib/db.mjs";

const router = Router();

router.post("/api/deposit", async (req, res) => {
  const { userId, walletAddress, amount, currency } = req.body;

  try {
    if (!userId || !walletAddress || !amount || !currency) {
      return res.status(400).json({ message: "All fields are required." });
    }

    if (amount <= 0) {
      return res
        .status(400)
        .json({ message: "Amount must be greater than 0." });
    }

    const existingUser = await db.user.findUnique({ where: { id: userId } });

    if (!existingUser) {
      return res.status(400).json({ message: "Invalid user" });
    }

    const newDeposit = await db.deposit.create({
      data: {
        userId,
        walletAddress,
        amount,
        currency,
        status: "pending",
      },
    });

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

// Route to get deposits with optional status filtering
router.get("/api/deposits", async (req, res) => {
  const { status } = req.query;

  try {
    // Build the filtering object conditionally based on the status query
    const whereClause = status ? { status: status } : {}; // If no status provided, get all deposits

    // Fetch deposits with the optional status filter
    const deposits = await db.deposit.findMany({
      where: whereClause,
      include: {
        user: true, // Include the user details associated with the deposit
      },
    });

    return res.status(200).json({ deposits });
  } catch (error) {
    console.error("Error fetching deposits:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Route for admin to update the deposit status to verified and update user's balance
router.put("/api/deposit/:id/status", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const { user } = req.body;

  if (user.role !== "admin") {
    return res.status(403).json({ message: "Unauthorized" });
  }

  if (!id || !status) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
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
        const accountBalance = await db.accountBalance.update({
          where: { userId: deposit.userId },
          data: {
            balance: { increment: deposit.amount },
          },
        });

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

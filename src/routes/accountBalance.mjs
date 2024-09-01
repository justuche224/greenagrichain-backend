import { Router } from "express";
import { db } from "../lib/db.mjs";
import { getUserById } from "../lib/user.mjs";

const router = Router();

// Get all users' account balances
router.get("/api/account-balances", async (req, res) => {
  try {
    const accountBalances = await db.accountBalance.findMany({
      include: {
        user: {
          select: {
            firstname: true,
            lastname: true,
            email: true,
          },
        },
      },
    });

    return res.status(200).json(accountBalances);
  } catch (error) {
    console.error("Error fetching account balances:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Get a user's account balance by userId
router.get("/api/account-balance/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const accountBalance = await db.accountBalance.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            firstname: true,
            lastname: true,
            email: true,
          },
        },
      },
    });

    if (!accountBalance) {
      return res.status(404).json({ message: "Account balance not found" });
    }

    return res.status(200).json(accountBalance);
  } catch (error) {
    console.error("Error fetching user's account balance:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Update a user's account balance
router.put("/api/account-balance/:userId", async (req, res) => {
  const { userId } = req.params;
  const { balance, adminId } = req.body;

  if (typeof balance !== "number" || balance < 0) {
    return res.status(400).json({ message: "Valid balance is required." });
  }

  if (!adminId) {
    return res.status(400).json({ message: "Admin ID is required." });
  }

  const adminUser = await getUserById(adminId);

  if (!adminUser || adminUser.role !== "ADMIN") {
    return res.status(403).json({ message: "Unauthorized" });
  }

  try {
    const accountBalance = await db.accountBalance.findUnique({
      where: { userId },
    });

    if (!accountBalance) {
      return res.status(404).json({ message: "Account balance not found" });
    }

    // make the amount a valid float
    const floatBalance = parseFloat(balance);

    const updatedBalance = await db.accountBalance.update({
      where: { userId },
      data: {
        balance: floatBalance,
      },
    });

    return res.status(200).json({
      message: "Account balance updated successfully",
      accountBalance: updatedBalance,
    });
  } catch (error) {
    console.error("Error updating user's account balance:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Increment a user's account balance
router.put("/api/account-balance/:userId/increment", async (req, res) => {
  const { userId } = req.params;
  const { amount, adminId } = req.body;

  if (typeof amount !== "number" || amount <= 0) {
    return res
      .status(400)
      .json({ message: "Valid increment amount is required." });
  }

  if (!adminId) {
    return res.status(400).json({ message: "Admin ID is required." });
  }

  const adminUser = await getUserById(adminId);

  if (!adminUser || adminUser.role !== "ADMIN") {
    return res.status(403).json({ message: "Unauthorized" });
  }

  try {
    const accountBalance = await db.accountBalance.findUnique({
      where: { userId },
    });

    if (!accountBalance) {
      return res.status(404).json({ message: "Account balance not found" });
    }

    const updatedBalance = await db.accountBalance.update({
      where: { userId },
      data: {
        balance: {
          increment: amount,
        },
      },
    });

    return res.status(200).json({
      message: "Account balance incremented successfully",
      accountBalance: updatedBalance,
    });
  } catch (error) {
    console.error("Error incrementing user's account balance:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default router;

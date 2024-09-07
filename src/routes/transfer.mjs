import { Router } from "express";
import bcrypt from "bcryptjs";
import { db } from "../lib/db.mjs";
import { getUserByEmail } from "../lib/user.mjs";

const router = Router();

router.post("/api/transfer", async (req, res) => {
  const { senderEmail, password, receiverEmail, amount } = req.body;
  console.log(req.body);

  try {
    // 1. Validate the transfer amount (negative or zero amount)
    if (amount <= 0) {
      return res
        .status(400)
        .json({ message: "Transfer amount must be greater than zero" });
    }

    // 2. Check if sender and receiver are the same
    if (senderEmail === receiverEmail) {
      return res
        .status(400)
        .json({ message: "Sender and receiver cannot be the same" });
    }

    const sender = await getUserByEmail(senderEmail);
    if (!sender) {
      return res.status(400).json({ message: "Sender not found" });
    }

    const receiver = await getUserByEmail(receiverEmail);
    if (!receiver) {
      return res.status(400).json({ message: "Receiver not found" });
    }

    const passwordsMatch = await bcrypt.compare(password, sender.password);
    if (!passwordsMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    // 9. Initialize sender's account balance if not present
    let senderBalance = await db.accountBalance.findUnique({
      where: { userId: sender.id },
    });
    if (!senderBalance) {
      return res
        .status(400)
        .json({ message: "Sender's account balance is not initialized" });
    }

    // 9. Initialize receiver's account balance if not present
    let receiverBalance = await db.accountBalance.findUnique({
      where: { userId: receiver.id },
    });
    if (!receiverBalance) {
      // Create receiver's account balance if not initialized
      receiverBalance = await db.accountBalance.create({
        data: {
          userId: receiver.id,
          balance: 0,
        },
      });
    }

    // 3. Ensure precision and rounding for amount and balances
    const roundedAmount = parseFloat(amount.toFixed(2));
    const updatedSenderBalance = parseFloat(
      (senderBalance.balance - roundedAmount).toFixed(2)
    );
    const updatedReceiverBalance = parseFloat(
      (receiverBalance.balance + roundedAmount).toFixed(2)
    );

    // 5. Check if sender has sufficient balance (after possible concurrent transactions)
    if (updatedSenderBalance < 0) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    // TODO: 10. Implement max transfer limit when defined

    // Perform the transfer and transaction logging inside a database transaction
    await db.$transaction([
      // Deduct from sender's balance
      db.accountBalance.update({
        where: { userId: sender.id },
        data: {
          balance: updatedSenderBalance,
        },
      }),
      // Add to receiver's balance
      db.accountBalance.update({
        where: { userId: receiver.id },
        data: {
          balance: updatedReceiverBalance,
        },
      }),
      // Log transaction for the sender
      db.transaction.create({
        data: {
          balanceId: senderBalance.id,
          type: "transfer",
          amount: -roundedAmount,
          senderId: sender.id,
          receiverId: receiver.id,
        },
      }),
      // Log transaction for the receiver
      db.transaction.create({
        data: {
          balanceId: receiverBalance.id,
          type: "transfer",
          amount: roundedAmount,
          senderId: sender.id,
          receiverId: receiver.id,
        },
      }),
    ]);

    return res.status(200).json({ message: "Transfer successful" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "An unexpected error occurred" });
  }
});

export default router;

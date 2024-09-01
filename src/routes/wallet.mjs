import { Router } from "express";
import { db } from "../lib/db.mjs";

const router = Router();

//get wallets, with optional filtering by currency
router.get("/api/wallets", async (req, res) => {
  console.log("get wallets called");

  const { currency } = req.query;

  try {
    let wallets;

    if (currency) {
      wallets = await db.wallet.findMany({
        where: { currency },
      });
    } else {
      wallets = await db.wallet.findMany();
    }
    console.log(wallets);

    return res.status(200).json(wallets);
  } catch (error) {
    console.error("Error fetching wallets:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

//get the address of a specific currency
router.get("/api/wallets/:currency", async (req, res) => {
  const { currency } = req.params;

  try {
    const wallet = await db.wallet.findUnique({
      where: { currency },
    });

    if (!wallet) {
      return res
        .status(404)
        .json({ message: `Wallet for ${currency} not found` });
    }

    return res.status(200).json(wallet);
  } catch (error) {
    console.error("Error fetching wallet address:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// update the address of a specific currency
router.put("/api/wallets/:currency", async (req, res) => {
  const { currency } = req.params;
  const { address } = req.body;

  if (!address) {
    return res.status(400).json({ message: "Address is required." });
  }

  try {
    const updatedWallet = await db.wallet.update({
      where: { currency },
      data: { address },
    });

    return res.status(200).json({
      message: "Wallet address updated successfully",
      wallet: updatedWallet,
    });
  } catch (error) {
    console.error("Error updating wallet address:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

//add a new wallet (currency and address)
router.post("/api/wallets", async (req, res) => {
  const { currency, address } = req.body;

  if (!currency || !address) {
    return res
      .status(400)
      .json({ message: "Currency and address are required." });
  }

  console.log(currency, address);

  try {
    const newWallet = await db.wallet.create({
      data: { currency, address },
    });

    return res.status(201).json({
      message: "New wallet added successfully",
      wallet: newWallet,
    });
  } catch (error) {
    console.error("Error adding new wallet:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default router;

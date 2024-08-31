import { Router } from "express";
import { db } from "../lib/db.mjs";

const router = Router();

router.post("/api/kyc", async (req, res) => {
  const { userId, image, address, nationality, identification, gender } =
    req.body;

  const { user } = req.body;

  if (user.role !== "admin") {
    return res.status(403).json({ message: "Unauthorized" });
  }

  try {
    if (
      !userId ||
      !image ||
      !address ||
      !nationality ||
      !identification ||
      !gender
    ) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const kyc = await db.kyc.upsert({
      where: { userId },
      update: {
        status: "pending",
      },
      create: {
        userId,
        status: "pending",
      },
    });

    const updatedUser = await db.user.update({
      where: { id: userId },
      data: {
        image,
        address,
        nationality,
        identification,
        gender,
      },
    });

    return res.status(201).json({
      message: "KYC submitted successfully",
      kyc,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error submitting KYC:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/api/kyc", async (req, res) => {
  const { status, nationality, gender, userId } = req.query;

  try {
    const where = {};

    if (status) {
      where.status = status; // Filter by KYC status
    }

    if (nationality) {
      where.user = { nationality }; // Filter by user's nationality
    }

    if (gender) {
      where.user = { gender }; // Filter by user's gender
    }

    if (userId) {
      where.userId = userId; // Filter by specific userId
    }

    // Fetch KYC records with filters applied
    const kycs = await db.kyc.findMany({
      where,
      include: {
        user: true, // Include user details in the response
      },
    });

    return res.status(200).json({
      message: "KYC records fetched successfully",
      data: kycs,
    });
  } catch (error) {
    console.error("Error fetching KYC records:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.put("/api/kyc/:id/status", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    if (!["pending", "approved", "declined"].includes(status)) {
      return res.status(400).json({ message: "Invalid status provided" });
    }

    const kyc = await db.kyc.findUnique({
      where: { id },
    });

    if (!kyc) {
      return res.status(404).json({ message: "KYC record not found" });
    }

    const updatedKyc = await db.kyc.update({
      where: { id },
      data: {
        status,
        approvedAt: status === "approved" ? new Date() : null,
      },
    });

    if (status === "approved") {
      await db.user.update({
        where: { id: kyc.userId },
        data: {
          kycVerified: new Date(),
        },
      });
    }

    return res.status(200).json({
      message: "KYC status updated successfully",
      kyc: updatedKyc,
    });
  } catch (error) {
    console.error("Error updating KYC status:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default router;

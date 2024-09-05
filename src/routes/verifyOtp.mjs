import jwt from "jsonwebtoken";
import { Router } from "express";
import { getUserByEmail } from "../lib/user.mjs";
import { isOTPValid } from "../lib/otp.mjs";

const router = Router();

// OTP verification route
router.post("/api/auth/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await getUserByEmail(email);

    if (!user || !isOTPValid(user.otp, user.otpExpires, otp)) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // OTP is valid, proceed to generate JWT token
    const token = jwt.sign({ userId: user.id }, process.env.AUTH_SECRET, {
      expiresIn: "7d",
    });

    return res.status(200).json({
      message: "Login successful",
      user: user,
      token: token,
    });
  } catch (error) {
    res.status(500).json({ message: "An unexpected error occurred" });
  }
});

export default router;

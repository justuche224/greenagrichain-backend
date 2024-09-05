import { Router } from "express";
import bcrypt from "bcryptjs";
import * as z from "zod";
import rateLimit from "express-rate-limit";
import { LoginSchema } from "../lib/schemas.mjs";
import { getUserByEmail, updateUserOTP } from "../lib/user.mjs";
import { generateVerificationToken } from "../lib/tokens.mjs";
import { sendVerificationEmail, sendOTPEmail } from "../lib/mailer.mjs";
import { generateOTP } from "../lib/otp.mjs";

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per window
  message: "Too many login attempts, please try again later.",
});

const router = Router();
//loginLimiter
router.post("/api/auth/login", async (req, res) => {
  try {
    const validatedData = LoginSchema.parse(req.body);
    const { email, password } = validatedData;
    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }
    if (!user.emailVerified) {
      const verificationToken = await generateVerificationToken(user.email);
      await sendVerificationEmail(
        verificationToken.email,
        verificationToken.token,
        user.firstname
      );
      return res
        .status(200)
        .json({ message: "Check your email for a verification link!" });
    }
    const passwordsMatch = await bcrypt.compare(password, user.password);
    if (!passwordsMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // OTP expires in 10 minutes
    await updateUserOTP(user.email, otp, otpExpires);

    // Send OTP to user's email
    await sendOTPEmail(user.email, otp, user.firstname);

    return res.status(200).json({ message: "OTP sent to your email" });
  } catch (error) {
    console.log(error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: "Validation failed",
        errors: error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        })),
      });
    }
    res.status(500).json({ message: "An unexpected error occurred" });
  }
});

export default router;

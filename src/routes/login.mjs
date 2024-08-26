import { Router } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import * as z from "zod";
import rateLimit from "express-rate-limit";
import { LoginSchema } from "../lib/schemas.mjs";
import { getUserByEmail } from "../lib/user.mjs";
import { generateVerificationToken } from "../lib/tokens.mjs";
import { sendVerificationEmail } from "../lib/mailer.mjs";

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per window
  message: "Too many login attempts, please try again later.",
});

const router = Router();
//loginLimiter
router.post("/api/auth/login", async (req, res) => {
  console.log("login called");
  try {
    const validatedData = LoginSchema.parse(req.body);
    const { email, password } = validatedData;
    console.log(validatedData);
    const user = await getUserByEmail(email);
    console.log(user);
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }
    console.log(user.emailVerified);
    if (!user.emailVerified) {
      const verificationToken = await generateVerificationToken(user.email);
      await sendVerificationEmail(
        verificationToken.email,
        verificationToken.token
      );
      console.log(verificationToken);
      return res
        .status(200)
        .json({ message: "Check your email for a verification link!" });
    }
    console.log("user is verified");
    const passwordsMatch = await bcrypt.compare(password, user.password);
    if (!passwordsMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }
    const token = jwt.sign({ userId: user.id }, process.env.AUTH_SECRET, {
      expiresIn: "7d",
    });

    return res.status(200).json({
      message: "Login successful",
      user: user,
      token: token, // Send the token in the response
    });
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

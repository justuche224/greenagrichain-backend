import { Router } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import * as z from "zod";
import { LoginSchema } from "../lib/schemas.mjs";
import { getUserByEmail } from "../lib/user.mjs";
import { generateVerificationToken } from "../lib/tokens.mjs";
import { sendVerificationEmail } from "../lib/mailer.mjs";
const router = Router();
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
        verificationToken.token
      );
      return res
        .status(200)
        .json({ message: "Check your email for a verification link!" });
    }
    const passwordsMatch = await bcrypt.compare(password, user.password);
    if (!passwordsMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }
    const token = jwt.sign({ userId: user.id }, process.env.AUTH_SECRET, {
      expiresIn: "7d", // Token expiration time
    });
    return res.status(200).json({ token, message: "Login successful" });
  } catch (error) {
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

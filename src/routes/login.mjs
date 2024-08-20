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
      expiresIn: "7d", // Token expiration time
    });
    return res.status(200).json({ token, message: "Login successful" });
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

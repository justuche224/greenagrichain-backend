import { Router } from "express";
import bcrypt from "bcryptjs";
import * as z from "zod";
import { getUserByEmail } from "../lib/user.mjs";
import { db } from "../lib/db.mjs";
import { generateVerificationToken } from "../lib/tokens.mjs";
import { sendVerificationEmail } from "../lib/mailer.mjs";
import { RegisterSchema } from "../lib/schemas.mjs";
const router = Router();
router.post("/api/auth/register", async (req, res) => {
  try {
    const validatedData = RegisterSchema.parse(req.body);
    const { firstname, lastname, email, number, password, confirmPassword } =
      validatedData;
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.user.create({
      data: {
        firstname,
        lastname,
        number,
        email,
        password: hashedPassword,
      },
    });
    const verificationToken = await generateVerificationToken(email);
    await sendVerificationEmail(
      verificationToken.email,
      verificationToken.token
    );
    return res
      .status(201)
      .json(
        "Account created successfully, Check your email for verification link"
      );
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

import { Router } from "express";
import bcrypt from "bcryptjs";
import * as z from "zod";
import { getUserByEmail } from "../lib/user";
import { db } from "../lib/db";
import { generateVerificationToken } from "../lib/tokens";
import { sendVerificationEmail } from "../lib/mailer";

const router = Router();

const RegisterSchema = z.object({
  firstname: z.string().min(1, { message: "First name is required" }),
  lastname: z.string().min(1, { message: "Last name is required" }),
  email: z.string().email({ message: "Valid email is required" }),
  number: z.string().min(1, { message: "Number is required" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
  confirmPassword: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});

router.post("/api/auth/register", async (req, res) => {
  try {
    console.log(req.body);

    const validatedData = RegisterSchema.parse(req.body);

    const { firstname, lastname, email, number, password, confirmPassword } =
      validatedData;

    console.log(firstname, lastname, email, number, password, confirmPassword);

    const existingUser = await getUserByEmail(email);

    console.log(existingUser);

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    if (password !== confirmPassword) {
      res.status(400).json({ message: "Passwords do not match" });
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

    console.log(verificationToken);

    await sendVerificationEmail(
      verificationToken.email,
      verificationToken.token
    );

    res
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

import { Router } from "express";
import { ResetSchema } from "../lib/schemas.mjs";
import { getUserByEmail } from "../lib/user.mjs";
import { generatePasswordResetToken } from "../lib/tokens.mjs";
import { sendPasswordResetEmail } from "../lib/mailer.mjs";

const router = Router();
router.get("/api/auth/forgot-password", async (req, res) => {
  try {
    const validatedData = ResetSchema.parse(req.body);

    const { email } = validatedData;

    const existingUser = await getUserByEmail(email);

    if (!existingUser) {
      return res.status(400).json({ message: "User does not exist!" });
    }

    passwordResetToken = await generatePasswordResetToken(email);

    await sendPasswordResetEmail(
      passwordResetToken.email,
      passwordResetToken.token
    );

    return res
      .status(200)
      .json({ message: "Check your email for a reset link!" });
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

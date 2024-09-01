import { Router } from "express";
import { ResetSchema } from "../lib/schemas.mjs";
import { getUserByEmail } from "../lib/user.mjs";

const router = Router();
router.post("/api/auth/forgot-password", async (req, res) => {
  const { token, values } = req.body;

  if (!token) {
    return res.status(400).json({ message: "Missing" });
  }

  try {
    const validatedData = ResetSchema.parse(req.body);

    const { password } = validatedData;

    const existingToken = await getPasswordResetTokenByToken(token);

    if (!existingToken) {
      return res.status(400).json({ message: "Invalid token" });
    }

    const hasExpired = new Date(existingToken.expires) < new Date();

    if (hasExpired) {
      return res.status(400).json({ message: "Token has expired" });
    }

    const existingUser = await getUserByEmail(existingToken.email);

    if (!existingUser) {
      return res.status(400).json({ message: "Invalid token" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.user.update({
      where: { id: existingUser.id },
      data: { password: hashedPassword },
    });

    await db.passwordResetToken.delete({ where: { id: existingToken.id } });

    return res.status(200).json({ message: "Password reset successful" });
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

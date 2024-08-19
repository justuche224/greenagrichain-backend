import { Router } from "express";
import { getVerificationTokenByToken } from "../lib/verificationToken.mjs";
import { getUserByEmail } from "../lib/user.mjs";
import { db } from "../lib/db.mjs";
const router = Router();
router.post("/api/auth/verify-email", async (req, res) => {
  const token = req.query.token;
  if (!token) {
    return res.status(400).json({ message: "Token is required" });
  }
  try {
    const existingToken = await getVerificationTokenByToken(token);
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
    await db.user.update({
      where: { id: existingUser.id },
      data: { emailVerified: new Date(), email: existingToken.email },
    });
    await db.verificationToken.delete({
      where: { id: existingToken.id },
    });
    res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    res.status(500).json({ message: "An unexpected error occurred" });
  }
});
export default router;

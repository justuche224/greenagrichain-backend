import { Router } from "express";
import { blacklistedTokens } from "../lib/authenticateToken.mjs";
const router = Router();
router.post("/api/auth/logout", (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (token) {
    blacklistedTokens.add(token);
  }
  res.status(200).json({ message: "Logged out successfully" });
});
export default router;

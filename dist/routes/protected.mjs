import { Router } from "express";
import { authenticateToken } from "../lib/authenticateToken.mjs";
const router = Router();
router.get("/api/protected", authenticateToken, (req, res) => {
  res.status(200).json({ message: "You have access to this protected route!" });
});
export default router;

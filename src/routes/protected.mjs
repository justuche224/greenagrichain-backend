import { Router } from "express";
import { authenticateToken } from "../lib/authenticateToken.mjs";

const router = Router();

router.get("/api/protected", authenticateToken, (req, res) => {
  console.log("Protected route called");

  res.status(200).json({
    message: "You have access to this protected route!",
    userId: req.userId,
  });
});

export default router;

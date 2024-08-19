import { Router } from "express";
import { Request, Response } from "express";
import { blacklistedTokens } from "../lib/authenticateToken";

const router = Router();

router.post("/api/auth/logout", (req: Request, res: Response) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (token) {
    blacklistedTokens.add(token);
  }
  res.status(200).json({ message: "Logged out successfully" });
});

export default router;

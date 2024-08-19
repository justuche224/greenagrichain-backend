import { Router } from "express";
import {
  AuthenticatedRequest,
  authenticateToken,
} from "../lib/authenticateToken";

const router = Router();

router.get(
  "/api/protected",
  authenticateToken,
  (req: AuthenticatedRequest, res) => {
    res
      .status(200)
      .json({ message: "You have access to this protected route!" });
  }
);

export default router;

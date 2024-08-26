import { Router } from "express";
import { blacklistedTokens } from "../lib/authenticateToken.mjs";

const router = Router();

router.post("/api/auth/logout", (req, res) => {
  console.log("Logout called");

  const token = req.headers["authorization"]?.split(" ")[1];

  if (token) {
    // Add token to the blacklist
    blacklistedTokens.add(token);
    console.log(`Token blacklisted: ${token}`);
  } else {
    console.log("No token provided for blacklisting");
  }

  res.status(200).json({ message: "Logged out successfully" });
});

export default router;

import { Router } from "express";
import { getVerificationTokenByToken } from "../lib/verificationToken.mjs";
import { getUserByEmail } from "../lib/user.mjs";
import { db } from "../lib/db.mjs";
const router = Router();

router.get("/api/auth/verify-email", async (req, res) => {
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

    res.status(200).send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Email Verified</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            text-align: center;
            margin-top: 50px;
          }
          button {
            padding: 10px 20px;
            font-size: 16px;
            background-color: #4CAF50;
            color: white;
            border: none;
            cursor: pointer;
          }
          button:hover {
            background-color: #45a049;
          }
        </style>
      </head>
      <body>
        <h1>Email Verified Successfully!</h1>
        <p>Your email has been verified. You can now proceed to the homepage.</p>
        <button onclick="window.location.href='https://yourfrontend.com'">Go to Home</button>
      </body>
      </html>
    `);
  } catch (error) {
    res.status(500).json({ message: "An unexpected error occurred" });
  }
});

export default router;

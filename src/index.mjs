import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Routes
import registerRouter from "./routes/register.mjs";
import loginRouter from "./routes/login.mjs";
import logoutRouter from "./routes/logout.mjs";
import emailVerificationRouter from "./routes/emailVerification.mjs";
import protectedRouter from "./routes/protected.mjs";
import forgotPasswordRouter from "./routes/forgotPassword.js";

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

// Home route
app.get("/", async (req, res) => {
  res.json({ message: "Hi From Greenagrichain!" });
});

// Protected route
app.use(protectedRouter);

// Register route
app.use(registerRouter);

// Login route
app.use(loginRouter);

// Logout route
app.use(logoutRouter);

// Email verification route
app.use(emailVerificationRouter);

// Forgot password route
app.use(forgotPasswordRouter);

// Handle undefined routes
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});
// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message:
      process.env.NODE_ENV === "production"
        ? "An internal server error occurred"
        : err.message,
  });
});
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

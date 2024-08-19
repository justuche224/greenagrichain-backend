import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";

// Routes
import registerRouter from "./routes/register";
import loginRouter from "./routes/login";
import logoutRouter from "./routes/logout";
import emailVerificationRouter from "./routes/emailVerification";
import protectedRouter from "./routes/protected";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

// Home route
app.get("/", async (req: Request, res: Response) => {
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

// Handle undefined routes
app.use((req: Request, res: Response) => {
  res.status(404).json({ message: "Route not found" });
});

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
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

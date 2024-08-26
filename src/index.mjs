import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

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

const allowedOrigins = [
  "http://127.0.0.1:5500",
  "http://localhost:3000",
  "https://your-other-allowed-origin.com",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Check if the origin is in the list of allowed origins
      if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
        callback(null, true); // Allow the origin
      } else {
        callback(new Error("Not allowed by CORS")); // Deny the origin
      }
    },
    credentials: true,
  })
);
app.use(cookieParser());

app.get("/", async (req, res) => {
  res.json({ message: "Hi From Greenagrichain!" });
});

app.use(protectedRouter);

app.use(registerRouter);

app.use(loginRouter);

app.use(logoutRouter);

app.use(emailVerificationRouter);

app.use(forgotPasswordRouter);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});
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

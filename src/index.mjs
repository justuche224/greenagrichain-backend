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
import depositRouter from "./routes/deposit.mjs";
import kycRouter from "./routes/kyc.mjs";
import walletRouter from "./routes/wallet.mjs";
import usersRouter from "./routes/users.mjs";
import accountBalanceRouter from "./routes/accountBalance.mjs";
import docsRouter from "./routes/docs.mjs";
import otpRouter from "./routes/verifyOtp.mjs";
import transferRouter from "./routes/transfer.mjs";

dotenv.config();
const app = express();
const port = process.env.PORT || 5001;

app.use(express.json());

const allowedOrigins = [
  "http://127.0.0.1:5500",
  "http://localhost:3000",
  "https://greenagrichain.com",
];

app.use(cors());
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

app.use(depositRouter);

app.use(kycRouter);

app.use(walletRouter);

app.use(usersRouter);

app.use(accountBalanceRouter);

app.use(otpRouter);

app.use(transferRouter);

app.use("/api/docs", docsRouter);

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
  console.log(`Server is running on port http://localhost:${port}`);
});

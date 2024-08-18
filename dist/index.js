import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import * as z from "zod";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import nodemailer from "nodemailer";
const db = global.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") {
    global.prisma = db;
}
const getUserByEmail = async (email) => {
    try {
        const user = await db.user.findUnique({ where: { email } });
        return user;
    }
    catch (error) {
        return null;
    }
};
const getUserById = async (id) => {
    try {
        const user = await db.user.findUnique({ where: { id } });
        return user;
    }
    catch (error) {
        return null;
    }
};
const getVerificationTokenByToken = async (token) => {
    try {
        const verificationToken = await db.verificationToken.findUnique({
            where: { token },
        });
        return verificationToken;
    }
    catch (error) {
        return null;
    }
};
const getVerificationTokenByEmail = async (email) => {
    try {
        const verificationToken = await db.verificationToken.findFirst({
            where: { email },
        });
        return verificationToken;
    }
    catch (error) {
        return null;
    }
};
const generateVerificationToken = async (email) => {
    const token = uuidv4();
    const expires = new Date();
    expires.setHours(expires.getHours() + 1); // Add 1 hour
    const existingToken = await getVerificationTokenByEmail(email);
    if (existingToken) {
        await db.verificationToken.delete({ where: { id: existingToken.id } });
    }
    const verificationToken = await db.verificationToken.create({
        data: { email, token, expires },
    });
    return verificationToken;
};
const sendVerificationEmail = async (email, token) => {
    const verifyUrl = `${process.env.CLIENT_URL}/auth/new-verification?token=${token}`;
    // Create a transporter using SMTP transport
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.NODEMAILER_EMAIL,
            pass: process.env.NODEMAILER_APP_PASS,
        },
    });
    // Email data
    const mailOptions = {
        from: process.env.NODEMAILER_EMAIL,
        to: email,
        subject: "Verify your Greenagrichain account",
        text: "Please verify your email",
        html: `
          <html lang="en">
          <head>
              <meta charset="UTF-8">
              <meta http-equiv="X-UA-Compatible" content="IE=edge">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Verify your Greenagrichain account</title>
          </head>
          <body>
              <div class="container">
                  <h1>Hello ${email},</h1>
                  <p>You've registered an account on Greenagrichain. Before you can start using your account, we need to verify that this email address belongs to you.</p>
                  <p>Please click the button below to verify your account:</p>
                  <p>
                      <a href="${verifyUrl}" style="display: inline-block; background-color: #007bff; color: #fff; padding: 10px 20px; border-radius: 5px; text-decoration: none;">Verify Account</a>
                  </p>
                  <p>If you didn't create an account with us, you can safely ignore this email.</p>
                  <h3>Kind Regards,<br><a href="${process.env.CLIENT_URL}" style="color: #007bff; text-decoration: none;">Chatz</a></h3>
              </div>
          </body>
          </html>
        `,
    };
    await transporter.sendMail(mailOptions);
};
// Define zod schemas
const LoginSchema = z.object({
    email: z.string().email({ message: "Email is required" }),
    password: z.string().min(1, { message: "Password is required" }),
});
const RegisterSchema = z.object({
    firstname: z.string().min(1, { message: "First name is required" }),
    lastname: z.string().min(1, { message: "Last name is required" }),
    email: z.string().email({ message: "Valid email is required" }),
    number: z.string().min(1, { message: "Number is required" }),
    password: z
        .string()
        .min(6, { message: "Password must be at least 6 characters" }),
    confirmPassword: z
        .string()
        .min(6, { message: "Password must be at least 6 characters" }),
});
const blacklistedTokens = new Set();
const authenticateToken = (req, res, next) => {
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token || blacklistedTokens.has(token)) {
        return res
            .status(401)
            .json({ message: "Access denied, token missing or invalid" });
    }
    jwt.verify(token, process.env.AUTH_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: "Invalid or expired token" });
        }
        if (typeof decoded === "object" && "userId" in decoded) {
            req.userId = decoded.userId; // Store user ID in request object
        }
        else {
            return res.status(401).json({ message: "Invalid token" });
        }
        next();
    });
};
dotenv.config();
const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());
app.use(cors());
// Home route
app.get("/", async (req, res) => {
    res.json({ message: "Hi From Greenagrichain!" });
});
app.get("/api/protected", authenticateToken, (req, res) => {
    res.status(200).json({ message: "You have access to this protected route!" });
});
// Register route
app.post("/api/auth/register", async (req, res) => {
    try {
        const validatedData = RegisterSchema.parse(req.body);
        const { firstname, lastname, email, number, password, confirmPassword } = validatedData;
        const existingUser = await getUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }
        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.user.create({
            data: {
                firstname,
                lastname,
                number,
                email,
                password: hashedPassword,
            },
        });
        const verificationToken = await generateVerificationToken(email);
        await sendVerificationEmail(verificationToken.email, verificationToken.token);
        return res
            .status(201)
            .json("Account created successfully, Check your email for verification link");
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                message: "Validation failed",
                errors: error.errors.map((err) => ({
                    field: err.path.join("."),
                    message: err.message,
                })),
            });
        }
        res.status(500).json({ message: "An unexpected error occurred" });
    }
});
// Login route
app.post("/api/auth/login", async (req, res) => {
    try {
        const validatedData = LoginSchema.parse(req.body);
        const { email, password } = validatedData;
        const user = await getUserByEmail(email);
        if (!user) {
            return res.status(400).json({ message: "Invalid email or password" });
        }
        // if (!user.emailVerified) {
        //   const verificationToken = await generateVerificationToken(user.email);
        //   await sendVerificationEmail(
        //     verificationToken.email,
        //     verificationToken.token
        //   );
        //   return res
        //     .status(200)
        //     .json({ message: "Check your email for a verification link!" });
        // }
        const passwordsMatch = await bcrypt.compare(password, user.password);
        if (!passwordsMatch) {
            return res.status(400).json({ message: "Invalid email or password" });
        }
        const token = jwt.sign({ userId: user.id }, process.env.AUTH_SECRET, {
            expiresIn: "1h", // Token expiration time
        });
        return res.status(200).json({ token, message: "Login successful" });
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                message: "Validation failed",
                errors: error.errors.map((err) => ({
                    field: err.path.join("."),
                    message: err.message,
                })),
            });
        }
        res.status(500).json({ message: "An unexpected error occurred" });
    }
});
app.post("/api/auth/logout", (req, res) => {
    const token = req.headers["authorization"]?.split(" ")[1];
    if (token) {
        blacklistedTokens.add(token);
    }
    res.status(200).json({ message: "Logged out successfully" });
});
// Handle undefined routes
app.use((req, res) => {
    res.status(404).json({ message: "Route not found" });
});
// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: process.env.NODE_ENV === "production"
            ? "An internal server error occurred"
            : err.message,
    });
});
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import * as z from "zod";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";
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
              <style>
                  body {
                      font-family: Arial, sans-serif;
                      background-color: #f5f5f5;
                      margin: 0;
                      padding: 0;
                  }
                  .container {
                      max-width: 600px;
                      margin: 20px auto;
                      padding: 20px;
                      background-color: #fff;
                      border-radius: 5px;
                      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                  }
                  h1, h3 {
                      color: #333;
                  }
                  p {
                      color: #555;
                  }
                  a {
                      color: #007bff;
                      text-decoration: none;
                  }
                  a:hover {
                      text-decoration: underline;
                  }
              </style>
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
dotenv.config();
const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());
app.use(cors());
// Use an async IIFE to set up the auth middleware
(async () => {
    const { ExpressAuth } = await import("@auth/express");
    const Credentials = (await import("@auth/express/providers/credentials"))
        .default;
    app.use("/auth/*", ExpressAuth({
        providers: [
            Credentials({
                credentials: {
                    email: { label: "Email", type: "email" },
                    password: { label: "Password", type: "password" },
                },
                authorize: async (credentials) => {
                    let user = null;
                    const validatedFields = LoginSchema.safeParse(credentials);
                    if (!validatedFields.success) {
                        return null;
                    }
                    const { email, password } = validatedFields.data;
                    user = await getUserByEmail(email);
                    if (!user) {
                        throw new Error("User not found.");
                    }
                    if (!user.emailVerified) {
                        const verificationToken = await generateVerificationToken(user.email);
                        await sendVerificationEmail(verificationToken.email, verificationToken.token);
                        return null;
                    }
                    const passwordsMatch = await bcrypt.compare(password, user.password);
                    if (!passwordsMatch) {
                        throw new Error("Incorrect password!");
                    }
                    // return user object with the their profile data
                    const { password: _, ...userWithoutPassword } = user;
                    return userWithoutPassword;
                },
            }),
        ],
    }));
    // Home route
    app.get("/", async (req, res) => {
        res.json({ message: "Hi From Greenagrichain!" });
    });
    // Register route
    app.post("/api/auth/register", async (req, res) => {
        try {
            console.log(req.body);
            const validatedData = RegisterSchema.parse(req.body);
            const { firstname, lastname, email, number, password, confirmPassword } = validatedData;
            console.log(firstname, lastname, email, number, password, confirmPassword);
            const existingUser = await getUserByEmail(email);
            console.log(existingUser);
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
            console.log(verificationToken);
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
    // Handle undefined routes
    app.use((req, res) => {
        res.status(404).json({ message: "Route not found" });
    });
    // Error handling middleware
    app.use((err, req, res, next) => {
        console.error(err.stack);
        res.status(500).json({ message: "An internal server error occurred" });
    });
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
})();

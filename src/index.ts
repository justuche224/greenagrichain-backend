import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

app.get("/", async (req: Request, res: Response) => {
  res.json({ message: "Hi Mom!" });
});

app.get("/api/user", async (req: Request, res: Response) => {
  console.log(req);

  res.json({ name: "John Doe", age: 30, city: "New York", country: "USA" });
});

app.post("/api/auth/login", async (req: Request, res: Response) => {
  console.log(req.body);

  const name = req.body.name;
  const password = req.body.password;

  if (!name || !password) {
    return res
      .status(400)
      .json({ message: "Please provide a name and password" });
  }
  if (password !== "1234") {
    return res.status(401).json({ message: "Invalid password" });
  }
  res.json({ name: "John Doe", age: 30, city: "New York", country: "USA" });
});

// Handle undefined routes
app.use((req: Request, res: Response) => {
  res.status(404).json({ message: "Route not found" });
});

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: "An internal server error occurred" });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

import jwt from "jsonwebtoken";

export const blacklistedTokens = new Set();

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access denied, token missing" });
  }

  if (blacklistedTokens.has(token)) {
    return res.status(403).json({ message: "Token has been blacklisted" });
  }

  jwt.verify(token, process.env.AUTH_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }

    if (typeof decoded === "object" && "userId" in decoded) {
      req.userId = decoded.userId;
    } else {
      return res.status(401).json({ message: "Invalid token structure" });
    }

    next();
  });
};

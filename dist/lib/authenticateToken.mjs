import jwt from "jsonwebtoken";
export const blacklistedTokens = new Set();
export const authenticateToken = (req, res, next) => {
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

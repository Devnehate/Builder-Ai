import jwt from 'jsonwebtoken';

export function AuthMiddleware(req, res, next) { 
    const token = req.cookies.token;

    if (!token) {
        res.status(401).json({ error: "Access denied. No session token provided." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret");
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ error: "Invalid or expired token. Please sign in again." });
    }
}
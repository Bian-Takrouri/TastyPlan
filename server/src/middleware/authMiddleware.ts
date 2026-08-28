import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your_super_secret_jwt_key";

export interface AuthenticatedRequest extends Request {
    user?: any;
}

export const authenticateJWT = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    // 1. البحث عن التوكن في الـ Header (للـ APIs) أو في الـ Cookie (للـ Admin Dashboard)
    const authHeader = req.headers.authorization;
    let token: string | undefined;

    if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
    } else if (req.cookies && req.cookies.adminToken) {
        token = req.cookies.adminToken;
    }

    if (!token) {
        // إذا كان الطلب من شاشات الأدمن نعيد توجيهه للـ Login
        if (req.originalUrl.startsWith("/admin")) {
            return res.redirect("/admin/login");
        }
        return res.status(401).json({ message: "Access token missing or invalid" });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        if (req.originalUrl.startsWith("/admin")) {
            return res.redirect("/admin/login");
        }
        return res.status(403).json({ message: "Invalid or expired token" });
    }
};
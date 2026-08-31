import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET =
    process.env.JWT_SECRET || "your_super_secret_jwt_key";

export interface AuthenticatedRequest extends Request {
    user?: {
        id: number;
        email: string;
        role: "admin" | "user";
    };
}

export const authenticateJWT = (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {
    const authHeader = req.headers.authorization;

    let token: string | undefined;

    if (
        authHeader &&
        authHeader.startsWith("Bearer ")
    ) {
        token = authHeader.substring(7);
    } else if (
        req.cookies &&
        req.cookies.adminToken
    ) {
        token = req.cookies.adminToken;
    }

    if (!token) {
        if (req.originalUrl.startsWith("/admin")) {
            return res.redirect("/admin/login");
        }

        return res.status(401).json({
            success: false,
            message: "Access token missing"
        });
    }

    try {
        const decoded = jwt.verify(
            token,
            JWT_SECRET
        ) as {
            id: number;
            email: string;
            role: "admin" | "user";
        };

        req.user = decoded;

        next();

    } catch (error) {
        if (req.originalUrl.startsWith("/admin")) {
            return res.redirect("/admin/login");
        }

        return res.status(403).json({
            success: false,
            message: "Invalid or expired token"
        });
    }
};
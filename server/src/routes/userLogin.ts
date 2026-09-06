import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { AppDataSource } from "../data-source.js";
import { User } from "../entities/User.js";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "your_super_secret_jwt_key";

router.get("/login", (req: Request, res: Response) => {
    if (req.cookies?.userToken) {
        try {
            jwt.verify(req.cookies.userToken, JWT_SECRET);
            return res.redirect("http://localhost:5173/");
        } catch {
            res.clearCookie("userToken");
        }
    }

    res.render("login", {
        layout: false,
        error: null
    });
});

router.post("/login", async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.render("login", {
                layout: false,
                error: "Email and password are required."
            });
        }

        const userRepository = AppDataSource.getRepository(User);
        const user = await userRepository.findOne({
            where: { email }
        });

        if (!user) {
            return res.render("login", {
                layout: false,
                error: "Invalid email or password."
            });
        }

        const passwordMatch = await bcrypt.compare(
            password,
            user.passwordHash
        );

        if (!passwordMatch) {
            return res.render("login", {
                layout: false,
                error: "Invalid email or password."
            });
        }

        if (user.role !== "user") {
            return res.render("login", {
                layout: false,
                error: "Please use the admin login page."
            });
        }

        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                role: user.role
            },
            JWT_SECRET,
            {
                expiresIn: "7d"
            }
        );

        res.cookie("userToken", token, {
            httpOnly: true,
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.redirect("http://localhost:5173/");
    } catch (error) {
        console.error("User login error:", error);

        return res.render("login", {
            layout: false,
            error: "An unexpected error occurred. Please try again."
        });
    }
});

router.get("/logout", (_req: Request, res: Response) => {
    res.clearCookie("userToken");
    res.redirect("/login");
});

export default router;
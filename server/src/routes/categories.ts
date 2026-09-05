import { Router } from "express";
import { Category } from "../entities/Category.js";

const router = Router();

router.get("/", async (_req, res) => {
    try {
        const categories = await Category.find();

        res.json({
            success: true,
            data: categories
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch categories"
        });
    }
});

export default router;
import { Router } from "express";
import { AppDataSource } from "../data-source.js";
import { Category } from "../entities/Category.js";

const router = Router();

router.get("/", async (_req, res) => {
    try {
        const categoryRepository = AppDataSource.getRepository(Category);
        const categories = await categoryRepository.find();

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
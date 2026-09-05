import { Router } from "express";
import { Recipe } from "../entities/Recipe.js";

const router = Router();

router.get("/", async (_req, res) => {
    try {
        const recipes = await Recipe.find()
            .populate("categoryId")
            .populate("originId");


        res.json({
            success: true,
            data: recipes
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch recipes"
        });
    }
});

export default router;
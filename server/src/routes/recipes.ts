import { Router } from "express";
import { AppDataSource } from "../data-source.js";
import { Recipe } from "../entities/Recipe.js";

const router = Router();

router.get("/", async (_req, res) => {
    try {
        const recipeRepository = AppDataSource.getRepository(Recipe);

        const recipes = await recipeRepository.find({
            relations: {
                category: true,
                origin: true,
                ingredients: true
            }
        });

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
import { Router } from "express";
import { AppDataSource } from "../data-source.js";
import { Recipe } from "../entities/Recipe.js";
import { Category } from "../entities/Category.js";
import { Origin } from "../entities/Origin.js";
import { RecipeIngredient } from "../entities/RecipeIngredient.js";

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

router.post("/", async (req, res) => {
    try {
        const {
            mealId,
            name,
            categoryId,
            originId,
            instructions,
            imageUrl,
            ingredients
        } = req.body;

        const recipeRepository = AppDataSource.getRepository(Recipe);
        const categoryRepository = AppDataSource.getRepository(Category);
        const originRepository = AppDataSource.getRepository(Origin);
        const ingredientRepository =AppDataSource.getRepository(RecipeIngredient);

        const category = categoryId? await categoryRepository.findOneBy({ id: categoryId }): null;
        const origin = originId ? await originRepository.findOneBy({ id: originId }): null;
        if (categoryId && !category) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }
        if (originId && !origin) {
            return res.status(404).json({
                success: false,
                message: "Origin not found"
            });
        }
        const recipe = recipeRepository.create({
            mealId,
            name,
            category,
            origin,
            instructions,
            imageUrl
        });

        const savedRecipe = await recipeRepository.save(recipe);
        if (ingredients && Array.isArray(ingredients)) {

            const recipeIngredients = ingredients.map((item: {
                ingredient: string;
                measure?: string; }) =>
                ingredientRepository.create({
                    recipe: savedRecipe,
                    ingredient: item.ingredient,
                    measure: item.measure ?? null
                })
            );
            await ingredientRepository.save(recipeIngredients);
        }
        res.status(201).json({
            success: true,
            data: savedRecipe
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to create recipe"
        });
    }
});
router.put("/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);
        const {
            mealId,
            name,
            categoryId,
            originId,
            instructions,
            imageUrl,
            ingredients
        } = req.body;
        const recipeRepository = AppDataSource.getRepository(Recipe);
        const categoryRepository = AppDataSource.getRepository(Category);
        const originRepository = AppDataSource.getRepository(Origin);
        const ingredientRepository =AppDataSource.getRepository(RecipeIngredient);
        const recipe = await recipeRepository.findOneBy({ id });

        if (!recipe) {
            return res.status(404).json({
                success: false,
                message: "Recipe not found"
            });
        }
        const category = categoryId ? await categoryRepository.findOneBy({ id: categoryId }): null;
        const origin = originId ? await originRepository.findOneBy({ id: originId }) : null;

        if (categoryId && !category) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }
        if (originId && !origin) {
            return res.status(404).json({
                success: false,
                message: "Origin not found"
            });
        }
        recipe.mealId = mealId;
        recipe.name = name;
        recipe.category = category;
        recipe.origin = origin;
        recipe.instructions = instructions;
        recipe.imageUrl = imageUrl;

        const updatedRecipe = await recipeRepository.save(recipe);
        await ingredientRepository.delete({recipe: { id }});
        if (ingredients && Array.isArray(ingredients)) {
            const recipeIngredients = ingredients.map((item: {
                ingredient: string;
                measure?: string; }) =>
                ingredientRepository.create({
                    recipe: updatedRecipe,
                    ingredient: item.ingredient,
                    measure: item.measure ?? null
                })
            );
            await ingredientRepository.save(recipeIngredients);
        }
        res.json({
            success: true,
            data: updatedRecipe
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to update recipe"
        });
    }
});
router.delete("/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);
        const recipeRepository = AppDataSource.getRepository(Recipe);
        const recipe = await recipeRepository.findOneBy({ id });
        if (!recipe) {
            return res.status(404).json({
                success: false,
                message: "Recipe not found"
            });
        }
        await recipeRepository.remove(recipe);
        res.json({
            success: true,
            message: "Recipe deleted successfully"
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to delete recipe"
        });
    }
});
export default router;
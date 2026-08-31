import { Router } from "express";

import { AppDataSource } from "../data-source.js";

import { Recipe } from "../entities/Recipe.js";
import { Category } from "../entities/Category.js";
import { Origin } from "../entities/Origin.js";
import { RecipeIngredient } from "../entities/RecipeIngredient.js";

const router = Router();

/* =====================================================
   GET ALL RECIPES
===================================================== */

router.get("/", async (_req, res) => {
    try {
        const recipeRepository =
            AppDataSource.getRepository(Recipe);

        const recipes =
            await recipeRepository.find({
                relations: {
                    category: true,
                    origin: true,
                    ingredients: true
                }
            });

        return res.json({
            success: true,
            data: recipes
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch recipes"
        });
    }
});

/* =====================================================
   CREATE RECIPE
===================================================== */

router.post("/", async (req, res) => {
    try {
        const {
            mealId,
            name,
            categoryId,
            originId,
            instructions,
            imageUrl,
            youtubeUrl,
            sourceUrl,
            ingredients
        } = req.body;

        if (!mealId || !name) {
            return res.status(400).json({
                success: false,
                message: "mealId and name are required"
            });
        }

        const recipeRepository =
            AppDataSource.getRepository(Recipe);

        const categoryRepository =
            AppDataSource.getRepository(Category);

        const originRepository =
            AppDataSource.getRepository(Origin);

        const ingredientRepository =
            AppDataSource.getRepository(
                RecipeIngredient
            );

        const parsedCategoryId =
            categoryId
                ? Number(categoryId)
                : null;

        const parsedOriginId =
            originId
                ? Number(originId)
                : null;

        const category =
            parsedCategoryId
                ? await categoryRepository.findOneBy({
                    id: parsedCategoryId
                })
                : null;

        const origin =
            parsedOriginId
                ? await originRepository.findOneBy({
                    id: parsedOriginId
                })
                : null;

        if (parsedCategoryId && !category) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }

        if (parsedOriginId && !origin) {
            return res.status(404).json({
                success: false,
                message: "Origin not found"
            });
        }

        const recipe =
            recipeRepository.create({
                mealId: String(mealId),
                name,
                category,
                origin,
                categoryId: parsedCategoryId,
                originId: parsedOriginId,
                instructions: instructions ?? null,
                imageUrl: imageUrl ?? null,
                youtubeUrl: youtubeUrl ?? null,
                sourceUrl: sourceUrl ?? null
            });

        const savedRecipe =
            await recipeRepository.save(recipe);

        if (
            Array.isArray(ingredients)
        ) {
            const recipeIngredients =
                ingredients
                    .filter(
                        (item: any) =>
                            item?.ingredient?.trim()
                    )
                    .map(
                        (item: {
                            ingredient: string;
                            measure?: string;
                        }) =>
                            ingredientRepository.create({
                                recipe: savedRecipe,
                                ingredient:
                                    item.ingredient.trim(),
                                measure:
                                    item.measure?.trim() || null
                            })
                    );

            if (recipeIngredients.length > 0) {
                await ingredientRepository.save(
                    recipeIngredients
                );
            }
        }

        const createdRecipe =
            await recipeRepository.findOne({
                where: {
                    id: savedRecipe.id
                },
                relations: {
                    category: true,
                    origin: true,
                    ingredients: true
                }
            });

        return res.status(201).json({
            success: true,
            data: createdRecipe
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Failed to create recipe"
        });
    }
});

/* =====================================================
   UPDATE RECIPE
===================================================== */

router.put("/:id", async (req, res) => {
    try {
        const id =
            Number(req.params.id);

        if (!Number.isInteger(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid recipe id"
            });
        }

        const {
            mealId,
            name,
            categoryId,
            originId,
            instructions,
            imageUrl,
            youtubeUrl,
            sourceUrl,
            ingredients
        } = req.body;

        const recipeRepository =
            AppDataSource.getRepository(Recipe);

        const categoryRepository =
            AppDataSource.getRepository(Category);

        const originRepository =
            AppDataSource.getRepository(Origin);

        const ingredientRepository =
            AppDataSource.getRepository(
                RecipeIngredient
            );

        const recipe =
            await recipeRepository.findOneBy({
                id
            });

        if (!recipe) {
            return res.status(404).json({
                success: false,
                message: "Recipe not found"
            });
        }

        const parsedCategoryId =
            categoryId
                ? Number(categoryId)
                : null;

        const parsedOriginId =
            originId
                ? Number(originId)
                : null;

        const category =
            parsedCategoryId
                ? await categoryRepository.findOneBy({
                    id: parsedCategoryId
                })
                : null;

        const origin =
            parsedOriginId
                ? await originRepository.findOneBy({
                    id: parsedOriginId
                })
                : null;

        if (parsedCategoryId && !category) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }

        if (parsedOriginId && !origin) {
            return res.status(404).json({
                success: false,
                message: "Origin not found"
            });
        }

        recipe.mealId =
            mealId ?? recipe.mealId;

        recipe.name =
            name ?? recipe.name;

        recipe.category =
            category;

        recipe.categoryId =
            parsedCategoryId;

        recipe.origin =
            origin;

        recipe.originId =
            parsedOriginId;

        recipe.instructions =
            instructions ?? null;

        recipe.imageUrl =
            imageUrl ?? null;

        recipe.youtubeUrl =
            youtubeUrl ?? null;

        recipe.sourceUrl =
            sourceUrl ?? null;

        const updatedRecipe =
            await recipeRepository.save(recipe);

        await ingredientRepository.delete({
            recipe: {
                id
            }
        });

        if (Array.isArray(ingredients)) {
            const recipeIngredients =
                ingredients
                    .filter(
                        (item: any) =>
                            item?.ingredient?.trim()
                    )
                    .map(
                        (item: {
                            ingredient: string;
                            measure?: string;
                        }) =>
                            ingredientRepository.create({
                                recipe: updatedRecipe,
                                ingredient:
                                    item.ingredient.trim(),
                                measure:
                                    item.measure?.trim() || null
                            })
                    );

            if (recipeIngredients.length > 0) {
                await ingredientRepository.save(
                    recipeIngredients
                );
            }
        }

        const result =
            await recipeRepository.findOne({
                where: {
                    id
                },
                relations: {
                    category: true,
                    origin: true,
                    ingredients: true
                }
            });

        return res.json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Failed to update recipe"
        });
    }
});

/* =====================================================
   DELETE RECIPE
===================================================== */

router.delete("/:id", async (req, res) => {
    try {
        const id =
            Number(req.params.id);

        if (!Number.isInteger(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid recipe id"
            });
        }

        const recipeRepository =
            AppDataSource.getRepository(Recipe);

        const recipe =
            await recipeRepository.findOneBy({
                id
            });

        if (!recipe) {
            return res.status(404).json({
                success: false,
                message: "Recipe not found"
            });
        }

        await recipeRepository.remove(recipe);

        return res.json({
            success: true,
            message:
                "Recipe deleted successfully"
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message:
                "Failed to delete recipe"
        });
    }
});

export default router;
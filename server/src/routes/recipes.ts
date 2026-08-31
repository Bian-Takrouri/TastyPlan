import { Router } from "express";
import mongoose from "mongoose";
import { Recipe } from "../entities/Recipe.js";
import { Category } from "../entities/Category.js";
import { Origin } from "../entities/Origin.js";
import { RecipeIngredient } from "../entities/RecipeIngredient.js";

const router = Router();

const getRecipeWithIngredients = async (recipe: any) => {
    if (!recipe) return null;

    const ingredients = await RecipeIngredient.find({
        recipe: recipe._id
    }).lean();

    return {
        ...recipe,
        ingredients
    };
};

/* =====================================================
   GET ALL RECIPES
===================================================== */

router.get("/", async (_req, res) => {
    try {
        const recipes = await Recipe.find()
            .populate("category")
            .populate("origin")
            .lean();

        const data = await Promise.all(
            recipes.map((recipe) =>
                getRecipeWithIngredients(recipe)
            )
        );

        return res.json({
            success: true,
            data
        });
    } catch (error) {
        console.error("Get recipes error:", error);

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

        if (!mealId || !name?.trim()) {
            return res.status(400).json({
                success: false,
                message: "mealId and name are required"
            });
        }

        let category = null;
        let origin = null;

        if (categoryId) {
            if (!mongoose.Types.ObjectId.isValid(String(categoryId))) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid category id"
                });
            }

            category = await Category.findById(categoryId);

            if (!category) {
                return res.status(404).json({
                    success: false,
                    message: "Category not found"
                });
            }
        }

        if (originId) {
            if (!mongoose.Types.ObjectId.isValid(String(originId))) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid origin id"
                });
            }

            origin = await Origin.findById(originId);

            if (!origin) {
                return res.status(404).json({
                    success: false,
                    message: "Origin not found"
                });
            }
        }

        const recipe = await Recipe.create({
            mealId: String(mealId),
            name: String(name).trim(),
            category: category?._id ?? null,
            origin: origin?._id ?? null,
            instructions:
                instructions !== undefined
                    ? instructions
                    : null,
            imageUrl:
                imageUrl !== undefined
                    ? imageUrl
                    : null,
            youtubeUrl:
                youtubeUrl !== undefined
                    ? youtubeUrl
                    : null,
            sourceUrl:
                sourceUrl !== undefined
                    ? sourceUrl
                    : null
        });

        if (Array.isArray(ingredients)) {
            const recipeIngredients = ingredients
                .filter(
                    (item: any) =>
                        typeof item?.ingredient === "string" &&
                        item.ingredient.trim() !== ""
                )
                .map(
                    (item: {
                        ingredient: string;
                        measure?: string;
                    }) => ({
                        recipe: recipe._id,
                        ingredient: item.ingredient.trim(),
                        measure:
                            typeof item.measure === "string" &&
                            item.measure.trim() !== ""
                                ? item.measure.trim()
                                : null
                    })
                );

            if (recipeIngredients.length > 0) {
                await RecipeIngredient.insertMany(
                    recipeIngredients
                );
            }
        }

        const createdRecipe = await Recipe.findById(
            recipe._id
        )
            .populate("category")
            .populate("origin")
            .lean();

        const data =
            await getRecipeWithIngredients(createdRecipe);

        return res.status(201).json({
            success: true,
            data
        });
    } catch (error: any) {
        console.error("Create recipe error:", error);

        if (error?.code === 11000) {
            return res.status(409).json({
                success: false,
                message:
                    "A recipe with this mealId already exists"
            });
        }

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
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(String(id))) {
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

        const recipe = await Recipe.findById(id);

        if (!recipe) {
            return res.status(404).json({
                success: false,
                message: "Recipe not found"
            });
        }

        if (categoryId !== undefined) {
            if (
                categoryId !== null &&
                !mongoose.Types.ObjectId.isValid(
                    String(categoryId)
                )
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid category id"
                });
            }

            if (categoryId === null) {
                recipe.category = null;
            } else {
                const category =
                    await Category.findById(categoryId);

                if (!category) {
                    return res.status(404).json({
                        success: false,
                        message: "Category not found"
                    });
                }

                recipe.category = category._id;
            }
        }

        if (originId !== undefined) {
            if (
                originId !== null &&
                !mongoose.Types.ObjectId.isValid(
                    String(originId)
                )
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid origin id"
                });
            }

            if (originId === null) {
                recipe.origin = null;
            } else {
                const origin =
                    await Origin.findById(originId);

                if (!origin) {
                    return res.status(404).json({
                        success: false,
                        message: "Origin not found"
                    });
                }

                recipe.origin = origin._id;
            }
        }

        if (mealId !== undefined) {
            recipe.mealId = String(mealId);
        }

        if (name !== undefined) {
            if (!String(name).trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Name cannot be empty"
                });
            }

            recipe.name = String(name).trim();
        }

        if (instructions !== undefined) {
            recipe.instructions = instructions;
        }

        if (imageUrl !== undefined) {
            recipe.imageUrl = imageUrl;
        }

        if (youtubeUrl !== undefined) {
            recipe.youtubeUrl = youtubeUrl;
        }

        if (sourceUrl !== undefined) {
            recipe.sourceUrl = sourceUrl;
        }

        await recipe.save();

        if (Array.isArray(ingredients)) {
            await RecipeIngredient.deleteMany({
                recipe: recipe._id
            });

            const recipeIngredients = ingredients
                .filter(
                    (item: any) =>
                        typeof item?.ingredient === "string" &&
                        item.ingredient.trim() !== ""
                )
                .map(
                    (item: {
                        ingredient: string;
                        measure?: string;
                    }) => ({
                        recipe: recipe._id,
                        ingredient: item.ingredient.trim(),
                        measure:
                            typeof item.measure === "string" &&
                            item.measure.trim() !== ""
                                ? item.measure.trim()
                                : null
                    })
                );

            if (recipeIngredients.length > 0) {
                await RecipeIngredient.insertMany(
                    recipeIngredients
                );
            }
        }

        const updatedRecipe = await Recipe.findById(
            recipe._id
        )
            .populate("category")
            .populate("origin")
            .lean();

        const data =
            await getRecipeWithIngredients(updatedRecipe);

        return res.json({
            success: true,
            data
        });
    } catch (error: any) {
        console.error("Update recipe error:", error);

        if (error?.code === 11000) {
            return res.status(409).json({
                success: false,
                message:
                    "A recipe with this mealId already exists"
            });
        }

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
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(String(id))) {
            return res.status(400).json({
                success: false,
                message: "Invalid recipe id"
            });
        }

        const recipe = await Recipe.findById(id);

        if (!recipe) {
            return res.status(404).json({
                success: false,
                message: "Recipe not found"
            });
        }

        await RecipeIngredient.deleteMany({
            recipe: recipe._id
        });

        await Recipe.deleteOne({
            _id: recipe._id
        });

        return res.json({
            success: true,
            message: "Recipe deleted successfully"
        });
    } catch (error) {
        console.error("Delete recipe error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to delete recipe"
        });
    }
});

export default router;


// import { Router } from "express";

// import { AppDataSource } from "../data-source.js";

// import { Recipe } from "../entities/Recipe.js";
// import { Category } from "../entities/Category.js";
// import { Origin } from "../entities/Origin.js";
// import { RecipeIngredient } from "../entities/RecipeIngredient.js";

// const router = Router();

// /* =====================================================
//    GET ALL RECIPES
// ===================================================== */

// router.get("/", async (_req, res) => {
//     try {
//         const recipeRepository =
//             AppDataSource.getRepository(Recipe);

//         const recipes =
//             await recipeRepository.find({
//                 relations: {
//                     category: true,
//                     origin: true,
//                     ingredients: true
//                 }
//             });

//         return res.json({
//             success: true,
//             data: recipes
//         });

//     } catch (error) {
//         console.error(error);

//         return res.status(500).json({
//             success: false,
//             message: "Failed to fetch recipes"
//         });
//     }
// });

// /* =====================================================
//    CREATE RECIPE
// ===================================================== */

// router.post("/", async (req, res) => {
//     try {
//         const {
//             mealId,
//             name,
//             categoryId,
//             originId,
//             instructions,
//             imageUrl,
//             youtubeUrl,
//             sourceUrl,
//             ingredients
//         } = req.body;

//         if (!mealId || !name) {
//             return res.status(400).json({
//                 success: false,
//                 message: "mealId and name are required"
//             });
//         }

//         const recipeRepository =
//             AppDataSource.getRepository(Recipe);

//         const categoryRepository =
//             AppDataSource.getRepository(Category);

//         const originRepository =
//             AppDataSource.getRepository(Origin);

//         const ingredientRepository =
//             AppDataSource.getRepository(
//                 RecipeIngredient
//             );

//         const parsedCategoryId =
//             categoryId
//                 ? Number(categoryId)
//                 : null;

//         const parsedOriginId =
//             originId
//                 ? Number(originId)
//                 : null;

//         const category =
//             parsedCategoryId
//                 ? await categoryRepository.findOneBy({
//                     id: parsedCategoryId
//                 })
//                 : null;

//         const origin =
//             parsedOriginId
//                 ? await originRepository.findOneBy({
//                     id: parsedOriginId
//                 })
//                 : null;

//         if (parsedCategoryId && !category) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Category not found"
//             });
//         }

//         if (parsedOriginId && !origin) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Origin not found"
//             });
//         }

//         const recipe =
//             recipeRepository.create({
//                 mealId: String(mealId),
//                 name,
//                 category,
//                 origin,
//                 categoryId: parsedCategoryId,
//                 originId: parsedOriginId,
//                 instructions: instructions ?? null,
//                 imageUrl: imageUrl ?? null,
//                 youtubeUrl: youtubeUrl ?? null,
//                 sourceUrl: sourceUrl ?? null
//             });

//         const savedRecipe =
//             await recipeRepository.save(recipe);

//         if (
//             Array.isArray(ingredients)
//         ) {
//             const recipeIngredients =
//                 ingredients
//                     .filter(
//                         (item: any) =>
//                             item?.ingredient?.trim()
//                     )
//                     .map(
//                         (item: {
//                             ingredient: string;
//                             measure?: string;
//                         }) =>
//                             ingredientRepository.create({
//                                 recipe: savedRecipe,
//                                 ingredient:
//                                     item.ingredient.trim(),
//                                 measure:
//                                     item.measure?.trim() || null
//                             })
//                     );

//             if (recipeIngredients.length > 0) {
//                 await ingredientRepository.save(
//                     recipeIngredients
//                 );
//             }
//         }

//         const createdRecipe =
//             await recipeRepository.findOne({
//                 where: {
//                     id: savedRecipe.id
//                 },
//                 relations: {
//                     category: true,
//                     origin: true,
//                     ingredients: true
//                 }
//             });

//         return res.status(201).json({
//             success: true,
//             data: createdRecipe
//         });

//     } catch (error) {
//         console.error(error);

//         return res.status(500).json({
//             success: false,
//             message: "Failed to create recipe"
//         });
//     }
// });

// /* =====================================================
//    UPDATE RECIPE
// ===================================================== */

// router.put("/:id", async (req, res) => {
//     try {
//         const id =
//             Number(req.params.id);

//         if (!Number.isInteger(id)) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Invalid recipe id"
//             });
//         }

//         const {
//             mealId,
//             name,
//             categoryId,
//             originId,
//             instructions,
//             imageUrl,
//             youtubeUrl,
//             sourceUrl,
//             ingredients
//         } = req.body;

//         const recipeRepository =
//             AppDataSource.getRepository(Recipe);

//         const categoryRepository =
//             AppDataSource.getRepository(Category);

//         const originRepository =
//             AppDataSource.getRepository(Origin);

//         const ingredientRepository =
//             AppDataSource.getRepository(
//                 RecipeIngredient
//             );

//         const recipe =
//             await recipeRepository.findOneBy({
//                 id
//             });

//         if (!recipe) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Recipe not found"
//             });
//         }

//         const parsedCategoryId =
//             categoryId
//                 ? Number(categoryId)
//                 : null;

//         const parsedOriginId =
//             originId
//                 ? Number(originId)
//                 : null;

//         const category =
//             parsedCategoryId
//                 ? await categoryRepository.findOneBy({
//                     id: parsedCategoryId
//                 })
//                 : null;

//         const origin =
//             parsedOriginId
//                 ? await originRepository.findOneBy({
//                     id: parsedOriginId
//                 })
//                 : null;

//         if (parsedCategoryId && !category) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Category not found"
//             });
//         }

//         if (parsedOriginId && !origin) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Origin not found"
//             });
//         }

//         recipe.mealId =
//             mealId ?? recipe.mealId;

//         recipe.name =
//             name ?? recipe.name;

//         recipe.category =
//             category;

//         recipe.categoryId =
//             parsedCategoryId;

//         recipe.origin =
//             origin;

//         recipe.originId =
//             parsedOriginId;

//         recipe.instructions =
//             instructions ?? null;

//         recipe.imageUrl =
//             imageUrl ?? null;

//         recipe.youtubeUrl =
//             youtubeUrl ?? null;

//         recipe.sourceUrl =
//             sourceUrl ?? null;

//         const updatedRecipe =
//             await recipeRepository.save(recipe);

//         await ingredientRepository.delete({
//             recipe: {
//                 id
//             }
//         });

//         if (Array.isArray(ingredients)) {
//             const recipeIngredients =
//                 ingredients
//                     .filter(
//                         (item: any) =>
//                             item?.ingredient?.trim()
//                     )
//                     .map(
//                         (item: {
//                             ingredient: string;
//                             measure?: string;
//                         }) =>
//                             ingredientRepository.create({
//                                 recipe: updatedRecipe,
//                                 ingredient:
//                                     item.ingredient.trim(),
//                                 measure:
//                                     item.measure?.trim() || null
//                             })
//                     );

//             if (recipeIngredients.length > 0) {
//                 await ingredientRepository.save(
//                     recipeIngredients
//                 );
//             }
//         }

//         const result =
//             await recipeRepository.findOne({
//                 where: {
//                     id
//                 },
//                 relations: {
//                     category: true,
//                     origin: true,
//                     ingredients: true
//                 }
//             });

//         return res.json({
//             success: true,
//             data: result
//         });

//     } catch (error) {
//         console.error(error);

//         return res.status(500).json({
//             success: false,
//             message: "Failed to update recipe"
//         });
//     }
// });

// /* =====================================================
//    DELETE RECIPE
// ===================================================== */

// router.delete("/:id", async (req, res) => {
//     try {
//         const id =
//             Number(req.params.id);

//         if (!Number.isInteger(id)) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Invalid recipe id"
//             });
//         }

//         const recipeRepository =
//             AppDataSource.getRepository(Recipe);

//         const recipe =
//             await recipeRepository.findOneBy({
//                 id
//             });

//         if (!recipe) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Recipe not found"
//             });
//         }

//         await recipeRepository.remove(recipe);

//         return res.json({
//             success: true,
//             message:
//                 "Recipe deleted successfully"
//         });

//     } catch (error) {
//         console.error(error);

//         return res.status(500).json({
//             success: false,
//             message:
//                 "Failed to delete recipe"
//         });
//     }
// });

// export default router;
import path from "path";
import { promises as fs } from "fs";

import { Recipe } from "../entities/Recipe.js";
import { Category } from "../entities/Category.js";
import { Origin } from "../entities/Origin.js";
import { RecipeIngredient } from "../entities/RecipeIngredient.js";

export const seedMeals =
    async () => {

        console.log(
            "⏳ Starting Meals Seeding..."
        );

        const mealsPath =
            path.join(
                process.cwd(),
                "data",
                "meals.json"
            );

        const mealsData =
            JSON.parse(
                await fs.readFile(
                    mealsPath,
                    "utf-8"
                )
            );

        const categories =
            await Category.find();

        const origins =
            await Origin.find();

        const categoryMap =
            new Map(
                categories.map(
                    (category) => [
                        category.name.toLowerCase(),
                        category._id
                    ]
                )
            );

        const originMap =
            new Map(
                origins.map(
                    (origin) => [
                        origin.name.toLowerCase(),
                        origin._id
                    ]
                )
            );

        for (const rawMeal of mealsData) {

            const mealId =
                String(rawMeal.idMeal);

            const existing =
                await Recipe.findOne({
                    mealId
                });

            if (existing) {
                continue;
            }

            const category =
                categoryMap.get(
                    rawMeal.strCategory
                        ?.toLowerCase()
                ) || null;

            const origin =
                originMap.get(
                    rawMeal.strArea
                        ?.toLowerCase()
                ) || null;

            const recipe =
                await Recipe.create({
                    mealId,

                    name:
                        rawMeal.strMeal,

                    category,

                    origin,

                    instructions:
                        rawMeal.strInstructions
                        || null,

                    imageUrl:
                        rawMeal.strMealThumb
                        || null,

                    youtubeUrl:
                        rawMeal.strYoutube
                        || null,

                    sourceUrl:
                        rawMeal.strSource
                        || null
                });

            const ingredients = [];

            for (
                let i = 1;
                i <= 20;
                i++
            ) {

                const ingName =
                    rawMeal[
                        `strIngredient${i}`
                    ];

                const measure =
                    rawMeal[
                        `strMeasure${i}`
                    ];

                if (
                    typeof ingName === "string" &&
                    ingName.trim() !== ""
                ) {

                    ingredients.push({
                        recipe: recipe._id,

                        ingredient:
                            ingName.trim(),

                        measure:
                            typeof measure === "string" &&
                            measure.trim() !== ""
                                ? measure.trim()
                                : null
                    });
                }
            }

            if (ingredients.length > 0) {

                await RecipeIngredient.insertMany(
                    ingredients
                );
            }
        }

        console.log(
            "✅ Meals Seeding Completed!"
        );
    };

// import path from "path";
// import { promises as fs } from "fs";

// import { AppDataSource } from "../data-source.js";

// import { Recipe } from "../entities/Recipe.js";
// import { Category } from "../entities/Category.js";
// import { Origin } from "../entities/Origin.js";
// import { RecipeIngredient } from "../entities/RecipeIngredient.js";

// export const seedMeals = async () => {
//     const categoryRepo =
//         AppDataSource.getRepository(Category);

//     const originRepo =
//         AppDataSource.getRepository(Origin);

//     const recipeRepo =
//         AppDataSource.getRepository(Recipe);

//     const ingredientRepo =
//         AppDataSource.getRepository(
//             RecipeIngredient
//         );

//     console.log("⏳ Starting Meals Seeding...");

//     const mealsPath =
//         path.join(
//             process.cwd(),
//             "data",
//             "meals.json"
//         );

//     const mealsData =
//         JSON.parse(
//             await fs.readFile(
//                 mealsPath,
//                 "utf-8"
//             )
//         );

//     const categories =
//         await categoryRepo.find();

//     const origins =
//         await originRepo.find();

//     const categoryMap =
//         new Map(
//             categories.map(
//                 (category) => [
//                     category.name.toLowerCase(),
//                     category.id
//                 ]
//             )
//         );

//     const originMap =
//         new Map(
//             origins.map(
//                 (origin) => [
//                     origin.name.toLowerCase(),
//                     origin.id
//                 ]
//             )
//         );

//     for (const rawMeal of mealsData) {

//         const existing =
//             await recipeRepo.findOneBy({
//                 mealId: String(rawMeal.idMeal)
//             });

//         if (existing) {
//             continue;
//         }

//         const categoryId =
//             categoryMap.get(
//                 rawMeal.strCategory
//                     ?.toLowerCase()
//             ) ?? null;

//         const originId =
//             originMap.get(
//                 rawMeal.strArea
//                     ?.toLowerCase()
//             ) ?? null;

//         const recipe =
//             recipeRepo.create({
//                 mealId:
//                     String(rawMeal.idMeal),

//                 name:
//                     rawMeal.strMeal,

//                 categoryId,

//                 originId,

//                 instructions:
//                     rawMeal.strInstructions
//                     || null,

//                 imageUrl:
//                     rawMeal.strMealThumb
//                     || null,

//                 youtubeUrl:
//                     rawMeal.strYoutube
//                     || null,

//                 sourceUrl:
//                     rawMeal.strSource
//                     || null
//             });

//         const savedRecipe =
//             await recipeRepo.save(recipe);

//         const ingredients:
//             RecipeIngredient[] = [];

//         for (
//             let i = 1;
//             i <= 20;
//             i++
//         ) {
//             const ingName =
//                 rawMeal[`strIngredient${i}`];

//             const measure =
//                 rawMeal[`strMeasure${i}`];

//             if (
//                 typeof ingName === "string" &&
//                 ingName.trim() !== ""
//             ) {
//                 ingredients.push(
//                     ingredientRepo.create({
//                         recipe: savedRecipe,

//                         ingredient:
//                             ingName.trim(),

//                         measure:
//                             typeof measure === "string" &&
//                             measure.trim() !== ""
//                                 ? measure.trim()
//                                 : null
//                     })
//                 );
//             }
//         }

//         if (ingredients.length > 0) {
//             await ingredientRepo.save(
//                 ingredients
//             );
//         }
//     }

//     console.log(
//         "✅ Meals Seeding Completed!"
//     );
// };
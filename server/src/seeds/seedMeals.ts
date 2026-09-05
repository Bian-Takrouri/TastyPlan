import path from "path";
import { promises as fs } from "fs";
import { AppDataSource } from "../data-source.js";
import { Recipe } from "../entities/Recipe.js";
import { Category } from "../entities/Category.js";
import { Origin } from "../entities/Origin.js";
import { RecipeIngredient } from "../entities/RecipeIngredient.js";

export const seedMeals = async () => {
    const categoryRepo = AppDataSource.getRepository(Category);
    const originRepo = AppDataSource.getRepository(Origin);
    const recipeRepo = AppDataSource.getRepository(Recipe);
    const ingredientRepo = AppDataSource.getRepository(RecipeIngredient);

    const mealsPath = path.join(process.cwd(), "data", "meals.json");
    const mealsData = JSON.parse(await fs.readFile(mealsPath, "utf-8"));

    const categories = await categoryRepo.find();
    const origins = await originRepo.find();

    const categoryMap = new Map(categories.map((category) => [
        category.name.toLowerCase(),
        category.id
    ]))

    const originMap = new Map(origins.map((origin) => [
        origin.name.toLowerCase(),
        origin.id
    ]))

    for (const rawMeal of mealsData) {
        const existing = await recipeRepo.findOneBy({ mealId: String(rawMeal.idMeal) });
        if (existing) {
            continue;
        }
        const categoryName = rawMeal.strCategory?.toLowerCase();
        let categoryId = null;
        if (categoryName) {
            categoryId = categoryMap.get(categoryName) || null;
        }
        const originName = rawMeal.strArea?.toLowerCase();
        let originId = null;
        if (originName) {
            originId = originMap.get(originName) || null;
        }

        const recipe = recipeRepo.create({
            mealId: String(rawMeal.idMeal),
            name: rawMeal.strMeal,
            categoryId,
            originId,
            instructions: rawMeal.strInstructions || null,
            imageUrl: rawMeal.strMealThumb || null,
            youtubeUrl: rawMeal.strYoutube || null,
            sourceUrl: rawMeal.strSource || null
        });

        const savedRecipe = await recipeRepo.save(recipe);
        const ingredients: RecipeIngredient[] = [];
        for (let i = 1; i <= 20; i++) {
            const ingName = rawMeal[`strIngredient${i}`]
            const measure = rawMeal[`strMeasure${i}`];
            if (typeof ingName === "string" && ingName.trim() !== "") {
                ingredients.push(ingredientRepo.create({
                    recipe: savedRecipe,
                    ingredient: ingName.trim(),
                    measure: typeof measure === "string" && measure.trim() !== "" ?
                        measure.trim() : null
                }))
            }
        }
        if (ingredients.length > 0) {
            await ingredientRepo.save( ingredients);
        }
    }
    console.log("meals seeding completed");
};
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

  console.log("⏳ Starting Meals Seeding...");

  // قراءة ملف الوجبات
  const mealsPath = path.join(process.cwd(), "data", "meals.json");
  const mealsData = JSON.parse(await fs.readFile(mealsPath, "utf-8"));

  const categories = await categoryRepo.find();
  const origins = await originRepo.find();

  const categoryMap = new Map(categories.map((c) => [c.name.toLowerCase(), c.id]));
  const originMap = new Map(origins.map((o) => [o.name.toLowerCase(), o.id]));

  const batchSize = 100;
  let batch: Recipe[] = [];

  for (const rawMeal of mealsData) {
    const existing = await recipeRepo.findOneBy({ mealId: rawMeal.idMeal });
    if (existing) continue;

    const categoryId = categoryMap.get(rawMeal.strCategory?.toLowerCase()) || null;
    const originId = originMap.get(rawMeal.strArea?.toLowerCase()) || null;

    const ingredients: RecipeIngredient[] = [];
    for (let i = 1; i <= 20; i++) {
      const ingName = rawMeal[`strIngredient${i}`];
      const measure = rawMeal[`strMeasure${i}`];

      if (ingName && typeof ingName === "string" && ingName.trim() !== "") {
        const ri = new RecipeIngredient();
        ri.ingredient = ingName.trim();
        ri.measure = measure && typeof measure === "string" ? measure.trim() : null;
        ingredients.push(ri);
      }
    }

    const recipe = recipeRepo.create({
      mealId: rawMeal.idMeal,
      name: rawMeal.strMeal,
      categoryId: categoryId,
      originId: originId,
      instructions: rawMeal.strInstructions,
      imageUrl: rawMeal.strMealThumb,
      ingredients: ingredients
    });

    batch.push(recipe);

    if (batch.length >= batchSize) {
      await recipeRepo.save(batch);
      batch = [];
    }
  }

  if (batch.length > 0) {
    await recipeRepo.save(batch);
  }

  console.log("✅ Meals Seeding Completed!");
};
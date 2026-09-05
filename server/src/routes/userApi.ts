import { Router, Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { Favorite } from "../entities/Favorite.js";
import { MealPlanItem, DayOfWeek } from "../entities/MealPlanItem.js";
import { GroceryItem } from "../entities/GroceryItem.js";
import { Recipe } from "../entities/Recipe.js";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "your_super_secret_jwt_key";

interface AuthenticatedRequest extends Request {
  userId?: string;
}

// Helpers & Middlewares
function authenticateUser(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Unauthorized: Missing token" });
  }

  try {
    const token = authHeader.slice(7);
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    req.userId = decoded.id;
    next();
  } catch {
    return res.status(403).json({ success: false, message: "Invalid or expired token" });
  }
}

function serializeRecipe(recipe: any) {
  if (!recipe) return null;
  const data = typeof recipe.toObject === "function" ? recipe.toObject() : recipe;
  return {
    ...data,
    id: data._id?.toString(),
    category: data.categoryId ?? data.category ?? null,
    origin: data.originId ?? data.origin ?? null
  };
}

function serializeMealPlanItem(item: any) {
  const data = typeof item.toObject === "function" ? item.toObject() : item;
  return {
    ...data,
    id: data._id?.toString(),
    userId: data.userId?.toString(),
    recipeId: data.recipeId?._id?.toString?.() ?? data.recipeId?.toString?.(),
    recipe: serializeRecipe(data.recipeId)
  };
}

function serializeGroceryItem(item: any) {
  const data = typeof item.toObject === "function" ? item.toObject() : item;
  return {
    ...data,
    id: data._id?.toString(),
    userId: data.userId?.toString()
  };
}

async function syncGroceryList(userId: string) {
  if (!mongoose.Types.ObjectId.isValid(userId)) return;

  const mealPlanItems = await MealPlanItem.find({ userId }).populate("recipeId");
  const ingredientCounts = new Map<string, number>();

  for (const item of mealPlanItems) {
    const recipe = item.recipeId as any;
    if (!recipe || !recipe.ingredients) continue;

    const ingredientsInRecipe = new Set<string>();

    for (const ingredient of recipe.ingredients) {
      const name = ingredient.ingredient?.trim();
      if (!name) continue;

      const normalizedName = name.toLowerCase();
      if (ingredientsInRecipe.has(normalizedName)) continue;

      ingredientsInRecipe.add(normalizedName);
      ingredientCounts.set(normalizedName, (ingredientCounts.get(normalizedName) || 0) + 1);
    }
  }

  const groceryItems = await GroceryItem.find({ userId, custom: false });

  for (const groceryItem of groceryItems) {
    const normalizedName = groceryItem.name.trim().toLowerCase();
    const quantity = ingredientCounts.get(normalizedName) || 0;

    if (quantity === 0) {
      await GroceryItem.findByIdAndDelete(groceryItem._id);
    } else {
      groceryItem.quantity = quantity;
      await groceryItem.save();
    }
  }
}

router.use(authenticateUser);

/* Favorites Routes */
router.get("/favorites", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const favorites = await Favorite.find({ userId: req.userId })
      .populate({
        path: "recipeId",
        populate: [{ path: "categoryId" }, { path: "originId" }]
      })
      .sort({ createdAt: -1 });

    const recipes = favorites.map(favorite => serializeRecipe(favorite.recipeId)).filter(Boolean);
    return res.json({ success: true, data: recipes });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to fetch favorites" });
  }
});

router.post("/favorites/toggle", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { mealId } = req.body;
    if (!mealId) {
      return res.status(400).json({ success: false, message: "mealId is required" });
    }

    const recipe = await Recipe.findOne({ mealId: String(mealId) });
    if (!recipe) {
      return res.status(404).json({ success: false, message: "Recipe not found" });
    }

    const existing = await Favorite.findOne({ userId: req.userId, recipeId: recipe._id });
    if (existing) {
      await Favorite.findByIdAndDelete(existing._id);
      return res.json({ success: true, isFavorite: false });
    }

    const favorite = new Favorite({ userId: req.userId, recipeId: recipe._id });
    await favorite.save();

    return res.json({ success: true, isFavorite: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to update favorite" });
  }
});

/*  Meal Plan Routes   */
router.get("/meal-plan", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const items = await MealPlanItem.find({ userId: req.userId }).populate({
      path: "recipeId",
      populate: [{ path: "categoryId" }, { path: "originId" }]
    });

    return res.json({
      success: true,
      data: items.map(serializeMealPlanItem)
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to fetch meal plan" });
  }
});

router.post("/meal-plan/item", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { mealId, dayOfWeek } = req.body as { mealId: string; dayOfWeek: DayOfWeek };
    const validDays: DayOfWeek[] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

    if (!mealId || !dayOfWeek || !validDays.includes(dayOfWeek)) {
      return res.status(400).json({ success: false, message: "Valid mealId and dayOfWeek are required" });
    }

    const recipe = await Recipe.findOne({ mealId: String(mealId) });
    if (!recipe) {
      return res.status(404).json({ success: false, message: "Recipe not found" });
    }

    let item = await MealPlanItem.findOne({ userId: req.userId, dayOfWeek });
    if (item) {
      item.recipeId = recipe._id;
    } else {
      item = new MealPlanItem({ userId: req.userId, recipeId: recipe._id, dayOfWeek });
    }

    await item.save();

    const savedItem = await MealPlanItem.findById(item._id).populate({
      path: "recipeId",
      populate: [{ path: "categoryId" }, { path: "originId" }]
    });

    return res.json({ success: true, data: serializeMealPlanItem(savedItem) });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to save meal plan item" });
  }
});

router.delete("/meal-plan/item/:id", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (Array.isArray(id) || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid meal plan item ID" });
    }

    const item = await MealPlanItem.findOne({ _id: id, userId: req.userId });
    if (!item) {
      return res.status(404).json({ success: false, message: "Meal plan item not found" });
    }

    await MealPlanItem.findByIdAndDelete(id);
    await syncGroceryList(req.userId!);

    return res.json({ success: true, message: "Meal removed from plan" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to remove meal" });
  }
});

router.delete("/meal-plan", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const result = await MealPlanItem.deleteMany({ userId: req.userId });
    await syncGroceryList(req.userId!);

    return res.json({
      success: true,
      message: "Meal plan cleared",
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to clear meal plan" });
  }
});

/*Grocery List Routes */
router.get("/grocery", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const items = await GroceryItem.find({ userId: req.userId }).sort({ _id: 1 });
    return res.json({
      success: true,
      data: items.map(serializeGroceryItem)
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to fetch grocery items" });
  }
});

router.post("/grocery", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, quantity = 1, completed = false, custom = true } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({ success: false, message: "Name is required" });
    }

    const parsedQuantity = Number(quantity);
    if (!Number.isInteger(parsedQuantity) || parsedQuantity < 1) {
      return res.status(400).json({ success: false, message: "Quantity must be a positive integer" });
    }

    const normalizedName = name.trim();
    const escapedName = normalizedName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const existing = await GroceryItem.findOne({
      userId: req.userId,
      name: { $regex: `^${escapedName}$`, $options: "i" }
    });

    if (existing) {
      if (!Boolean(custom)) {
        existing.quantity = parsedQuantity;
        existing.custom = false;
        const updated = await existing.save();
        return res.json({ success: true, data: serializeGroceryItem(updated) });
      }

      return res.status(409).json({ success: false, message: "Grocery item already exists" });
    }

    const item = new GroceryItem({
      userId: req.userId,
      name: normalizedName,
      quantity: parsedQuantity,
      completed: Boolean(completed),
      custom: Boolean(custom)
    });

    try {
      const savedItem = await item.save();
      return res.status(201).json({ success: true, data: serializeGroceryItem(savedItem) });
    } catch (error: any) {
      if (error?.code === 11000) {
        const duplicatedItem = await GroceryItem.findOne({
          userId: req.userId,
          name: { $regex: `^${escapedName}$`, $options: "i" }
        });

        if (duplicatedItem && !Boolean(custom)) {
          duplicatedItem.quantity = parsedQuantity;
          duplicatedItem.custom = false;
          const updated = await duplicatedItem.save();
          return res.json({ success: true, data: serializeGroceryItem(updated) });
        }

        return res.status(409).json({ success: false, message: "Grocery item already exists" });
      }

      throw error;
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to add grocery item" });
  }
});

router.patch("/grocery/:id", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (Array.isArray(id) || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid grocery item ID" });
    }

    const item = await GroceryItem.findOne({ _id: id, userId: req.userId });
    if (!item) {
      return res.status(404).json({ success: false, message: "Grocery item not found" });
    }

    if (typeof req.body.completed === "boolean") {
      item.completed = req.body.completed;
    }

    if (typeof req.body.quantity !== "undefined") {
      const quantity = Number(req.body.quantity);
      if (!Number.isInteger(quantity) || quantity < 1) {
        return res.status(400).json({ success: false, message: "Quantity must be a positive integer" });
      }
      item.quantity = quantity;
    }

    if (typeof req.body.name === "string" && req.body.name.trim()) {
      const newName = req.body.name.trim();
      const escapedName = newName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      const existing = await GroceryItem.findOne({
        _id: { $ne: item._id },
        userId: req.userId,
        name: { $regex: `^${escapedName}$`, $options: "i" }
      });

      if (existing) {
        return res.status(409).json({ success: false, message: "Grocery item already exists" });
      }

      item.name = newName;
    }

    const updatedItem = await item.save();
    return res.json({ success: true, data: serializeGroceryItem(updatedItem) });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to update grocery item" });
  }
});

router.delete("/grocery/:id", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (Array.isArray(id) || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid grocery item ID" });
    }

    const result = await GroceryItem.findOneAndDelete({ _id: id, userId: req.userId });
    if (!result) {
      return res.status(404).json({ success: false, message: "Grocery item not found" });
    }

    return res.json({ success: true, message: "Grocery item deleted" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to delete grocery item" });
  }
});

export default router;
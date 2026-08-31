import { Router, Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { Favorite } from "../entities/Favorite.js";
import { MealPlanItem, DayOfWeek } from "../entities/MealPlanItem.js";
import { GroceryItem } from "../entities/GroceryItem.js";
import { Recipe } from "../entities/Recipe.js";
import { RecipeIngredient } from "../entities/RecipeIngredient.js";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "your_super_secret_jwt_key";

interface AuthenticatedRequest extends Request { userId?: string; }

/* =====================================================
   AUTHENTICATION
===================================================== */

function authenticateUser(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
        return res.status(401).json({ success: false, message: "Unauthorized: Missing token" });
    }
    try {
        const token = authHeader.slice(7);
        const decoded = jwt.verify(token, JWT_SECRET) as { id?: string };
        if (!decoded.id || !mongoose.Types.ObjectId.isValid(decoded.id)) {
            return res.status(403).json({ success: false, message: "Invalid user id" });
        }
        req.userId = decoded.id;
        next();
    } catch {
        return res.status(403).json({ success: false, message: "Invalid or expired token" });
    }
}

router.use(authenticateUser);

/* =====================================================
   HELPER
===================================================== */

const getRecipeWithIngredients = async (recipe: any) => {
    if (!recipe) return null;
    const ingredients = await RecipeIngredient.find({ recipe: recipe._id }).lean();
    return { ...recipe.toObject(), ingredients };
};

/* =====================================================
   FAVORITES
===================================================== */

router.get("/favorites", async (req: AuthenticatedRequest, res: Response) => {
    try {
        const favorites = await Favorite.find({ user: req.userId })
            .populate({ path: "recipe", populate: [{ path: "category" }, { path: "origin" }] })
            .sort({ createdAt: -1 });

        const data = await Promise.all(
            favorites.map((favorite: any) => getRecipeWithIngredients(favorite.recipe))
        );

        return res.json({ success: true, data: data.filter(Boolean) });
    } catch (error) {
        console.error("Get favorites error:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch favorites" });
    }
});

router.post("/favorites/toggle", async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { mealId } = req.body;
        if (!mealId) return res.status(400).json({ success: false, message: "mealId is required" });

        const recipe = await Recipe.findOne({ mealId: String(mealId) });
        if (!recipe) return res.status(404).json({ success: false, message: "Recipe not found" });

        const existing = await Favorite.findOne({ user: req.userId, recipe: recipe._id });

        if (existing) {
            await Favorite.findByIdAndDelete(existing._id);
            return res.json({ success: true, isFavorite: false });
        }

        await Favorite.create({ user: req.userId, recipe: recipe._id });
        return res.json({ success: true, isFavorite: true });
    } catch (error: any) {
        console.error("Toggle favorite error:", error);
        if (error?.code === 11000) return res.json({ success: true, isFavorite: true });
        return res.status(500).json({ success: false, message: "Failed to update favorite" });
    }
});

/* =====================================================
   MEAL PLAN
===================================================== */

/*
   MongoDB uses _id (ObjectId).
   The Frontend expects an item id.
   Therefore, the API returns:
   - id
   - itemId
   - _id

   This keeps compatibility with the existing Frontend.
*/

const formatMealPlanItem = (item: any) => {
    const id = item._id.toString();
    return { ...item.toObject(), id, itemId: id };
};

router.get("/meal-plan", async (req: AuthenticatedRequest, res: Response) => {
    try {
        const items = await MealPlanItem.find({ user: req.userId }).populate({
            path: "recipe",
            populate: [{ path: "category" }, { path: "origin" }]
        });

        const data = await Promise.all(
            items.map(async (item: any) => ({
                ...formatMealPlanItem(item),
                recipe: await getRecipeWithIngredients(item.recipe)
            }))
        );

        return res.json({ success: true, data });
    } catch (error) {
        console.error("Get meal plan error:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch meal plan" });
    }
});

router.post("/meal-plan/item", async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { mealId, dayOfWeek } = req.body as { mealId: string; dayOfWeek: DayOfWeek };

        const validDays: DayOfWeek[] = [
            "Monday", "Tuesday", "Wednesday", "Thursday",
            "Friday", "Saturday", "Sunday"
        ];

        if (!mealId || !dayOfWeek || !validDays.includes(dayOfWeek)) {
            return res.status(400).json({
                success: false,
                message: "Valid mealId and dayOfWeek are required"
            });
        }

        const recipe = await Recipe.findOne({ mealId: String(mealId) });
        if (!recipe) return res.status(404).json({ success: false, message: "Recipe not found" });

        let item = await MealPlanItem.findOne({ user: req.userId, dayOfWeek });

        if (item) {
            item.recipe = recipe._id;
        } else {
            item = new MealPlanItem({
                user: req.userId,
                recipe: recipe._id,
                dayOfWeek
            });
        }

        await item.save();

        const result = await MealPlanItem.findById(item._id).populate({
            path: "recipe",
            populate: [{ path: "category" }, { path: "origin" }]
        });

        if (!result) {
            return res.status(500).json({
                success: false,
                message: "Failed to retrieve saved meal plan item"
            });
        }

        const data = {
            ...formatMealPlanItem(result),
            recipe: await getRecipeWithIngredients((result as any).recipe)
        };

        return res.json({ success: true, data });
    } catch (error: any) {
        console.error("Save meal plan error:", error);

        if (error?.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "A meal already exists for this day"
            });
        }

        return res.status(500).json({
            success: false,
            message: "Failed to save meal plan item"
        });
    }
});

/* =====================================================
   REMOVE MEAL FROM PLAN
===================================================== */

router.delete("/meal-plan/item/:id", async (req: AuthenticatedRequest, res: Response) => {
    try {
        const id = String(req.params.id);

        /*
           Frontend sends the meal plan item id.
           MongoDB uses ObjectId.
        */

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid meal plan item id"
            });
        }

        const result = await MealPlanItem.findOneAndDelete({
            _id: id,
            user: req.userId
        });

        if (!result) {
            return res.status(404).json({
                success: false,
                message: "Meal plan item not found"
            });
        }

        return res.json({
            success: true,
            message: "Meal removed from plan",
            id
        });
    } catch (error) {
        console.error("Delete meal plan item error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to remove meal"
        });
    }
});

/* =====================================================
   CLEAR WEEK
===================================================== */

router.delete("/meal-plan", async (req: AuthenticatedRequest, res: Response) => {
    try {
        const result = await MealPlanItem.deleteMany({ user: req.userId });

        return res.json({
            success: true,
            message: "Meal plan cleared",
            deletedCount: result.deletedCount
        });
    } catch (error) {
        console.error("Clear meal plan error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to clear meal plan"
        });
    }
});

/* =====================================================
   GROCERY
===================================================== */

/*
   MongoDB uses _id (ObjectId).
   The Frontend expects id.
   Therefore, we convert _id -> id in the API response.

   The Frontend uses complete in the Completed filter.
   MongoDB keeps completed as the real field.
   complete is returned as an alias for Frontend compatibility.
*/

const formatGroceryItem = (item: any) => ({
    id: item._id.toString(),
    userId: item.user?.toString(),
    name: item.name,
    quantity: item.quantity,
    completed: item.completed,
    complete: item.completed,
    custom: item.custom
});

router.get("/grocery", async (req: AuthenticatedRequest, res: Response) => {
    try {
        const items = await GroceryItem.find({ user: req.userId }).sort({ _id: 1 }).lean();
        return res.json({ success: true, data: items.map(formatGroceryItem) });
    } catch (error) {
        console.error("Get grocery items error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch grocery items"
        });
    }
});

router.post("/grocery", async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { name, quantity = 1, completed = false, custom = true } = req.body;

        if (typeof name !== "string" || !name.trim()) {
            return res.status(400).json({ success: false, message: "Name is required" });
        }

        const parsedQuantity = Number(quantity);

        if (!Number.isInteger(parsedQuantity) || parsedQuantity < 1) {
            return res.status(400).json({
                success: false,
                message: "Quantity must be a positive integer"
            });
        }

        const normalizedName = name.trim();

        const existing = await GroceryItem.findOne({
            user: req.userId,
            name: normalizedName
        });

        if (existing) {
            /*
               If this is an automatically generated
               grocery item from the meal planner,
               update its quantity instead of creating
               a duplicate.
            */

            if (!Boolean(custom)) {
                existing.quantity = parsedQuantity;
                existing.custom = false;

                const updated = await existing.save();

                return res.json({
                    success: true,
                    data: formatGroceryItem(updated)
                });
            }

            return res.status(409).json({
                success: false,
                message: "Grocery item already exists"
            });
        }

        const item = await GroceryItem.create({
            user: req.userId,
            name: normalizedName,
            quantity: parsedQuantity,
            completed: Boolean(completed),
            custom: Boolean(custom)
        });

        return res.status(201).json({
            success: true,
            data: formatGroceryItem(item)
        });
    } catch (error: any) {
        console.error("Create grocery item error:", error);

        if (error?.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "Grocery item already exists"
            });
        }

        return res.status(500).json({
            success: false,
            message: "Failed to add grocery item"
        });
    }
});

router.patch("/grocery/:id", async (req: AuthenticatedRequest, res: Response) => {
    try {
        const id = String(req.params.id);

        /*
           Frontend sends the MongoDB ObjectId
           as the grocery item's id.
        */

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid grocery item id"
            });
        }

        const item = await GroceryItem.findOne({
            _id: id,
            user: req.userId
        });

        if (!item) {
            return res.status(404).json({
                success: false,
                message: "Grocery item not found"
            });
        }

        /* ---------- COMPLETED ---------- */

        if (typeof req.body.completed === "boolean") {
            item.completed = req.body.completed;
        }

        /*
           Also accept complete from Frontend
           without changing the MongoDB field.
        */

        if (typeof req.body.complete === "boolean") {
            item.completed = req.body.complete;
        }

        /* ---------- QUANTITY ---------- */

        if (req.body.quantity !== undefined) {
            const quantity = Number(req.body.quantity);

            if (!Number.isInteger(quantity) || quantity < 1) {
                return res.status(400).json({
                    success: false,
                    message: "Quantity must be a positive integer"
                });
            }

            item.quantity = quantity;
        }

        /* ---------- NAME ---------- */

        if (typeof req.body.name === "string" && req.body.name.trim()) {
            const newName = req.body.name.trim();

            const existing = await GroceryItem.findOne({
                user: req.userId,
                name: newName,
                _id: { $ne: item._id }
            });

            if (existing) {
                return res.status(409).json({
                    success: false,
                    message: "Grocery item already exists"
                });
            }

            item.name = newName;
        }

        const updatedItem = await item.save();

        return res.json({
            success: true,
            data: formatGroceryItem(updatedItem)
        });
    } catch (error: any) {
        console.error("Update grocery item error:", error);

        if (error?.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "Grocery item already exists"
            });
        }

        return res.status(500).json({
            success: false,
            message: "Failed to update grocery item"
        });
    }
});

router.delete("/grocery/:id", async (req: AuthenticatedRequest, res: Response) => {
    try {
        const id = String(req.params.id);

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid grocery item id"
            });
        }

        const result = await GroceryItem.findOneAndDelete({
            _id: id,
            user: req.userId
        });

        if (!result) {
            return res.status(404).json({
                success: false,
                message: "Grocery item not found"
            });
        }

        return res.json({
            success: true,
            message: "Grocery item deleted"
        });
    } catch (error) {
        console.error("Delete grocery item error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to delete grocery item"
        });
    }
});

export default router;

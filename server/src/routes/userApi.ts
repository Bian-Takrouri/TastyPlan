import { Router, Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppDataSource } from "../data-source.js";
import { Favorite } from "../entities/Favorite.js";
import { MealPlan } from "../entities/MealPlan.js";
import { MealPlanItem, DayOfWeek } from "../entities/MealPlanItem.js";
import { GroceryItem } from "../entities/GroceryItem.js";
import { Recipe } from "../entities/Recipe.js";
import { User } from "../entities/User.js";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "your_super_secret_jwt_key";

interface AuthenticatedRequest extends Request {
    userId?: number;
}

const authenticateUser = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
        return res.status(401).json({ success: false, message: "Unauthorized: Missing token" });
    }

    try {
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
        req.userId = decoded.id;
        next();
    } catch {
        return res.status(403).json({ success: false, message: "Invalid or expired token" });
    }
};

router.use(authenticateUser);

router.get("/favorites", async (req: AuthenticatedRequest, res: Response) => {
    try {
        const repository = AppDataSource.getRepository(Favorite);
        const favorites = await repository.find({
            where: { user: { id: req.userId! } },
            relations: { recipe: { category: true, origin: true, ingredients: true } },
            order: { createdAt: "DESC" }
        });

        res.json({
            success: true,
            data: favorites.map(favorite => favorite.recipe)
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Failed to fetch favorites" });
    }
});

router.post("/favorites/toggle", async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { mealId } = req.body;

        if (!mealId) {
            return res.status(400).json({ success: false, message: "mealId is required" });
        }

        const recipeRepository = AppDataSource.getRepository(Recipe);
        const favoriteRepository = AppDataSource.getRepository(Favorite);

        const recipe = await recipeRepository.findOneBy({ mealId: String(mealId) });

        if (!recipe) {
            return res.status(404).json({ success: false, message: "Recipe not found" });
        }

        const existing = await favoriteRepository.findOne({
            where: {
                user: { id: req.userId! },
                recipe: { id: recipe.id }
            }
        });

        if (existing) {
            await favoriteRepository.remove(existing);
            return res.json({ success: true, isFavorite: false });
        }

        const favorite = favoriteRepository.create({
            user: { id: req.userId! } as User,
            recipe
        });

        await favoriteRepository.save(favorite);
        res.json({ success: true, isFavorite: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Failed to update favorite" });
    }
});

router.get("/meal-plan", async (req: AuthenticatedRequest, res: Response) => {
    try {
        const planRepository = AppDataSource.getRepository(MealPlan);

        const plan = await planRepository.findOne({
            where: { user: { id: req.userId! } },
            relations: { items: { recipe: { category: true, origin: true, ingredients: true } } }
        });

        res.json({
            success: true,
            data: plan?.items ?? []
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Failed to fetch meal plan" });
    }
});

router.post("/meal-plan/item", async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { mealId, dayOfWeek } = req.body as {
            mealId: string;
            dayOfWeek: DayOfWeek;
        };

        if (!mealId || !dayOfWeek) {
            return res.status(400).json({
                success: false,
                message: "mealId and dayOfWeek are required"
            });
        }

        const recipeRepository = AppDataSource.getRepository(Recipe);
        const planRepository = AppDataSource.getRepository(MealPlan);
        const itemRepository = AppDataSource.getRepository(MealPlanItem);

        const recipe = await recipeRepository.findOneBy({ mealId: String(mealId) });

        if (!recipe) {
            return res.status(404).json({ success: false, message: "Recipe not found" });
        }

        let plan = await planRepository.findOne({
            where: { user: { id: req.userId! } }
        });

        if (!plan) {
            plan = planRepository.create({
                user: { id: req.userId! } as User,
                items: []
            });
            await planRepository.save(plan);
        }

        let item = await itemRepository.findOne({
            where: {
                mealPlan: { id: plan.id },
                dayOfWeek
            }
        });

        if (item) {
            item.recipe = recipe;
        } else {
            item = itemRepository.create({
                mealPlan: plan,
                recipe,
                dayOfWeek
            });
        }

        await itemRepository.save(item);

        res.json({ success: true, data: item });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Failed to save meal plan item" });
    }
});

router.delete("/meal-plan/item/:id", async (req: AuthenticatedRequest, res: Response) => {
    try {
        const itemRepository = AppDataSource.getRepository(MealPlanItem);
        const planRepository = AppDataSource.getRepository(MealPlan);

        const plan = await planRepository.findOne({
            where: { user: { id: req.userId! } }
        });

        if (!plan) {
            return res.status(404).json({ success: false, message: "Meal plan not found" });
        }

        const item = await itemRepository.findOne({
            where: {
                id: Number(req.params.id),
                mealPlan: { id: plan.id }
            }
        });

        if (!item) {
            return res.status(404).json({ success: false, message: "Meal plan item not found" });
        }

        await itemRepository.remove(item);
        res.json({ success: true, message: "Meal removed from plan" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Failed to remove meal" });
    }
});

router.get("/grocery", async (req: AuthenticatedRequest, res: Response) => {
    try {
        const repository = AppDataSource.getRepository(GroceryItem);
        const items = await repository.find({
            where: { userId: req.userId! },
            order: { id: "ASC" }
        });

        res.json({ success: true, data: items });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Failed to fetch grocery items" });
    }
});

router.post("/grocery", async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { name, completed, custom } = req.body;

        if (!name?.trim()) {
            return res.status(400).json({ success: false, message: "Name is required" });
        }

        const repository = AppDataSource.getRepository(GroceryItem);

        const item = repository.create({
            userId: req.userId!,
            name: name.trim(),
            completed: completed ?? false,
            custom: custom ?? true
        });

        const savedItem = await repository.save(item);
        res.status(201).json({ success: true, data: savedItem });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Failed to add grocery item" });
    }
});

router.patch("/grocery/:id", async (req: AuthenticatedRequest, res: Response) => {
    try {
        const repository = AppDataSource.getRepository(GroceryItem);
        const { completed } = req.body;

        const item = await repository.findOneBy({
            id: Number(req.params.id),
            userId: req.userId!
        });

        if (!item) {
            return res.status(404).json({ success: false, message: "Grocery item not found" });
        }

        item.completed = Boolean(completed);
        await repository.save(item);

        res.json({ success: true, data: item });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Failed to update grocery item" });
    }
});

router.delete("/grocery/:id", async (req: AuthenticatedRequest, res: Response) => {
    try {
        const repository = AppDataSource.getRepository(GroceryItem);

        const result = await repository.delete({
            id: Number(req.params.id),
            userId: req.userId!
        });

        if (!result.affected) {
            return res.status(404).json({ success: false, message: "Grocery item not found" });
        }

        res.json({ success: true, message: "Grocery item deleted" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Failed to delete grocery item" });
    }
});

export default router;
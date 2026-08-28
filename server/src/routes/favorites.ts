import { Router } from "express";
import { AppDataSource } from "../data-source.js";
import { Favorite } from "../entities/Favorite.js";
import { User } from "../entities/User.js";
import { Recipe } from "../entities/Recipe.js";

const router = Router();
const favoriteRepo = AppDataSource.getRepository(Favorite);

// 1. جلب مفضلات مستخدم معين (GET /api/favorites?userId=1)
router.get("/", async (req, res) => {
    try {
        const userId = Number(req.query.userId);
        if (!userId) {
            return res.status(400).json({ success: false, message: "userId parameter is required" });
        }

        const favorites = await favoriteRepo.find({
            where: { user: { id: userId } },
            relations: { recipe: { category: true, origin: true, ingredients: true } },
            order: { createdAt: "DESC" }
        });

        return res.json({ success: true, data: favorites });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Failed to fetch favorites" });
    }
});

// 2. إضافة وصفة للمفضلة (POST /api/favorites)
router.post("/", async (req, res) => {
    try {
        const { userId, recipeId } = req.body;
        if (!userId || !recipeId) {
            return res.status(400).json({ success: false, message: "userId and recipeId are required" });
        }

        const existing = await favoriteRepo.findOne({
            where: { user: { id: userId }, recipe: { id: recipeId } }
        });

        if (existing) {
            return res.status(400).json({ success: false, message: "Recipe is already in favorites" });
        }

        const favorite = favoriteRepo.create({
            user: { id: userId } as User,
            recipe: { id: recipeId } as Recipe
        });

        await favoriteRepo.save(favorite);
        return res.status(201).json({ success: true, message: "Added to favorites", data: favorite });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Failed to add favorite" });
    }
});

// 3. حذف وصفة من المفضلة (DELETE /api/favorites/:userId/:recipeId)
router.delete("/:userId/:recipeId", async (req, res) => {
    try {
        const userId = Number(req.params.userId);
        const recipeId = Number(req.params.recipeId);

        const result = await favoriteRepo.delete({
            user: { id: userId },
            recipe: { id: recipeId }
        });

        if (result.affected === 0) {
            return res.status(404).json({ success: false, message: "Favorite item not found" });
        }

        return res.json({ success: true, message: "Removed from favorites" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Failed to remove favorite" });
    }
});

export default router;
// import { Router } from "express";
// import { AppDataSource } from "../data-source.js";
// import { MealPlan } from "../entities/MealPlan.js";
// import { MealPlanItem, DayOfWeek } from "../entities/MealPlanItem.js";
// import { User } from "../entities/User.js";
// import { Recipe } from "../entities/Recipe.js";

// const router = Router();
// const planRepo = AppDataSource.getRepository(MealPlan);
// const itemRepo = AppDataSource.getRepository(MealPlanItem);

// // 1. جلب خطة الوجبات للمستخدم (GET /api/meal-plans?userId=1)
// router.get("/", async (req, res) => {
//     try {
//         const userId = Number(req.query.userId);
//         if (!userId) {
//             return res.status(400).json({ success: false, message: "userId parameter is required" });
//         }

//         const plan = await planRepo.findOne({
//             where: { user: { id: userId } },
//             relations: { items: { recipe: true } }
//         });

//         return res.json({ success: true, data: plan || { items: [] } });
//     } catch (error) {
//         console.error(error);
//         return res.status(500).json({ success: false, message: "Failed to fetch meal plan" });
//     }
// });

// // 2. إضافة أو تحديث وجبة ليوم معين (POST /api/meal-plans/item)
// router.post("/item", async (req, res) => {
//     try {
//         const { userId, recipeId, dayOfWeek } = req.body;

//         if (!userId || !recipeId || !dayOfWeek) {
//             return res.status(400).json({ success: false, message: "userId, recipeId, and dayOfWeek are required" });
//         }

//         // جلب أو إنشاء الخطة الرئيسية للمستخدم
//         let plan = await planRepo.findOne({ where: { user: { id: userId } } });
//         if (!plan) {
//             plan = planRepo.create({ user: { id: userId } as User });
//             await planRepo.save(plan);
//         }

//         // التحقق مما إذا كان هناك وجبة مسجلة لهذا اليوم مسبقاً
//         let item = await itemRepo.findOne({
//             where: { mealPlan: { id: plan.id }, dayOfWeek: dayOfWeek as DayOfWeek }
//         });

//         if (item) {
//             item.recipe = { id: recipeId } as Recipe;
//         } else {
//             item = itemRepo.create({
//                 mealPlan: plan,
//                 recipe: { id: recipeId } as Recipe,
//                 dayOfWeek: dayOfWeek as DayOfWeek
//             });
//         }

//         await itemRepo.save(item);
//         return res.json({ success: true, message: "Meal plan updated", data: item });
//     } catch (error) {
//         console.error(error);
//         return res.status(500).json({ success: false, message: "Failed to save meal plan item" });
//     }
// });

// // 3. حذف وجبة يوم معين من الخطة (DELETE /api/meal-plans/item/:itemId)
// router.delete("/item/:itemId", async (req, res) => {
//     try {
//         const itemId = Number(req.params.itemId);
//         const result = await itemRepo.delete(itemId);

//         if (result.affected === 0) {
//             return res.status(404).json({ success: false, message: "Meal plan item not found" });
//         }

//         return res.json({ success: true, message: "Meal plan item deleted" });
//     } catch (error) {
//         console.error(error);
//         return res.status(500).json({ success: false, message: "Failed to delete meal plan item" });
//     }
// });

// export default router;
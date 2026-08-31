import { Router,Request,Response,NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppDataSource } from "../data-source.js";
import { Favorite } from "../entities/Favorite.js";
import { MealPlanItem,DayOfWeek } from "../entities/MealPlanItem.js";
import { GroceryItem } from "../entities/GroceryItem.js";
import { Recipe } from "../entities/Recipe.js";
import { User } from "../entities/User.js";

const router=Router();
const JWT_SECRET=process.env.JWT_SECRET||"your_super_secret_jwt_key";

interface AuthenticatedRequest extends Request {
    userId?: number;
}

function authenticateUser(req:AuthenticatedRequest,res:Response,next:NextFunction) {
    const authHeader=req.headers.authorization;
    if(!authHeader?.startsWith("Bearer ")) {
        return res.status(401).json({success:false,message:"Unauthorized: Missing token"});
    }
    try {
        const token=authHeader.slice(7);
        const decoded=jwt.verify(token,JWT_SECRET) as {id:number};
        req.userId=decoded.id;
        next();
    } catch {
        return res.status(403).json({success:false,message:"Invalid or expired token"});
    }
}

router.use(authenticateUser);

/* =========================
   FAVORITES
========================= */

router.get("/favorites",async(req:AuthenticatedRequest,res:Response)=>{
    try {
        const repository=AppDataSource.getRepository(Favorite);
        const favorites=await repository.find({
            where:{user:{id:req.userId!}},
            relations:{recipe:{category:true,origin:true,ingredients:true}},
            order:{createdAt:"DESC"}
        });
        return res.json({success:true,data:favorites.map(favorite=>favorite.recipe)});
    } catch(error) {
        console.error(error);
        return res.status(500).json({success:false,message:"Failed to fetch favorites"});
    }
});

router.post("/favorites/toggle",async(req:AuthenticatedRequest,res:Response)=>{
    try {
        const {mealId}=req.body;
        if(!mealId) return res.status(400).json({success:false,message:"mealId is required"});

        const recipeRepository=AppDataSource.getRepository(Recipe);
        const favoriteRepository=AppDataSource.getRepository(Favorite);

        const recipe=await recipeRepository.findOne({where:{mealId:String(mealId)}});
        if(!recipe) return res.status(404).json({success:false,message:"Recipe not found"});

        const existing=await favoriteRepository.findOne({
            where:{user:{id:req.userId!},recipe:{id:recipe.id}}
        });

        if(existing) {
            await favoriteRepository.remove(existing);
            return res.json({success:true,isFavorite:false});
        }

        const favorite=favoriteRepository.create({
            user:{id:req.userId!} as User,
            recipe
        });
        await favoriteRepository.save(favorite);
        return res.json({success:true,isFavorite:true});
    } catch(error) {
        console.error(error);
        return res.status(500).json({success:false,message:"Failed to update favorite"});
    }
});

/* =========================
   MEAL PLAN
========================= */

router.get("/meal-plan",async(req:AuthenticatedRequest,res:Response)=>{
    try {
        const repository=AppDataSource.getRepository(MealPlanItem);
        const items=await repository.find({
            where:{user:{id:req.userId!}},
            relations:{recipe:{category:true,origin:true,ingredients:true}}
        });
        return res.json({success:true,data:items});
    } catch(error) {
        console.error(error);
        return res.status(500).json({success:false,message:"Failed to fetch meal plan"});
    }
});

router.post("/meal-plan/item",async(req:AuthenticatedRequest,res:Response)=>{
    try {
        const {mealId,dayOfWeek}=req.body as {mealId:string;dayOfWeek:DayOfWeek};
        const validDays:DayOfWeek[]=["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

        if(!mealId||!dayOfWeek||!validDays.includes(dayOfWeek)) {
            return res.status(400).json({success:false,message:"Valid mealId and dayOfWeek are required"});
        }

        const recipeRepository=AppDataSource.getRepository(Recipe);
        const itemRepository=AppDataSource.getRepository(MealPlanItem);

        const recipe=await recipeRepository.findOne({where:{mealId:String(mealId)}});
        if(!recipe) return res.status(404).json({success:false,message:"Recipe not found"});

        let item=await itemRepository.findOne({
            where:{user:{id:req.userId!},dayOfWeek},
            relations:{recipe:true}
        });

        if(item) {
            item.recipe=recipe;
        } else {
            item=itemRepository.create({
                user:{id:req.userId!} as User,
                recipe,
                dayOfWeek
            });
        }

        await itemRepository.save(item);
        return res.json({success:true,data:item});
    } catch(error) {
        console.error(error);
        return res.status(500).json({success:false,message:"Failed to save meal plan item"});
    }
});

router.delete("/meal-plan/item/:id",async(req:AuthenticatedRequest,res:Response)=>{
    try {
        const itemRepository=AppDataSource.getRepository(MealPlanItem);
        const item=await itemRepository.findOne({
            where:{id:Number(req.params.id),user:{id:req.userId!}}
        });

        if(!item) return res.status(404).json({success:false,message:"Meal plan item not found"});

        await itemRepository.remove(item);
        return res.json({success:true,message:"Meal removed from plan"});
    } catch(error) {
        console.error(error);
        return res.status(500).json({success:false,message:"Failed to remove meal"});
    }
});

router.delete("/meal-plan",async(req:AuthenticatedRequest,res:Response)=>{
    try {
        const repository=AppDataSource.getRepository(MealPlanItem);
        await repository.delete({user:{id:req.userId!}});
        return res.json({success:true,message:"Meal plan cleared"});
    } catch(error) {
        console.error(error);
        return res.status(500).json({success:false,message:"Failed to clear meal plan"});
    }
});

/* =========================
   GROCERY
========================= */

router.get(
    "/grocery",
    async (
        req: AuthenticatedRequest,
        res: Response
    ) => {
        try {
            const repository =
                AppDataSource.getRepository(GroceryItem);

            const items =
                await repository.find({
                    where: {
                        userId: req.userId!
                    },
                    order: {
                        id: "ASC"
                    }
                });

            return res.json({
                success: true,
                data: items
            });
        } catch (error) {
            console.error(error);

            return res.status(500).json({
                success: false,
                message: "Failed to fetch grocery items"
            });
        }
    }
);

router.post(
    "/grocery",
    async (
        req: AuthenticatedRequest,
        res: Response
    ) => {
        try {
            const {
                name,
                quantity = 1,
                completed = false,
                custom = true
            } = req.body;

            if (!name?.trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Name is required"
                });
            }

            const parsedQuantity = Number(quantity);

            if (
                !Number.isInteger(parsedQuantity) ||
                parsedQuantity < 1
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Quantity must be a positive integer"
                });
            }

            const repository =
                AppDataSource.getRepository(GroceryItem);

            const normalizedName = name.trim();

            const existing = await repository
                .createQueryBuilder("grocery")
                .where("grocery.user_id = :userId", {
                    userId: req.userId!
                })
                .andWhere("LOWER(grocery.name) = LOWER(:name)", {
                    name: normalizedName
                })
                .getOne();

            if (existing) {
                if (!Boolean(custom)) {
                    existing.quantity = parsedQuantity;
                    existing.custom = false;

                    const updated =
                        await repository.save(existing);

                    return res.json({
                        success: true,
                        data: updated
                    });
                }

                return res.status(409).json({
                    success: false,
                    message: "Grocery item already exists"
                });
            }

            const item = repository.create({
                userId: req.userId!,
                name: normalizedName,
                quantity: parsedQuantity,
                completed: Boolean(completed),
                custom: Boolean(custom)
            });

            try {
                const savedItem =
                    await repository.save(item);

                return res.status(201).json({
                    success: true,
                    data: savedItem
                });
            } catch (error: any) {
                if (
                    error?.code === "ER_DUP_ENTRY"
                ) {
                    const duplicatedItem =
                        await repository
                            .createQueryBuilder("grocery")
                            .where("grocery.user_id = :userId", {
                                userId: req.userId!
                            })
                            .andWhere(
                                "LOWER(grocery.name) = LOWER(:name)",
                                {
                                    name: normalizedName
                                }
                            )
                            .getOne();

                    if (
                        duplicatedItem &&
                        !Boolean(custom)
                    ) {
                        duplicatedItem.quantity =
                            parsedQuantity;

                        duplicatedItem.custom = false;

                        const updated =
                            await repository.save(
                                duplicatedItem
                            );

                        return res.json({
                            success: true,
                            data: updated
                        });
                    }

                    return res.status(409).json({
                        success: false,
                        message:
                            "Grocery item already exists"
                    });
                }

                throw error;
            }
        } catch (error) {
            console.error(error);

            return res.status(500).json({
                success: false,
                message:
                    "Failed to add grocery item"
            });
        }
    }
);

router.patch(
    "/grocery/:id",
    async (
        req: AuthenticatedRequest,
        res: Response
    ) => {
        try {
            const repository =
                AppDataSource.getRepository(GroceryItem);

            const item =
                await repository.findOne({
                    where: {
                        id: Number(req.params.id),
                        userId: req.userId!
                    }
                });

            if (!item) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Grocery item not found"
                });
            }

            if (
                typeof req.body.completed ===
                "boolean"
            ) {
                item.completed =
                    req.body.completed;
            }

            if (
                typeof req.body.quantity !==
                "undefined"
            ) {
                const quantity =
                    Number(req.body.quantity);

                if (
                    !Number.isInteger(quantity) ||
                    quantity < 1
                ) {
                    return res.status(400).json({
                        success: false,
                        message:
                            "Quantity must be a positive integer"
                    });
                }

                item.quantity = quantity;
            }

            if (
                typeof req.body.name ===
                "string" &&
                req.body.name.trim()
            ) {
                const newName =
                    req.body.name.trim();

                const existing =
                    await repository.findOne({
                        where: {
                            userId: req.userId!,
                            name: newName
                        }
                    });

                if (
                    existing &&
                    existing.id !== item.id
                ) {
                    return res.status(409).json({
                        success: false,
                        message:
                            "Grocery item already exists"
                    });
                }

                item.name = newName;
            }

            const updatedItem =
                await repository.save(item);

            return res.json({
                success: true,
                data: updatedItem
            });
        } catch (error) {
            console.error(error);

            return res.status(500).json({
                success: false,
                message:
                    "Failed to update grocery item"
            });
        }
    }
);

router.delete(
    "/grocery/:id",
    async (
        req: AuthenticatedRequest,
        res: Response
    ) => {
        try {
            const repository =
                AppDataSource.getRepository(GroceryItem);

            const result =
                await repository.delete({
                    id: Number(req.params.id),
                    userId: req.userId!
                });

            if (!result.affected) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Grocery item not found"
                });
            }

            return res.json({
                success: true,
                message:
                    "Grocery item deleted"
            });
        } catch (error) {
            console.error(error);

            return res.status(500).json({
                success: false,
                message:
                    "Failed to delete grocery item"
            });
        }
    }
);
export default router;
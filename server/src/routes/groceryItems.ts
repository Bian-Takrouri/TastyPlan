import { Router } from "express";
import mongoose from "mongoose";

import { GroceryItem } from "../entities/GroceryItem.js";
import { User } from "../entities/User.js";

const router = Router();

/* =====================================================
   GET USER GROCERY ITEMS
===================================================== */

router.get(
    "/user/:userId",
    async (req, res) => {
        try {
            const { userId } =
                req.params;

            if (
                !mongoose.Types.ObjectId.isValid(
                    userId
                )
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid user id"
                });
            }

            const items =
                await GroceryItem.find({
                    user: userId
                })
                    .sort({ _id: 1 })
                    .lean();

            return res.json({
                success: true,
                data: items
            });
        } catch (error) {
            console.error(
                "Get grocery items error:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    "Failed to fetch grocery items"
            });
        }
    }
);

/* =====================================================
   CREATE GROCERY ITEM
===================================================== */

router.post("/", async (req, res) => {
    try {
        const {
            userId,
            name,
            quantity = 1,
            completed = false,
            custom = false
        } = req.body;

        if (
            !userId ||
            !mongoose.Types.ObjectId.isValid(
                String(userId)
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Valid userId is required"
            });
        }

        if (
            typeof name !== "string" ||
            !name.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Name is required"
            });
        }

        const parsedQuantity =
            Number(quantity);

        if (
            !Number.isInteger(
                parsedQuantity
            ) ||
            parsedQuantity < 1
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Quantity must be a positive integer"
            });
        }

        const user =
            await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const normalizedName =
            name.trim();

        const existing =
            await GroceryItem.findOne({
                user: user._id,
                name: normalizedName
            });

        if (existing) {
            return res.status(409).json({
                success: false,
                message:
                    "Grocery item already exists"
            });
        }

        const item =
            await GroceryItem.create({
                user: user._id,
                name: normalizedName,
                quantity: parsedQuantity,
                completed: Boolean(completed),
                custom: Boolean(custom)
            });

        return res.status(201).json({
            success: true,
            data: item
        });
    } catch (error: any) {
        console.error(
            "Create grocery item error:",
            error
        );

        if (error?.code === 11000) {
            return res.status(409).json({
                success: false,
                message:
                    "Grocery item already exists"
            });
        }

        return res.status(500).json({
            success: false,
            message:
                "Failed to create grocery item"
        });
    }
});

/* =====================================================
   UPDATE GROCERY ITEM
===================================================== */

router.put("/:id", async (req, res) => {
    try {
        const { id } =
            req.params;

        if (
            !mongoose.Types.ObjectId.isValid(
                id
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid grocery item id"
            });
        }

        const {
            name,
            quantity,
            completed,
            custom
        } = req.body;

        const item =
            await GroceryItem.findById(id);

        if (!item) {
            return res.status(404).json({
                success: false,
                message:
                    "Grocery item not found"
            });
        }

        if (name !== undefined) {
            if (
                typeof name !== "string" ||
                !name.trim()
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Name cannot be empty"
                });
            }

            const normalizedName =
                name.trim();

            const existing =
                await GroceryItem.findOne({
                    user: item.user,
                    name: normalizedName,
                    _id: {
                        $ne: item._id
                    }
                });

            if (existing) {
                return res.status(409).json({
                    success: false,
                    message:
                        "Grocery item already exists"
                });
            }

            item.name =
                normalizedName;
        }

        if (quantity !== undefined) {
            const parsedQuantity =
                Number(quantity);

            if (
                !Number.isInteger(
                    parsedQuantity
                ) ||
                parsedQuantity < 1
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Quantity must be a positive integer"
                });
            }

            item.quantity =
                parsedQuantity;
        }

        if (
            completed !== undefined
        ) {
            item.completed =
                Boolean(completed);
        }

        if (
            custom !== undefined
        ) {
            item.custom =
                Boolean(custom);
        }

        const updatedItem =
            await item.save();

        return res.json({
            success: true,
            data: updatedItem
        });
    } catch (error: any) {
        console.error(
            "Update grocery item error:",
            error
        );

        if (error?.code === 11000) {
            return res.status(409).json({
                success: false,
                message:
                    "Grocery item already exists"
            });
        }

        return res.status(500).json({
            success: false,
            message:
                "Failed to update grocery item"
        });
    }
});

/* =====================================================
   DELETE GROCERY ITEM
===================================================== */

router.delete("/:id", async (req, res) => {
    try {
        const { id } =
            req.params;

        if (
            !mongoose.Types.ObjectId.isValid(
                id
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid grocery item id"
            });
        }

        const item =
            await GroceryItem.findById(id);

        if (!item) {
            return res.status(404).json({
                success: false,
                message:
                    "Grocery item not found"
            });
        }

        await GroceryItem.deleteOne({
            _id: item._id
        });

        return res.json({
            success: true,
            message:
                "Grocery item deleted successfully"
        });
    } catch (error) {
        console.error(
            "Delete grocery item error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to delete grocery item"
        });
    }
});

export default router;
// import { Router } from "express";
// import { AppDataSource } from "../data-source.js";
// import { GroceryItem } from "../entities/GroceryItem.js";
// import { User } from "../entities/User.js";

// const router = Router();

// router.get("/user/:userId", async (req, res) => {
//     try {
//         const userId = Number(req.params.userId);
//         const groceryRepository = AppDataSource.getRepository(GroceryItem);
//         const items = await groceryRepository.find({where: {userId}});
//         res.json({
//             success: true,
//             data: items
//         });

//     } catch (error) {
//         console.error(error);
//         res.status(500).json({
//             success: false,
//             message: "Failed to fetch grocery items"
//         });
//     }
// });
// router.post("/", async (req, res) => {
//     try {
//         const {
//             userId,
//             name,
//             completed,
//             custom
//         } = req.body;

//         const userRepository = AppDataSource.getRepository(User);
//         const groceryRepository = AppDataSource.getRepository(GroceryItem);
//         const user = await userRepository.findOneBy({ id: userId });
//         if (!user) {
//             return res.status(404).json({
//                 success: false,
//                 message: "User not found"
//             });
//         }
//         const item = groceryRepository.create({
//             userId,
//             name,
//             completed: completed ?? false,
//             custom: custom ?? false
//         });
//         const savedItem = await groceryRepository.save(item);
//         res.status(201).json({
//             success: true,
//             data: savedItem
//         });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({
//             success: false,
//             message: "Failed to create grocery item"
//         });
//     }
// });
// router.put("/:id", async (req, res) => {
//     try {
//         const id = Number(req.params.id);
//         const {
//             name,
//             completed,
//             custom
//         } = req.body;
//         const groceryRepository = AppDataSource.getRepository(GroceryItem);
//         const item = await groceryRepository.findOneBy({ id });
//         if (!item) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Grocery item not found"
//             });
//         }
//         item.name = name;
//         item.completed = completed;
//         item.custom = custom;
//         const updatedItem = await groceryRepository.save(item);
//         res.json({
//             success: true,
//             data: updatedItem
//         });
//     } catch (error) {
//         console.error(error);

//         res.status(500).json({
//             success: false,
//             message: "Failed to update grocery item"
//         });
//     }
// });
// router.delete("/:id", async (req, res) => {
//     try {
//         const id = Number(req.params.id);
//         const groceryRepository = AppDataSource.getRepository(GroceryItem);
//         const item = await groceryRepository.findOneBy({ id });
//         if (!item) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Grocery item not found"
//             });
//         }
//         await groceryRepository.remove(item);
//         res.json({
//             success: true,
//             message: "Grocery item deleted successfully"
//         });
//     } catch (error) {
//         console.error(error);

//         res.status(500).json({
//             success: false,
//             message: "Failed to delete grocery item"
//         });
//     }
// });
// export default router;
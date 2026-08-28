import { Router } from "express";
import { AppDataSource } from "../data-source.js";
import { GroceryItem } from "../entities/GroceryItem.js";
import { User } from "../entities/User.js";

const router = Router();

router.get("/user/:userId", async (req, res) => {
    try {
        const userId = Number(req.params.userId);
        const groceryRepository = AppDataSource.getRepository(GroceryItem);
        const items = await groceryRepository.find({where: {userId}});
        res.json({
            success: true,
            data: items
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch grocery items"
        });
    }
});
router.post("/", async (req, res) => {
    try {
        const {
            userId,
            name,
            completed,
            custom
        } = req.body;

        const userRepository = AppDataSource.getRepository(User);
        const groceryRepository = AppDataSource.getRepository(GroceryItem);
        const user = await userRepository.findOneBy({ id: userId });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        const item = groceryRepository.create({
            userId,
            name,
            completed: completed ?? false,
            custom: custom ?? false
        });
        const savedItem = await groceryRepository.save(item);
        res.status(201).json({
            success: true,
            data: savedItem
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to create grocery item"
        });
    }
});
router.put("/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);
        const {
            name,
            completed,
            custom
        } = req.body;
        const groceryRepository = AppDataSource.getRepository(GroceryItem);
        const item = await groceryRepository.findOneBy({ id });
        if (!item) {
            return res.status(404).json({
                success: false,
                message: "Grocery item not found"
            });
        }
        item.name = name;
        item.completed = completed;
        item.custom = custom;
        const updatedItem = await groceryRepository.save(item);
        res.json({
            success: true,
            data: updatedItem
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to update grocery item"
        });
    }
});
router.delete("/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);
        const groceryRepository = AppDataSource.getRepository(GroceryItem);
        const item = await groceryRepository.findOneBy({ id });
        if (!item) {
            return res.status(404).json({
                success: false,
                message: "Grocery item not found"
            });
        }
        await groceryRepository.remove(item);
        res.json({
            success: true,
            message: "Grocery item deleted successfully"
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to delete grocery item"
        });
    }
});
export default router;
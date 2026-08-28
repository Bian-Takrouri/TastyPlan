import { Router } from "express";
import { AppDataSource } from "../data-source.js";
import { Category } from "../entities/Category.js";

const router = Router();
router.get("/", async (_req, res) => {
    try {
        const categoryRepository = AppDataSource.getRepository(Category);
        const categories = await categoryRepository.find();
        res.json({
            success: true,
            data: categories
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch categories"
        })
    }
})
router.post("/", async (req, res) => {
    try {
        const { name, description, imageUrl } = req.body;
        const categoryRepository = AppDataSource.getRepository(Category);
        const category = categoryRepository.create({ name, description, imageUrl });
        const savedCategory = await categoryRepository.save(category);
        res.status(201).json({
            success: true,
            data: savedCategory
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to create category"
        })
    }
})
router.put("/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { name, description, imageUrl } = req.body;
        const categoryRepository = AppDataSource.getRepository(Category);
        const category = await categoryRepository.findOneBy({ id })
        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            })
        }
        category.name = name;
        category.description = description;
        category.imageUrl = imageUrl;
        const updatedCategory = await categoryRepository.save(category);
        res.status(200).json({
            success: true,
            data: updatedCategory
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to update category"
        })
    }
})
router.delete("/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);
        const categoryRepository = AppDataSource.getRepository(Category);
        const category = await categoryRepository.findOneBy({ id })
        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            })
        }
        await categoryRepository.remove(category);
        res.json({
            success: true,
            message: "Category deleted successfully"
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to delete category"
        })
    }
})
export default router;


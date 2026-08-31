import { Router } from "express";
import mongoose from "mongoose";

import { Category } from "../entities/Category.js";

const router = Router();

/* =====================================================
   GET ALL CATEGORIES
===================================================== */

router.get("/", async (_req, res) => {
    try {
        const categories = await Category.find()
            .sort({ name: 1 })
            .lean();

        return res.json({
            success: true,
            data: categories
        });
    } catch (error) {
        console.error("Get categories error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch categories"
        });
    }
});

/* =====================================================
   CREATE CATEGORY
===================================================== */

router.post("/", async (req, res) => {
    try {
        const {
            name,
            description,
            imageUrl
        } = req.body;

        if (
            typeof name !== "string" ||
            !name.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Name is required"
            });
        }

        const normalizedName =
            name.trim();

        const existing =
            await Category.findOne({
                name: normalizedName
            });

        if (existing) {
            return res.status(409).json({
                success: false,
                message:
                    "Category already exists"
            });
        }

        const category =
            await Category.create({
                name: normalizedName,

                description:
                    typeof description === "string" &&
                    description.trim() !== ""
                        ? description.trim()
                        : null,

                imageUrl:
                    typeof imageUrl === "string" &&
                    imageUrl.trim() !== ""
                        ? imageUrl.trim()
                        : null
            });

        return res.status(201).json({
            success: true,
            data: category
        });
    } catch (error: any) {
        console.error(
            "Create category error:",
            error
        );

        if (error?.code === 11000) {
            return res.status(409).json({
                success: false,
                message:
                    "Category already exists"
            });
        }

        return res.status(500).json({
            success: false,
            message: "Failed to create category"
        });
    }
});

/* =====================================================
   UPDATE CATEGORY
===================================================== */

router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        if (
            !mongoose.Types.ObjectId.isValid(id)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid category id"
            });
        }

        const {
            name,
            description,
            imageUrl
        } = req.body;

        const category =
            await Category.findById(id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
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

            category.name =
                name.trim();
        }

        if (description !== undefined) {
            category.description =
                typeof description === "string" &&
                description.trim() !== ""
                    ? description.trim()
                    : null;
        }

        if (imageUrl !== undefined) {
            category.imageUrl =
                typeof imageUrl === "string" &&
                imageUrl.trim() !== ""
                    ? imageUrl.trim()
                    : null;
        }

        const updatedCategory =
            await category.save();

        return res.json({
            success: true,
            data: updatedCategory
        });
    } catch (error: any) {
        console.error(
            "Update category error:",
            error
        );

        if (error?.code === 11000) {
            return res.status(409).json({
                success: false,
                message:
                    "Category already exists"
            });
        }

        return res.status(500).json({
            success: false,
            message: "Failed to update category"
        });
    }
});

/* =====================================================
   DELETE CATEGORY
===================================================== */

router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        if (
            !mongoose.Types.ObjectId.isValid(id)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid category id"
            });
        }

        const category =
            await Category.findById(id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }

        await Category.deleteOne({
            _id: category._id
        });

        return res.json({
            success: true,
            message:
                "Category deleted successfully"
        });
    } catch (error) {
        console.error(
            "Delete category error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to delete category"
        });
    }
});

export default router;

// import { Router } from "express";
// import { AppDataSource } from "../data-source.js";
// import { Category } from "../entities/Category.js";

// const router = Router();
// router.get("/", async (_req, res) => {
//     try {
//         const categoryRepository = AppDataSource.getRepository(Category);
//         const categories = await categoryRepository.find();
//         res.json({
//             success: true,
//             data: categories
//         })
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({
//             success: false,
//             message: "Failed to fetch categories"
//         })
//     }
// })
// router.post("/", async (req, res) => {
//     try {
//         const { name, description, imageUrl } = req.body;
//         const categoryRepository = AppDataSource.getRepository(Category);
//         const category = categoryRepository.create({ name, description, imageUrl });
//         const savedCategory = await categoryRepository.save(category);
//         res.status(201).json({
//             success: true,
//             data: savedCategory
//         })
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({
//             success: false,
//             message: "Failed to create category"
//         })
//     }
// })
// router.put("/:id", async (req, res) => {
//     try {
//         const id = Number(req.params.id);
//         const { name, description, imageUrl } = req.body;
//         const categoryRepository = AppDataSource.getRepository(Category);
//         const category = await categoryRepository.findOneBy({ id })
//         if (!category) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Category not found"
//             })
//         }
//         category.name = name;
//         category.description = description;
//         category.imageUrl = imageUrl;
//         const updatedCategory = await categoryRepository.save(category);
//         res.status(200).json({
//             success: true,
//             data: updatedCategory
//         })
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({
//             success: false,
//             message: "Failed to update category"
//         })
//     }
// })
// router.delete("/:id", async (req, res) => {
//     try {
//         const id = Number(req.params.id);
//         const categoryRepository = AppDataSource.getRepository(Category);
//         const category = await categoryRepository.findOneBy({ id })
//         if (!category) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Category not found"
//             })
//         }
//         await categoryRepository.remove(category);
//         res.json({
//             success: true,
//             message: "Category deleted successfully"
//         });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({
//             success: false,
//             message: "Failed to delete category"
//         })
//     }
// })
// export default router;


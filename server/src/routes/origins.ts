import { Router } from "express";
import mongoose from "mongoose";

import { Origin } from "../entities/Origin.js";

const router = Router();

/* =====================================================
   GET ALL ORIGINS
===================================================== */

router.get("/", async (_req, res) => {
    try {
        const origins = await Origin.find()
            .sort({ name: 1 })
            .lean();

        return res.json({
            success: true,
            data: origins
        });
    } catch (error) {
        console.error(
            "Get origins error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to fetch origins"
        });
    }
});

/* =====================================================
   CREATE ORIGIN
===================================================== */

router.post("/", async (req, res) => {
    try {
        const {
            name,
            country,
            flagUrl
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
            await Origin.findOne({
                name: normalizedName
            });

        if (existing) {
            return res.status(409).json({
                success: false,
                message:
                    "Origin already exists"
            });
        }

        const origin =
            await Origin.create({
                name: normalizedName,

                country:
                    typeof country === "string" &&
                    country.trim() !== ""
                        ? country.trim()
                        : null,

                flagUrl:
                    typeof flagUrl === "string" &&
                    flagUrl.trim() !== ""
                        ? flagUrl.trim()
                        : null
            });

        return res.status(201).json({
            success: true,
            data: origin
        });
    } catch (error: any) {
        console.error(
            "Create origin error:",
            error
        );

        if (error?.code === 11000) {
            return res.status(409).json({
                success: false,
                message:
                    "Origin already exists"
            });
        }

        return res.status(500).json({
            success: false,
            message: "Failed to create origin"
        });
    }
});

/* =====================================================
   UPDATE ORIGIN
===================================================== */

router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        if (
            !mongoose.Types.ObjectId.isValid(id)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid origin id"
            });
        }

        const {
            name,
            country,
            flagUrl
        } = req.body;

        const origin =
            await Origin.findById(id);

        if (!origin) {
            return res.status(404).json({
                success: false,
                message: "Origin not found"
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

            origin.name =
                name.trim();
        }

        if (country !== undefined) {
            origin.country =
                typeof country === "string" &&
                country.trim() !== ""
                    ? country.trim()
                    : null;
        }

        if (flagUrl !== undefined) {
            origin.flagUrl =
                typeof flagUrl === "string" &&
                flagUrl.trim() !== ""
                    ? flagUrl.trim()
                    : null;
        }

        const updatedOrigin =
            await origin.save();

        return res.json({
            success: true,
            data: updatedOrigin
        });
    } catch (error: any) {
        console.error(
            "Update origin error:",
            error
        );

        if (error?.code === 11000) {
            return res.status(409).json({
                success: false,
                message:
                    "Origin already exists"
            });
        }

        return res.status(500).json({
            success: false,
            message: "Failed to update origin"
        });
    }
});

/* =====================================================
   DELETE ORIGIN
===================================================== */

router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        if (
            !mongoose.Types.ObjectId.isValid(id)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid origin id"
            });
        }

        const origin =
            await Origin.findById(id);

        if (!origin) {
            return res.status(404).json({
                success: false,
                message: "Origin not found"
            });
        }

        await Origin.deleteOne({
            _id: origin._id
        });

        return res.json({
            success: true,
            message:
                "Origin deleted successfully"
        });
    } catch (error) {
        console.error(
            "Delete origin error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to delete origin"
        });
    }
});

export default router;
// import { Router } from "express";
// import { AppDataSource } from "../data-source.js";
// import { Origin } from "../entities/Origin.js";

// const router = Router();
// router.get("/", async (_req, res) => {
//     try {
//         const originRepository = AppDataSource.getRepository(Origin);
//         const origins = await originRepository.find();
//         res.json({
//             success: true,
//             data: origins
//         })
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({
//             success: false,
//             message: "Failed to fetch origins"
//         })
//     }
// })
// router.post("/", async (req, res) => {
//     try {
//         const { name, country, flagUrl } = req.body;
//         const originRepository = AppDataSource.getRepository(Origin);
//         const origin = originRepository.create({ name,country, flagUrl });
//         const savedOrigin = await originRepository.save(origin);
//         res.status(201).json({
//             success: true,
//             data: savedOrigin
//         })
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({
//             success: false,
//             message: "Failed to create origin"
//         })
//     }
// })
// router.put("/:id", async (req, res) => {
//     try {
//         const id = Number(req.params.id);
//         const { name, country, flagUrl } = req.body;
//         const originRepository = AppDataSource.getRepository(Origin);
//         const origin = await originRepository.findOneBy({ id })
//         if (!origin) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Origin not found"
//             })
//         }
//         origin.name = name;
//         origin.country =country ;
//         origin.flagUrl=flagUrl;

//         const updatedOrigin= await originRepository.save(origin);
//         res.status(200).json({
//             success: true,
//             data: updatedOrigin
//         })
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({
//             success: false,
//             message: "Failed to update origin"
//         })
//     }
// })
// router.delete("/:id", async (req, res) => {
//     try {
//         const id = Number(req.params.id);
//         const originRepository = AppDataSource.getRepository(Origin);
//         const origin = await originRepository.findOneBy({ id })
//         if (!origin) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Origin not found"
//             })
//         }
//         await originRepository.remove(origin);
//         res.json({
//             success: true,
//             message: "Origin deleted successfully"
//         });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({
//             success: false,
//             message: "Failed to delete origin"
//         })
//     }
// })
// export default router;


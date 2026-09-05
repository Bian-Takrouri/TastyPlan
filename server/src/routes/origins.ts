import { Router } from "express";
import { AppDataSource } from "../data-source.js";
import { Origin } from "../entities/Origin.js";

const router = Router();

router.get("/", async (_req, res) => {
    try {
        const originRepository = AppDataSource.getRepository(Origin);
        const origins = await originRepository.find();

        res.json({
            success: true,
            data: origins
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch origins"
        });
    }
});

export default router;
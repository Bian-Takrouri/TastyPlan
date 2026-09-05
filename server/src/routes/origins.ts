import { Router } from "express";
import { Origin } from "../entities/Origin.js";

const router = Router();

router.get("/", async (_req, res) => {
    try {
        const origins = await Origin.find();
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
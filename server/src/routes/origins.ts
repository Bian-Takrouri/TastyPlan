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
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch origins"
        })
    }
})
router.post("/", async (req, res) => {
    try {
        const { name, country, flagUrl } = req.body;
        const originRepository = AppDataSource.getRepository(Origin);
        const origin = originRepository.create({ name,country, flagUrl });
        const savedOrigin = await originRepository.save(origin);
        res.status(201).json({
            success: true,
            data: savedOrigin
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to create origin"
        })
    }
})
router.put("/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { name, country, flagUrl } = req.body;
        const originRepository = AppDataSource.getRepository(Origin);
        const origin = await originRepository.findOneBy({ id })
        if (!origin) {
            return res.status(404).json({
                success: false,
                message: "Origin not found"
            })
        }
        origin.name = name;
        origin.country =country ;
        origin.flagUrl=flagUrl;

        const updatedOrigin= await originRepository.save(origin);
        res.status(200).json({
            success: true,
            data: updatedOrigin
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to update origin"
        })
    }
})
router.delete("/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);
        const originRepository = AppDataSource.getRepository(Origin);
        const origin = await originRepository.findOneBy({ id })
        if (!origin) {
            return res.status(404).json({
                success: false,
                message: "Origin not found"
            })
        }
        await originRepository.remove(origin);
        res.json({
            success: true,
            message: "Origin deleted successfully"
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to delete origin"
        })
    }
})
export default router;


import { addScoreToTrainer } from "../database";
import express from "express";

export default function quizePointsRoute() {
    const router = express.Router();

    router.post("/trainer/add-points", async (req, res) => {
        const { trainerName, points } = req.body;
        try {
            await addScoreToTrainer(trainerName, points);
            res.status(200).json({ success: true });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: "Failed to add points!" })
        }
    })
    return router;
}
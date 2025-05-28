import express from "express";
import { Trainer } from "../types";
import { addTeam, getTrainerWithPokemons, PokemonCollection, removeFromTeam } from "../database";
import { ObjectId } from "mongodb";

export default function teamRoute() {
    const router = express.Router();

    router.get("/team", async (req, res) => {
        const trainerSession = req.session.trainer;

        if (!trainerSession || !trainerSession._id) {
            res.redirect("/new-game");
            return;
        }

        const trainerId: string | undefined = req.session.trainer?._id?.toString();
        if (!trainerId || typeof trainerId !== "string" || !ObjectId.isValid(trainerId)) {
            res.status(400).send("Invalid trainer ID.");
            return;
        }
        const objectId = new ObjectId(trainerId);
        const result = await getTrainerWithPokemons(trainerId);
        if (result) {
            const { trainer, pokemons, team } = result;
            res.render("team", { trainer, pokemons, team });
        } else {
            res.status(404).send("Trainer not found.");

        }
    });

    router.post("/team/add", async (req, res) => {
        const trainerSession = req.session.trainer;
        if (!trainerSession || !trainerSession._id) {
            return res.redirect("/new-game");
        };
        const pokemonId = req.body.pokemonId;
        const trainerId: string | undefined = req.session.trainer?._id?.toString();
        if (!trainerId || typeof trainerId !== "string" || !ObjectId.isValid(trainerId)) {
            res.status(400).send("Invalid trainer ID.");
            console.log(trainerId);
            return;
        }
        const objectId = new ObjectId(trainerId);
        await addTeam(pokemonId, trainerId);
        res.redirect("/team");
    });
    router.post("/team/remove", async (req, res) => {
        const trainerSession = req.session.trainer;
        if (!trainerSession || !trainerSession._id) {
            return res.redirect("/new-game");
        };
        const pokemonId = req.body.pokemonId;
        const trainerId: string | undefined = req.session.trainer?._id?.toString();
        if (!trainerId || typeof trainerId !== "string" || !ObjectId.isValid(trainerId)) {
            res.status(400).send("Invalid trainer ID.");
            res.redirect("/404")
            return;
        }
        const objectId = new ObjectId(trainerId);
        await removeFromTeam(pokemonId, trainerId);
        res.redirect("/team");
    })

    return router;
}
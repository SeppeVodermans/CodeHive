import { addScoreToTrainer, getRandomPokemonQuizData } from "../database";
import { PokemonQuizdata } from "../types";
import express, { Router } from "express";
let currentPokemon: PokemonQuizdata | null = null;

export default function quizeRout() {
    const router = express.Router();

    router.get("/quize", async (req, res) => {
        try {
            const quizData = await getRandomPokemonQuizData();
            if (!quizData) {
                res.status(500).send("No Pokémon data available");
                return;
            }
            currentPokemon = quizData;
            res.render("quize.ejs", { pokemons: quizData });
        } catch (error) {
            console.error("Failed to get quiz data:", error);
            res.status(500).send("Internal Server Error");
        }
    });

    router.post("/quize/check", (req, res) => {
        const guess = (req.body.guess || "").toLowerCase().trim();
        if (!currentPokemon) {
            res.status(400).json({ error: "No quiz running" });
            return;
        }

        if (guess === currentPokemon.name.toLowerCase()) {
            res.json({ correct: true, fullImage: `https://img.pokemondb.net/artwork/large/${currentPokemon.name.toLowerCase()}.jpg` });
            // addScoreToTrainer();
            return;
        } else {
            res.json({ correct: false });
            return;
        }
    });


    router.get("/quize/skip", async (req, res) => {
        const newPokemon = await getRandomPokemonQuizData();
        currentPokemon = newPokemon;
        res.json(newPokemon);
    });

    return router;
}

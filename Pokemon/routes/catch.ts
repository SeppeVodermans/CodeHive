import express, { Router } from "express";
import { Request, Response } from 'express';
import { PokeBall, Pokemons } from "../types";
import { getAttempts, decrementAttempts, getFirstEvolutionPokemon, PokemonCollection, trainersCollection } from "../database";
import { getCachedFirstEvolutions, preloadPokemonData } from "../database";
import { ObjectId } from "mongodb";

export default function catchRoute() {

    const router = express.Router();

    router.get("/catch", async (req, res) => {
        try {
            await preloadPokemonData();
            const allPokemons: Pokemons[] = await PokemonCollection.find().toArray();


            const firstEvolutions = getCachedFirstEvolutions();
            if (firstEvolutions.length === 0) {
                res.status(404).send("Geen eerste evolution Pokémon gevonden.");
                return;
            }
            const randomPokemon = firstEvolutions[Math.floor(Math.random() * firstEvolutions.length)];
            // console.log("Random Pokemon to render:", randomPokemon);
            res.render("catch", { firstEvolution: randomPokemon, result: null });
        } catch (error) {
            console.error("Error loading catch page:", error);
            res.status(500).send("Internet serverfout.");
        }
    });


    router.post("/catch", async (req, res) => {
        const { ballType } = req.body;

        if (!["rare", "normal", "epic"].includes(ballType)) {
            res.status(400).send("Ongeldig type Pokéball");
            return;
        }

        const attemptsLeft = getAttempts();
        if (attemptsLeft[ballType as keyof PokeBall] <= 0) {
            return res.render("catch", {
                firstEvolution: null,
                result: `Geen pogingen meer met de ${ballType} Pokéball`
            });
        }

        const catchChances: Record<keyof PokeBall, number> = {
            rare: 70,
            normal: 50,
            epic: 90,
        };

        const success = Math.random() * 100 < catchChances[ballType as keyof PokeBall];
        decrementAttempts(ballType as keyof PokeBall);

        const allPokemons: Pokemons[] = await PokemonCollection.find().toArray();
        const firstEvolutions: Pokemons[] = [];

        for (const pokemon of allPokemons) {
            const isFirst = await getFirstEvolutionPokemon(pokemon.name);
            if (isFirst) firstEvolutions.push(pokemon);
        }

        const randomPokemon = firstEvolutions[Math.floor(Math.random() * firstEvolutions.length)];

        let resultMessage = "";
        if (success) {
            resultMessage = "Pokémon gevangen!";
            const newCaughtPokemon = {
                ...randomPokemon,
                nickName: randomPokemon.name,
                _id: (randomPokemon._id || new ObjectId()) as ObjectId,
            };
            const updateResult = await trainersCollection.updateOne(
                { _id: ObjectId },
                {
                    $push: {
                        caughtPokemons: newCaughtPokemon,
                        pokemonIds: newCaughtPokemon._id,
                    }
                }
            );
            if (updateResult.modifiedCount === 0) {
                console.warn(`Trainer not found or not updated after successful catch.`);
                resultMessage = "Pokémon gevangen, maar trainer data kon niet worden opgeslagen!";
            }
            if (req.session && req.session.trainer) {
                req.session.trainer.caughtPokemons = req.session.trainer.caughtPokemons || [];
                req.session.trainer.pokemonIds = req.session.trainer.pokemonIds || [];

                req.session.trainer.caughtPokemons.push(newCaughtPokemon);
                req.session.trainer.pokemonIds.push(newCaughtPokemon._id);
            }
        } else {
            resultMessage = "Pokémon is ontsnapt."
        }


        res.render("catch", {
            firstEvolution: randomPokemon,
            result: success ? "Pokémon gevangen!" : "Pokémon is ontsnapt."
        });
    });


    return router;
}

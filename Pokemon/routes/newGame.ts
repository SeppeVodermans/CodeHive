import express, { raw } from "express";
import { caughtPokemon, Pokemons, Trainer } from "../types";
import { ObjectId } from "mongodb";
import { caughtPokemons, PokemonCollection, trainersCollection } from "../database";
import { error } from "console";
import { getCachedFirstEvolutions } from "../database";

export default function newGameRoute() {
    const router = express.Router();
    router.get("/new-game", async (req, res) => {
        const allowedStarters = ["Growlithe", "Squirtle", "Bulbasaur", "Pikachu"];
        const starterPokemons = await PokemonCollection.find({ name: { $in: allowedStarters } }).toArray();
        res.render("new-game", { starterPokemons });
    });

    router.post("/new-game", async (req, res) => {
        const { name, gender, starterPokemonName, customPokemonName } = req.body;

        if (!name || !gender || !starterPokemonName) {
            res.json({ success: false, message: "Missing data" });
            return
        }

        const starterPokemon = await PokemonCollection.findOne({ name: starterPokemonName });
        if (!starterPokemon) {
            res.json({ success: false, message: "Invalid starter Pokémon" });
            return
        }

        const rawGender: string = gender;

        const genderValue: "male" | "female" = rawGender === "M" ? "male" : "female";

        const trainer = {
            id: new ObjectId(),
            name: name,
            gender: genderValue,
            team: [],
            pokemons: starterPokemon._id ? [starterPokemon._id!] : [],
            caughtPokemons: [{
                ...starterPokemon,
                nickName: customPokemonName || starterPokemon.name,
                _id: starterPokemon._id || new ObjectId(),
            },],
        };
        console.log("Saving trainer:", name, gender, starterPokemonName, customPokemonName);
        const insertResult = await trainersCollection.insertOne(trainer);

        req.session.trainer = {
            _id: insertResult.insertedId.toString(),
            name: trainer.name,
            gender: trainer.gender,
            team: trainer.team,
            pokemonIds: trainer.pokemons,
            caughtPokemons: trainer.caughtPokemons,
        };

        res.json({ success: true });
    });

    return router;
}
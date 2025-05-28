import express from "express";
import { getCachedPokemonData, getAllTypes, getPokemonCaughtByTrainer, getNextEvolutions, client } from "../database";
import { Pokemons } from "../types";
import { ObjectId } from "mongodb";

export default function pokedexRoute() {
    const route = express.Router();

    route.get("/pokemon-search", async (req, res) => {
        const selectedType = req.query.type || "all";
        const searchQuery = typeof req.query.q === "string" ? req.query.q.trim() : "";
        const collection = client.db("pokemon_spel").collection<Pokemons>("pokemon");

        const filter: any = {};
        if (selectedType !== "all") {
            filter.types = selectedType;
        }
        if (searchQuery !== "") {
            filter.name = { $regex: new RegExp(searchQuery, "i") };
        }

        const allPokemon = getCachedPokemonData();
        console.log("Cached Pokémon count:", allPokemon.length);
        if (!allPokemon) {
            res.status(500).send("Pokémon data not loaded.")
            return;
        };
        const types = await getAllTypes();
        const trainerId: string | undefined = req.session.trainer?._id?.toString();
        if (!trainerId || typeof trainerId !== "string" || !ObjectId.isValid(trainerId)) {
            res.status(400).send("Invalid trainer ID.");
            return;
        }
        const objectId = new ObjectId(trainerId);
        const caughtPokemon = await getPokemonCaughtByTrainer(trainerId);

        // Fetch and attach next evolutions
        // 1. Filter by type and name
        let pokemons = allPokemon.filter(p => {
            const matchesType = selectedType === "all" || p.types.includes(selectedType as string);
            const matchesSearch = searchQuery === "" || p.name.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesType && matchesSearch;
        });

        // 2. Fetch evolutions only once per request
        for (const pokemon of pokemons) {
            const evolutionNames = await getNextEvolutions(pokemon);
            const evolutions = allPokemon.filter(p => evolutionNames.includes(p.name));

            (pokemon as any).nextEvolutions = evolutions.map(evo => ({
                name: evo.name,
                image: evo.sprites.front_default,
                stats: caughtPokemon.some(p => p.name === evo.name)
                    ? {
                        hp: evo.base_stats.hp,
                        attack: evo.base_stats.attack,
                        defense: evo.base_stats.defense
                    }
                    : {
                        hp: "???",
                        attack: "???",
                        defense: "???"
                    }
            }));
        }

        res.render("pokemon-search.ejs", { types, selectedType, searchQuery, pokemons, caughtPokemon });
    });

    return route
}
import express from "express";
import { getCachedPokemonData, getAllTypes, getPokemonCaughtByTrainer, getNextEvolutions, client } from "../database";
import { Pokemons } from "../types";

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
        const trainerName = "Cedric";
        const caughtPokemon = await getPokemonCaughtByTrainer(trainerName);

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
                stats: caughtPokemon.includes(evo.name)
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
import express, { Express, Request, Response } from "express";
import ejs from "ejs";
import path from "path";
import { connect, insertData, getTrainerWithPokemons, addTeam, removeFromTeam, deleteHardcodedPokemon, getAllPokemon, getAllTypes, PokemonCollection, client, getPokemonCaughtByTrainer, getFirstEvolutionPokemon } from "./database";
import { Pokemons } from "./types";

const app: Express = express();

app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");
app.set('views', path.join(__dirname, "views"));
app.use(express.static("Pokemon/public"));

app.set("port", 3000);

async function startServer() {
  try {
    await connect();
    // await deleteHardcodedPokemon();
    // await insertData();
    app.listen(app.get("port"), () => {
      console.log("Server started on http://localhost:" + app.get("port"));
    });
  } catch (error) {
    console.error("Failed to start server:", error);
  }
}


app.get("/", (req, res) => {
  res.render("homepage.ejs");
});
app.get("/new-game", (req, res) => {
  res.render("new-game.ejs");
});

app.get("/pokemon-search", async (req, res) => {
  const selectedType = req.query.type || "all";
  const searchQuery = typeof req.query.q === "string" ? req.query.q.trim() : "";
  const collection = client.db("pokemon_spel").collection<Pokemons>("pokemon")
  const filter: any = {};
  if (selectedType !== "all") {
    filter.types = selectedType;
  }
  if (searchQuery !== " ") {
    filter.name = { $regex: new RegExp(searchQuery, "i") };
  }
  const pokemons = await collection.find(filter).toArray();
  const types = await getAllTypes();
  const trainerName = "Cedric";
  const caughtPokemon = await getPokemonCaughtByTrainer(trainerName);

  res.render("pokemon-search.ejs", { types, selectedType, searchQuery, pokemons, caughtPokemon });
});
app.get("/battler", (req, res) => {
  res.render("battler.ejs");
});
app.get("/catch", async (req, res) => {
  const firstEvolution = await getFirstEvolutionPokemon();
  res.render("catch.ejs", { firstEvolution });
});
app.get("/compare", (req, res) => {
  res.render("compare.ejs");
});
app.get("/pokemonevolution", (req, res) => {
  res.render("pokemonevolution.ejs");
});
app.get("/quize", (req, res) => {
  res.render("quize.ejs");
});
app.get("/challenge", (req, res) => {
  res.render("challenge");
});


app.get("/team", async (req, res) => {
  const id = "680f94f80e253abbc6683d8c";
  const result = await getTrainerWithPokemons(id);
  if (result) {
    const { trainer, pokemons, team } = result;
    res.render("team", {
      trainer: trainer,
      pokemons: pokemons,
      team: team
    });
  }
});

app.post('/team/add', async (req, res) => {
  const pokemonId = req.body.pokemonId;
  const trainerId = "680f94f80e253abbc6683d8c"
  await addTeam(pokemonId, trainerId);

  res.redirect("/team");

});

app.post("/team/remove", async (req, res) => {
  const pokemonId = req.body.pokemonId;
  const trainerId = "680f94f80e253abbc6683d8c";

  await removeFromTeam(pokemonId, trainerId);

  res.redirect("/team");
});

app.use((req, res) => {
  res.status(404).render("404.ejs");
});

startServer();

// app.listen(app.get("port"), async () => {
//   await connect();
//   await deleteHardcodedPokemon();
//   await insertData();
//   console.log("Server started on http://localhost:" + app.get('port'));
// });

/*async function getPokemonData(name: string) {
    try {
      const response = await fetch(
        `https://pokeapi.co/api/v2/pokemon/${name.toLowerCase()}`
      );
      if (!response.ok) throw new Error(`Pokémon ${name} niet gevonden!`);
      const data = await response.json();
      return {
        name: data.name,
        img: data.sprites.front_default,
      };
    } catch (error: any) {
      console.error(error.message);
      return null;
    }
  }*/



import express, { Express, Request, Response } from "express";
import ejs, { name } from "ejs";
import path from "path";

import { connect,connectIfNeeded, insertData, getTrainerWithPokemons, addTeam, removeFromTeam, deleteHardcodedPokemon, getAllPokemon, getAllTypes, PokemonCollection, client, getPokemonCaughtByTrainer, getFirstEvolutionPokemon } from "./database";
import { Pokemons } from "./types";


import { connect, getTrainerWithPokemons, addTeam, removeFromTeam, login, userCollection, preloadPokemonData } from "./database";
import { User } from "./types";
import dotenv from "dotenv"
import bcrypt from "bcrypt"

dotenv.config();

import { getNextEvolutions, getRandomPokemonQuizData, addScoreToTrainer } from "./database";
import { PokeBall, PokemonQuizdata } from "./types";
import { catchPokemon } from "../data";
import { error } from "console";
import catchRoute from "./routes/catch";
import quizeRout from "./routes/quize";
import quizePointsRoute from "./routes/quizePoints";
import pokedexRoute from "./routes/pokedex";




const app: Express = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set("view engine", "ejs");
app.set('views', path.join(__dirname, "views"));
app.use(express.static("Pokemon/public"));
app.set("port", 3000);

app.use(catchRoute());
app.use(quizeRout());
app.use(quizePointsRoute());
app.use(pokedexRoute());

async function startServer() {
  try {
    await connect();
    await preloadPokemonData();
    console.log("Caching Pokémon data...");
    app.listen(app.get("port"), () => {
      console.log("Server started on http://localhost:" + app.get("port"));
    });
  } catch (error) {
    console.error("Failed to start server:", error);
  }
}

app.get("/", (req, res) => {
  res.render("index.ejs");
});
app.get("/new-game", (req, res) => {
  res.render("new-game.ejs");
});


app.get("/battler", (req, res) => {
  res.render("battler.ejs");
});

app.get("/compare", (req, res) => {
  res.render("compare.ejs");
});

app.get("/challenge", (req, res) => {
  res.render("challenge");
});
app.get("/aanmelden", (req, res) => {
  res.render("aanmelden")
})

app.get("/register", (req, res) => {
  res.render("register.ejs")
})

app.post("/register", async (req, res) => {
  const { email, password } = req.body;
  console.log("Registratiegegevens ontvangen:", email, password); // <---- TEST

  if (!email || !password) {
    res.status(400).send("Email en wachtwoord zijn verplicht");
    return;
  }

  try {
    const existingUser = await userCollection.findOne({ email });

    if (existingUser) {
      res.status(409).send("Gebruiker bestaat al");
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await userCollection.insertOne({
      email,
      password: hashedPassword,
      role: "USER"
    });

    console.log("Gebruiker toegevoegd aan MongoDB:", email);
    res.redirect("/new-game");
  } catch (err) {
    console.error("Fout bij registratie:", err);
    res.status(500).send("Interne serverfout");
  }
});




app.post("/aanmelden", async (req, res) => {

  const { email, password } = req.body;

  if (!email || !password) {
    return res.render("aanmelden", { error: "Vul alle velden in." });
  }

  try {
    const user: User | null = await userCollection.findOne({ email });

    if (!user) {
      return res.render("aanmelden", { error: "Gebruiker bestaat niet." });
    }

    // Alleen bcrypt gebruiken om wachtwoord te vergelijken
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.render("aanmelden", { error: "Wachtwoord is incorrect." });
    }

    return res.render("new-game", { user });
  } catch (err) {
    console.error("Fout bij inloggen:", err);
    return res.render("aanmelden", { error: "Er is iets misgegaan. Probeer opnieuw." });
  }
});


app.get("/team", async (req, res) => {
  const id = "680f94f80e253abbc6683d8c";
  const result = await getTrainerWithPokemons(id);
  if (result) {
    const { trainer, team } = result;
    res.render("team", {
      trainer: trainer,
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

app.get("/challenge", async (req:any, res: any) => {
  try {
    console.log("🚀 /challenge route gestart");
    await connectIfNeeded();

    console.log("📦 trainer ophalen...");
    const trainerTeam = await getPokemonCaughtByTrainer("680f94f80e253abbc6683d8c");

    console.log("✅ trainerTeam:", trainerTeam);

    if (!trainerTeam || trainerTeam.length === 0) {
      return res.send("⚠️ Geen team gevonden voor deze trainer.");
    }

    res.render("challenge", { trainerTeam });

  } catch (err) {
    console.error("❌ Fout in /challenge:", err);
    res.status(500).send("Kon team niet laden.");
  }
});




app.use((req, res) => {
  res.status(404).render("404.ejs");
});

startServer();


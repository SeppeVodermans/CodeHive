import { Collection, MongoClient, ObjectId } from "mongodb";
// import { Trainer, Pokemon, Stats } from "./trainer";

import { Pokemons, Trainer, TrainerPokemons, Stats, User } from "./types";
import dotenv from "dotenv";
import path from "path";
import bcrypt from "bcrypt"


import { PokemonQuizdata } from "./types";
import { json } from "stream/consumers";
import { caughtPokemon, PokeBall, EvolutionChainLink } from "./types";

const trainerName = "Cedric"
const uri: string = "mongodb+srv://amaviyaovi:CodeHive@cluster0.bsv3myf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
export const client = new MongoClient(uri);


dotenv.config({ path: path.resolve(__dirname, '.env') });

// console.log(process.env.ADMIN_EMAIL)
//Collection voor Trainers en Pokemons
export const trainersCollection: Collection<Trainer> = client.db("pokemon_spel").collection<Trainer>("trainer");
export const PokemonCollection: Collection<Pokemons> = client.db("pokemon_spel").collection<Pokemons>("pokemon");

export const userCollection: Collection<User> = client.db("pokemon_spel").collection<User>("Users");

let cachedPokemonList: Pokemons[] | null = null;
let cachedFirstEvolutions: Pokemons[] | null = null;
let isCacheLoaded = false;

export async function preloadPokemonData() {
  if (isCacheLoaded) return;
  const collection = client.db("pokemon_spel").collection<Pokemons>("pokemon");
  cachedPokemonList = await collection.find().toArray();
  console.log(`Cached ${cachedPokemonList.length} Pokémon`);

  cachedFirstEvolutions = [];
  for (const pokemon of cachedPokemonList) {
    const isFirst = await getFirstEvolutionPokemon(pokemon.name);
    if (isFirst) {
      cachedFirstEvolutions.push(pokemon);
    }
  }

  isCacheLoaded = true;
}

export function getCachedPokemonData(): Pokemons[] {
  return cachedPokemonList || [];
}

export function getCachedFirstEvolutions(): Pokemons[] {
  return cachedFirstEvolutions || [];
}


export let caughtPokemons: caughtPokemon[] = [];

export function addCaughtPokemon(pokemon: caughtPokemon) {
  caughtPokemons.push(pokemon);
}


let pokeballAttempts: PokeBall = {
  rare: 2,
  normal: 3,
  epic: 1,
};

export function getAttempts(): PokeBall {
  return { ...pokeballAttempts };
}

export function decrementAttempts(ballType: keyof PokeBall): boolean {
  if (pokeballAttempts[ballType] > 0) {
    pokeballAttempts[ballType]--;
    return true
  }
  return false;
}

export function resetAttempts() {
  pokeballAttempts = {
    rare: 2,
    normal: 3,
    epic: 1
  }
}


async function exit() {
  try {
    await client.close();
    resetAttempts();
    console.log('Disconnected from database');
  } catch (error) {
    console.error(error);
  }
  process.exit(0);
}

export async function connect() {
  try {
    await client.connect();
    console.log('Connected to database');
    await createInitialUser();
    process.on('SIGINT', exit);
  } catch (error) {
    console.error(error);
    //console.log("test");
  }
}


export async function getTrainerWithPokemons(_id: string) {
  try {
    const objectId = new ObjectId(_id); // Convert once and reuse
    console.log("Looking up trainer with ID:", objectId.toHexString());

    const trainer = await trainersCollection.findOne({ _id: objectId });
    if (!trainer) {
      console.log("Trainer not found.");
      return null;
    }

    const pokemonIds = trainer.pokemons || [];
    const teamIds = trainer.team || [];

    const pokemons = await PokemonCollection
      .find({ _id: { $in: pokemonIds } })
      .toArray();

    const team = await PokemonCollection
      .find({ _id: { $in: teamIds } })
      .toArray();

    return { trainer, pokemons, team };
  } catch (err) {
    console.error("Error in getTrainerWithPokemons:", err);
    return null;
  }
}

export async function getPokemonCaughtByTrainer(trainerName: string) {
  const trainersCollection = client.db("pokemon_spel").collection("trainer");
  const trainer = await trainersCollection.findOne({ name: trainerName })
  return trainer?.pokemons || [];
}

export async function getFirstEvolutionPokemon(pokemonName: string) {
  const speciesResponse = await fetch(
    `https://pokeapi.co/api/v2/pokemon-species/${pokemonName}`
  );
  const speciesData = await speciesResponse.json();

  return speciesData.evolves_from_species === null;

}
export async function login(email: string, password: string) {
  if (!email || !password) {
    throw new Error("Email en wachtwoord zijn vereist");
  }

  const user: User | null = await userCollection.findOne<User>({ email: email });
  if (!user) {
    throw new Error("Gebruiker niet gevonden");
  }

  if (!user.password) {
    throw new Error("Gebruiker heeft geen wachtwoord in de database");
  }


  if (user.password !== password) {
    throw new Error("Wachtwoord klopt niet");
  }


  return user;
}


export async function createInitialUser() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD zijn verplicht");
  }

  const existingAdmin = await userCollection.findOne({ email });
  if (existingAdmin) {
    console.log("Admin bestaat al");
    return;
  }

  // Wachtwoord hashen voordat het wordt opgeslagen
  const hashedPassword = await bcrypt.hash(password, 10);

  await userCollection.insertOne({
    email: email,
    password: hashedPassword,
    role: "ADMIN"
  });

  console.log("Admin account aangemaakt.");
}

// Invoegen van Pokemons in de database van uit de pokeAPI
export async function insertData(): Promise<void> {

  try {
    const collection = client.db("pokemon_spel").collection<Pokemons>("pokemon");

    const existingCount = await collection.countDocuments();
    if (existingCount > 0) {
      console.log(`Database already contains ${existingCount} Pokémon.`);
      return;
    }

    const response = await fetch("https://pokeapi.co/api/v2/pokemon?limit=151");
    const data = await response.json();
    const results = data.results;

    const allPokemons: Pokemons[] = [];

    for (const result of results) {
      const res = await fetch(result.url);
      const full = await res.json();

      const baseStats: Pokemons["base_stats"] = {
        hp: full.stats.find((s: any) => s.stat.name === "hp")?.base_stat || 0,
        attack: full.stats.find((s: any) => s.stat.name === "attack")?.base_stat || 0,
        defense: full.stats.find((s: any) => s.stat.name === "defense")?.base_stat || 0,
        special_attack: full.stats.find((s: any) => s.stat.name === "special-attack")?.base_stat || 0,
        special_defense: full.stats.find((s: any) => s.stat.name === "special-defense")?.base_stat || 0,
        speed: full.stats.find((s: any) => s.stat.name === "speed")?.base_stat || 0,
      };

      const pokemon: Pokemons = {
        id: full.id,
        name: full.name,
        height: full.height,
        weight: full.weight,
        image: full.sprites.front_default || "",
        generation: 1, // optional: fetch from species endpoint later
        cries: full.cries?.latest || "",
        types: full.types.map((t: any) => t.type.name),
        base_experience: full.base_experience,
        base_stats: baseStats,
        abilities: full.abilities.map((a: any) => a.ability.name),
        sprites: {
          front_default: full.sprites.front_default || "",
          back_default: full.sprites.back_default || "",
          front_shiny: full.sprites.front_shiny || "",
          back_shiny: full.sprites.back_shiny || "",
        },
        species_url: full.species.url,
      };

      allPokemons.push(pokemon);
    }

    await collection.insertMany(allPokemons);
    console.log(`Inserted ${allPokemons.length} Pokémon into the database.`);
  } catch (error) {
    console.error("Error inserting Pokémon:", error);
  } finally {
    await client.close();
  }
}

export async function getAllPokemon() {

  const collection = client.db("pokemon_spel").collection<Pokemons>("pokemon");
  return await collection.find().toArray();
}

export async function getNextEvolutions(pokemon: Pokemons): Promise<string[]> {
  try {
    const speciesRes = await fetch(pokemon.species_url);
    const speciesData = await speciesRes.json();

    const evoChainRes = await fetch(speciesData.evolution_chain.url);
    const evoChainData = await evoChainRes.json();

    interface EvolutionChainLink {
      species: { name: string };
      evolves_to: EvolutionChainLink[];
    }

    function findEvolutions(chain: EvolutionChainLink): string[] {
      if (chain.species.name === pokemon.name) {
        return chain.evolves_to.map(evo => evo.species.name);
      }

      for (const evo of chain.evolves_to) {
        const result = findEvolutions(evo);
        if (result.length > 0) return result;
      }

      return [];
    }

    const evolutions = findEvolutions(evoChainData.chain);
    return evolutions;
  } catch (err) {
    console.error("Error fetching evolutions for:", pokemon.name, err);
    return [];
  }
}

export async function getRandomPokemonQuizData(): Promise<PokemonQuizdata> {
  await preloadPokemonData();
  const pokemons = getCachedPokemonData();
  if (pokemons.length === 0) throw new Error("No Pokémon available");

  const random = pokemons[Math.floor(Math.random() * pokemons.length)];

  return {
    name: random.name,
    silhouetteImage: `https://img.pokemondb.net/sprites/black-white/anim/normal/${random.name.toLowerCase()}.gif`,
    fullImage: `https://img.pokemondb.net/artwork/large/${random.name.toLowerCase()}.jpg`,
  };
}

export async function addScoreToTrainer(trainerName: string, points: number): Promise<void> {
  try {
    await client.connect();
    const db = client.db("pokemon_spel");
    const trainers = db.collection("trainers");

    await trainers.updateOne(
      { name: trainerName },
      { $inc: { score: points } },
      { upsert: true }
    );
  } finally {
    await client.close();
  }
}

export async function getAllTypes() {
  const collection = client.db("pokemon_spel").collection<Pokemons>("pokemon");
  const types = await collection.distinct("types");
  return types.sort();
}

export const addTeam = async (id: string, trainerID: string) => {
  await trainersCollection.updateOne(
    { _id: new ObjectId(trainerID) },
    { $addToSet: { team: new ObjectId(id) } }
  );
};

export const removeFromTeam = async (id: string, trainerID: string) => {
  try {
    await trainersCollection.updateOne(
      { _id: new ObjectId(trainerID) },
      { $pull: { team: new ObjectId(id) } }
    );

    return true;
  } catch (error) {
    console.error("Error removing Pokémon from team:", error);
    return false;
  }
};

export async function deleteHardcodedPokemon() {
  try {
    const collection = client.db("pokemon_spel").collection<Pokemons>("pokemon");

    const result = await collection.deleteMany({
      name: { $in: ["magnemite", "magneton"] }
    });

    console.log(`Deleted ${result.deletedCount} Pokémon.`);
  } catch (error) {
    console.error("Error deleting Pokémon:", error);
  }
}

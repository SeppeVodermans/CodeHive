import { Collection, MongoClient, ObjectId } from "mongodb";
// import { Trainer, Pokemon, Stats } from "./trainer";
import { Pokemons, Trainer, TrainerPokemons, Stats } from "./types";
import { json } from "stream/consumers";
const trainerName = "Cedric"
const uri = "mongodb+srv://amaviyaovi:CodeHive@cluster0.bsv3myf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
export const client = new MongoClient(uri);

//Collection voor Trainers en Pokemons
export const trainersCollection: Collection<Trainer> = client.db("pokemon_spel").collection<Trainer>("trainer");
export const PokemonCollection: Collection<Pokemons> = client.db("pokemon_spel").collection<Pokemons>("pokemon");

async function exit() {
  try {
    await client.close();
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
    process.on('SIGINT', exit);
  } catch (error) {
    console.error(error);
    console.log("test");
  }
}


export async function getTrainerWithPokemons(id: string) {
  const trainer = await trainersCollection.findOne({ _id: new ObjectId(id) });
  if (!trainer) return null;

  const team = await PokemonCollection
    .find({ _id: { $in: trainer.team } })
    .toArray();

  return { trainer, team };
}

export async function getPokemonCaughtByTrainer(trainerId: string) {
  const trainersCollection = client.db("pokemon_spel").collection<Trainer>("trainer");
  const trainer = await trainersCollection.findOne({ _id: new ObjectId(trainerId) });

  if (!trainer || !trainer.pokemons || trainer.pokemons.length === 0) {
    return [];
  }

  const pokemons = await PokemonCollection.find({
    _id: { $in: trainer.pokemons }
  }).toArray();

  return pokemons;
}



export async function getFirstEvolutionPokemon() {
  const collection = client.db("pokemon_spel").collection<Pokemons>("pokemon");
  const result = await collection.aggregate([{ $match: { evolves_from_species: null } }, { $sample: { size: 1 } }]).toArray();
  return result[0];

}

// export async function insertData() {
//   try {
//     const magnemite: Pokemon = {
//       name: "magnemite",
//       geslacht: "male",
//       stats: { wins: 12, losses: 3, draws: 1 },
//       type: ["Elecktric"]
//     }

//     const magneton: Pokemon = {
//       name: "magneton",
//       geslacht: "female",
//       stats: { wins: 10, losses: 5, draws: 0 },
//       type: ["Elecktric"]
//     }

//     const pokemons: Pokemon[] = [magnemite, magneton];

//     const pokemonResult = await PokemonCollection.insertMany(pokemons);
//     const insertedIds = Object.values(pokemonResult.insertedIds);

//     const trainer: Trainer = {
//       name: "Cedric",
//       geslacht: "male",
//       pokemons: insertedIds,
//       team: []
//     };

//     await trainersCollection.insertOne(trainer);

//     console.log("Data inserted successfully!");
//   } catch (error) {
//     console.error("Error inserting data:", error);
//   }
// }

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

export async function connectIfNeeded() {
  try {
    console.log("🌐 Test MongoDB verbinding...");
    await client.db().admin().ping();
    console.log("✅ Verbinding OK");
  } catch (error) {
    console.log("❌ Geen verbinding, probeer opnieuw...");
    await connect();
    console.log("✅ Verbinding hersteld");
  }
}






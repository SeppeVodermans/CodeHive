import { Collection, MongoClient,ObjectId } from "mongodb";
import { Trainer,Pokemon,Stats} from "./trainer";
const uri = "mongodb+srv://cedricrypens:CodeHive@cluster0.zgtcxog.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
export const client = new MongoClient(uri);
export const trainersCollection: Collection<Trainer> = client.db("pokemon_spel").collection<Trainer>("trainer");
export const PokemonCollection: Collection<Pokemon> = client.db("pokemon_spel").collection<Pokemon>("pokemon");

async function exit() {
    try {
        await client.close();
        console.log('Disconnected from database');
    } catch (error) {
        console.error(error);
    }
    process.exit(0);
}


export async function getTrainerWithPokemons(id: string) {
    const trainer = await trainersCollection.findOne({ _id: new ObjectId(id) });
    if (!trainer) {
      return null;
    }
  
    const pokemonIds = trainer.pokemons;

    const pokemons = await PokemonCollection
      .find({ _id: { $in: pokemonIds } })
      .toArray();

    const teamIds = trainer.team;
    const team = await PokemonCollection
      .find({ _id: { $in: teamIds } })
      .toArray();
    return { trainer, pokemons,team };
  }


export async function insertData() {
    try {
      const magnemite: Pokemon = {name: "magnemite",
        geslacht: "male",
        stats: { wins: 12, losses: 3, draws: 1 },
        type: ["Elecktric"]}

      const magneton: Pokemon = {name: "magneton",
        geslacht: "female",
        stats: { wins: 10, losses: 5, draws: 0 },
        type: ["Elecktric"]}

      const pokemons: Pokemon[] = [magnemite , magneton];
  
      const pokemonResult = await PokemonCollection.insertMany(pokemons);
      const insertedIds = Object.values(pokemonResult.insertedIds);
  
      const trainer: Trainer = {
        name: "Cedric",
        geslacht: "male",
        pokemons: insertedIds,
        team:[]
      };
  
      await trainersCollection.insertOne(trainer);
  
      console.log("Data inserted successfully!");
    } catch (error) {
      console.error("Error inserting data:", error);
    }
  }

  export const addTeam = async (id: string,trainerID: string) => {
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

export async function connect() {
    try {
        await client.connect();
        console.log('Connected to database');
        process.on('SIGINT', exit);
    } catch (error) {
        console.error(error);
    }
   
}
import express, { Express, Request, Response } from "express";
import ejs from "ejs";
import path from "path";
import { connect,insertData,getTrainerWithPokemons,addTeam,removeFromTeam } from "./database"; 

const app: Express = express();

app.use(express.urlencoded({ extended: true })); 

app.set("view engine", "ejs");
app.set('views', path.join(__dirname, "views"));
app.use(express.static("Pokemon/public"));

app.set("port", 3000);


app.get("/", (req, res) => {
    res.render("homepage.ejs");
});
app.get("/new-game", (req, res) => {
    res.render("new-game.ejs");
});

app.get("/team", async (req, res) => {
    const id = "6807b809ca0c95ea66a05d80"; 
    const result = await getTrainerWithPokemons(id);
    if(result){
        const { trainer, pokemons,team } = result;
        res.render("team", {
            trainer: trainer,
            pokemons: pokemons,
            team: team
        });
    }
});

app.post('/team/add', async (req, res) => {
    const pokemonId = req.body.pokemonId;
    const trainerId = "6807b809ca0c95ea66a05d80"
    await addTeam(pokemonId,trainerId);

    res.redirect("/team");

  });

  app.post("/team/remove", async (req, res) => {
    const pokemonId = req.body.pokemonId;
    const trainerId = "6807b809ca0c95ea66a05d80"; 
    
    await removeFromTeam(pokemonId, trainerId);
    
    res.redirect("/team");
  });
  
app.listen(app.get("port"), async () => {
    await connect();
    console.log("Server started on http://localhost:" + app.get('port'));
});

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



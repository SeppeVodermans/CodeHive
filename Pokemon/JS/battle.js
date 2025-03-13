"use strict";
/*Data Fetch APU*/
async function getPokemonData(pokemonNameOrId) {
  try {
    const response = await fetch(
      `https://pokeapi.co/api/v2/pokemon/${pokemonNameOrId.toLowerCase()}`
    );
    if (!response.ok) throw new Error("Pokémon niet gevonden!");

    const data = await response.json();
    return {
      name: capitalize(data.name),
      sprite: data.sprites.front_default, // API image
      hp: data.stats.find((stat) => stat.stat.name === "hp").base_stat,
      attack: data.stats.find((stat) => stat.stat.name === "attack").base_stat,
      defense: data.stats.find((stat) => stat.stat.name === "defense")
        .base_stat,
      speed: data.stats.find((stat) => stat.stat.name === "speed").base_stat,
    };
  } catch (error) {
    console.error(error.message);
    return null;
  }
}

/*Loading in Pokemons*/
async function loadPokemon() {
  const pokemon1 = await getPokemonData("machop"); // User Pokemon
  const pokemon2 = await getPokemonData(newOpponent); // Random Pokemon

  if (pokemon1 && pokemon2) {
    updateBattleField(pokemon1, pokemon2);
  }
}

function updateBattleField(pokemon1, pokemon2) {
  const cards = document.querySelectorAll(".pokemon-card");

  /*Pokemon User*/
  cards[0].querySelector("h3").innerText = pokemon1.name;
  cards[0].querySelector("img").src = pokemon1.sprite;
  updateStats(cards[0], pokemon1);

  /*Random Pokemon*/
  cards[1].querySelector("h3").innerText = pokemon2.name;
  cards[1].querySelector("img").src = pokemon2.sprite;
  updateStats(cards[1], pokemon2);

  /*Battle btn*/
  document.querySelector(".battle-btn").onclick = () =>
    startBattle(pokemon1, pokemon2);
}

/*Stats Updaten*/
function updateStats(card, pokemon) {
  const stats = card.querySelector(".stats").querySelectorAll("p");
  stats[0].innerText = `HP: ${pokemon.hp}`;
  stats[1].innerText = `Attack: ${pokemon.attack}`;
  stats[2].innerText = `Defense: ${pokemon.defense}`;
  stats[3].innerText = `Speed: ${pokemon.speed}`;
}

/*Battler*/
async function startBattle(pokemon1, pokemon2) {
  let hp1 = pokemon1.hp;
  let hp2 = pokemon2.hp;

  const log =
    document.querySelector(".battle-log") || document.createElement("div");
  log.classList.add("battle-log");
  log.innerHTML = "";
  document.querySelector(".battle-container").appendChild(log);

  function attack(attacker, defender, defenderHp) {
    let damage = Math.max(1, attacker.attack - defender.defense / 2);
    defenderHp -= damage;
    log.innerHTML += `<p>${attacker.name} attacks ${
      defender.name
    } for ${Math.round(damage)} damage!</p>`;
    return defenderHp;
  }

  /*Speed Pokemon*/
  let attacker = pokemon1.speed >= pokemon2.speed ? pokemon1 : pokemon2;
  let defender = attacker === pokemon1 ? pokemon2 : pokemon1;

  /*Battle Loop (Attacking till 0 HP)*/
  while (hp1 > 0 && hp2 > 0) {
    hp2 = attack(attacker, defender, hp2);
    updateStats(document.querySelectorAll(".pokemon-card")[1], {
      ...defender,
      hp: Math.max(0, hp2),
    });

    if (hp2 <= 0) {
      log.innerHTML += `<p><strong>${attacker.name} Wins!</strong></p>`;
      break;
    }
    /*Taking Turns*/
    [attacker, defender] = [defender, attacker];
  }
}

/*Generate Random Pokemon*/
async function generateRandomOpponent() {
  const randomId = Math.floor(Math.random() * 151) + 1;
  const newOpponent = await getPokemonData(randomId);

  if (newOpponent) {
    const cards = document.querySelectorAll(".pokemon-card");

    /*Update Random Pokemon*/
    cards[1].querySelector("h3").innerText = newOpponent.name;
    cards[1].querySelector("img").src = newOpponent.sprite;
    updateStats(cards[1], newOpponent);

    /*Update Battle Btn*/
    const currentPokemon = await getPokemonData(
      cards[0].querySelector("h3").innerText.toLowerCase()
    );
    document.querySelector(".battle-btn").onclick = () =>
      startBattle(currentPokemon, newOpponent);
  }
}

/*Capitalize Pokemon Name*/
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/*Event*/
document.addEventListener("DOMContentLoaded", () => {
  loadPokemon();
  document
    .querySelector(".generate-btn")
    .addEventListener("click", generateRandomOpponent);
});

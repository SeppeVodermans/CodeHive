"use strict";

// Capitalize helper
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Pokémon ophalen via API
async function getPokemonData(nameOrId) {
  try {
    const response = await fetch(
      `https://pokeapi.co/api/v2/pokemon/${String(nameOrId).toLowerCase()}`
    );

    if (!response.ok) throw new Error("Pokémon niet gevonden");
    const data = await response.json();
    return {
      name: capitalize(data.name),
      sprite: data.sprites.front_default,
      hp: data.stats.find((s) => s.stat.name === "hp").base_stat,
      attack: data.stats.find((s) => s.stat.name === "attack").base_stat,
      defense: data.stats.find((s) => s.stat.name === "defense").base_stat,
      speed: data.stats.find((s) => s.stat.name === "speed").base_stat,
    };
  } catch (err) {
    console.error("Fout:", err.message);
    return null;
  }
}

// Stats tonen
function updateCard(card, pokemon) {
  card.querySelector("h3").innerText = pokemon.name;
  card.querySelector("img").src = pokemon.sprite;
  const stats = card.querySelectorAll(".stats p");
  stats[0].innerText = `HP: ${pokemon.hp}`;
  stats[1].innerText = `Attack: ${pokemon.attack}`;
  stats[2].innerText = `Defense: ${pokemon.defense}`;
  stats[3].innerText = `Speed: ${pokemon.speed}`;
}

// Battle-log
function getBattleLog() {
  let log = document.querySelector(".battle-log");
  if (!log) {
    log = document.createElement("div");
    log.className = "battle-log";
    document.querySelector(".battle-container").appendChild(log);
  }
  log.innerHTML = "";
  return log;
}

// Battle uitvoeren
function startBattle(pokemon1, pokemon2) {
  let hp1 = pokemon1.hp;
  let hp2 = pokemon2.hp;
  const cards = document.querySelectorAll(".pokemon-card");
  const log = getBattleLog();

  let attacker = pokemon1.speed >= pokemon2.speed ? pokemon1 : pokemon2;
  let defender = attacker === pokemon1 ? pokemon2 : pokemon1;

  while (hp1 > 0 && hp2 > 0) {
    let damage = Math.max(1, attacker.attack - defender.defense / 2);
    if (attacker === pokemon1) {
      hp2 = Math.max(0, hp2 - damage);
      updateCard(cards[1], { ...defender, hp: hp2 });
      log.innerHTML += `<p>${attacker.name} doet ${Math.round(
        damage
      )} schade aan ${defender.name}!</p>`;
    } else {
      hp1 = Math.max(0, hp1 - damage);
      updateCard(cards[0], { ...defender, hp: hp1 });
      log.innerHTML += `<p>${attacker.name} doet ${Math.round(
        damage
      )} schade aan ${defender.name}!</p>`;
    }

    if (hp1 <= 0 || hp2 <= 0) {
      const winnaar = hp1 > 0 ? pokemon1.name : pokemon2.name;
      log.innerHTML += `<p><strong>${winnaar} wint!</strong></p>`;
      break;
    }

    [attacker, defender] = [defender, attacker];
  }
}

// Battle klaarzetten met gekozen Pokémon
async function loadBattle(opponentName = null) {
  const cards = document.querySelectorAll(".pokemon-card");
  const userPokemonName = localStorage.getItem("selectedPokemon") || "pikachu";
  const userNickname = localStorage.getItem("pokemonNickname");

  const player = await getPokemonData(userPokemonName);
  const opponent = opponentName
    ? await getPokemonData(opponentName)
    : await getPokemonData(Math.floor(Math.random() * 151) + 1);

  // Overschrijf naam met nickname als die bestaat
  if (player && userNickname) {
    player.name = capitalize(userNickname);
  }

  if (player && opponent) {
    updateCard(cards[0], player);
    updateCard(cards[1], opponent);

    document.querySelector(".battle-btn").onclick = () =>
      startBattle(player, opponent);
  }
  function updateTrainerInfo() {
    const trainerName = localStorage.getItem("trainerName") || "Trainer";
    const gender = localStorage.getItem("selectedGender") || "F";

    const trainerImage = document.querySelector(".trainer-info img");
    const trainerNameHeading = document.getElementById("trainer-name");

    // Naam instellen
    if (trainerNameHeading) {
      trainerNameHeading.innerText = `${trainerName}`;
    }

    // Afbeelding instellen
    if (trainerImage) {
      trainerImage.src =
        gender === "M"
          ? "../Assets/Player/male.png"
          : "../Assets/Player/female.png";
    }
  }
  updateTrainerInfo();
}

// Zoek input activeren
function setupSearch() {
  const searchInput = document.querySelector(".trainer-info input");
  if (!searchInput) return;

  searchInput.addEventListener("keypress", async (e) => {
    if (e.key === "Enter") {
      const value = e.target.value.trim().toLowerCase();
      if (value) {
        loadBattle(value);
        e.target.value = "";
      }
    }
  });
}

// Initialisatie
document.addEventListener("DOMContentLoaded", () => {
  loadBattle();
  setupSearch();

  document.querySelector(".generate-btn").addEventListener("click", () => {
    loadBattle(); // willekeurige tegenstander
  });
});

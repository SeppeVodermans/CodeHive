"use strict";

const ashTeamNames = ["pikachu", "charizard", "bulbasaur", "squirtle", "snorlax"];
let ashTeam = [];
let playerTeam = [];
let currentPlayerPokemon = null;
let currentOpponentIndex = 0;
let selectedPokemonName = null;

// Capitalize
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Battle-log ophalen of aanmaken
function getBattleLog() {
  let log = document.querySelector(".battle-log");
  if (!log) {
    log = document.createElement("div");
    log.className = "battle-log";
    document.querySelector(".battle-container").appendChild(log);
  }
  return log;
}

// Pokémon ophalen via API
async function getPokemonData(nameOrId) {
  try {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${String(nameOrId).toLowerCase()}`);
    if (!response.ok) throw new Error("Pokémon niet gevonden");
    const data = await response.json();

    const types = data.types.map((t) => t.type.name);
    const allMoves = data.moves;
    const selectedMoves = ["Tackle", "Quick Attack"];
    const typeSpecificMoves = [];
    const usedMoveNames = new Set(selectedMoves);

    for (const type of types) {
      for (const moveEntry of allMoves) {
        const moveResponse = await fetch(moveEntry.move.url);
        const moveData = await moveResponse.json();

        if (moveData.type.name === type && !usedMoveNames.has(moveData.name)) {
          typeSpecificMoves.push({
            name: capitalize(moveData.name.replace("-", " ")),
            type: moveData.type.name,
          });
          usedMoveNames.add(moveData.name);

          if (typeSpecificMoves.length === 2) break;
        }
      }
      if (typeSpecificMoves.length === 2) break;
    }

    selectedMoves.push(...typeSpecificMoves.map(m => m.name));

    return {
      name: capitalize(data.name),
      sprite: data.sprites.front_default,
      hp: data.stats.find((s) => s.stat.name === "hp").base_stat,
      maxHp: data.stats.find((s) => s.stat.name === "hp").base_stat,
      attack: data.stats.find((s) => s.stat.name === "attack").base_stat,
      defense: data.stats.find((s) => s.stat.name === "defense").base_stat,
      speed: data.stats.find((s) => s.stat.name === "speed").base_stat,
      type: types,
      moves: selectedMoves,
    };
  } catch (err) {
    console.error("Fout:", err.message);
    return null;
  }
}

// Kaart bijwerken
function updateCard(card, pokemon) {
  card.querySelector("h3").innerText = pokemon.name;
  card.querySelector("img").src = pokemon.sprite;
  const stats = card.querySelectorAll(".stats p");
  stats[0].innerText = `HP: ${pokemon.hp} / ${pokemon.maxHp}`;
  stats[1].innerText = `Attack: ${pokemon.attack}`;
  stats[2].innerText = `Defense: ${pokemon.defense}`;
  stats[3].innerText = `Speed: ${pokemon.speed}`;
}

function enableMoveButtons() {
  document.querySelectorAll(".move-btn").forEach((btn) => (btn.disabled = false));
}

function disableMoveButtons() {
  document.querySelectorAll(".move-btn").forEach((btn) => (btn.disabled = true));
}

function setupMoveButtons(player, opponent, onOpponentFaint) {
  const buttons = document.querySelectorAll(".move-btn");
  const log = getBattleLog();
  const cards = document.querySelectorAll(".pokemon-card");

  buttons.forEach((btn, i) => {
    const move = player.moves[i];
    btn.textContent = move;
    btn.disabled = false;

    btn.onclick = () => {
      const damage = Math.max(1, player.attack - opponent.defense / 2);
      opponent.hp = Math.max(0, opponent.hp - damage);
      updateCard(cards[1], opponent);
      log.innerHTML += `<p>${player.name} gebruikt <strong>${move}</strong> en doet ${Math.round(damage)} schade!</p>`;

      if (opponent.hp <= 0) {
        log.innerHTML += `<p><strong>${opponent.name} is verslagen!</strong></p>`;
        currentOpponentIndex++;
        updatePokeballs();
        if (currentOpponentIndex < ashTeam.length) {
          onOpponentFaint();
          enableMoveButtons();
        } else {
          log.innerHTML += `<p><strong>${player.name} heeft alle 5 Pokémon van Ash verslagen!</strong></p>`;
          disableMoveButtons();
        }
        return;
      }

      setTimeout(() => {
        const counterDamage = Math.max(1, opponent.attack - player.defense / 2);
        player.hp = Math.max(0, player.hp - counterDamage);
        updateCard(cards[0], player);
        log.innerHTML += `<p>${opponent.name} countert met ${Math.round(counterDamage)} schade!</p>`;

        if (player.hp <= 0) {
          log.innerHTML += `<p><strong>${opponent.name} wint de battle!</strong></p>`;
          disableMoveButtons();
        }
      }, 500);
    };
  });
}

async function startBattle() {
  const cards = document.querySelectorAll(".pokemon-card");
  const log = getBattleLog();
  log.innerHTML = "<p>Kies een aanval om de battle te starten.</p>";

  try {
    const trainerId = "680f94f80e253abbc6683d8c"; 
    const response = await fetch(`/api/team/${trainerId}`);
    if (!response.ok) throw new Error("Team ophalen mislukt");

    const teamData = await response.json();
    if (teamData.length === 0) {
      alert("Geen team gevonden! Voeg Pokémon toe aan je team.");
      return;
    }

    playerTeam = await Promise.all(teamData.map(p => getPokemonData(p.name)));

    currentPlayerPokemon =
      playerTeam.find(p => p.name.toLowerCase() === selectedPokemonName?.toLowerCase()) || playerTeam[0];

    if (ashTeam.length === 0) {
      for (const name of ashTeamNames) {
        const poke = await getPokemonData(name);
        if (poke) ashTeam.push(poke);
      }
    }

    const opponent = ashTeam[currentOpponentIndex];

    updateCard(cards[0], currentPlayerPokemon);
    updateCard(cards[1], opponent);

    setupMoveButtons(currentPlayerPokemon, opponent, () => loadNextOpponent(currentPlayerPokemon));
  } catch (error) {
    console.error(error);
    alert("Er is een fout opgetreden bij het starten van de battle.");
  }
}

async function loadNextOpponent(player) {
  const cards = document.querySelectorAll(".pokemon-card");
  const nextOpponent = ashTeam[currentOpponentIndex];

  if (nextOpponent) {
    updateCard(cards[1], nextOpponent);
    const log = getBattleLog();
    log.innerHTML += `<p>Nieuwe tegenstander: <strong>${nextOpponent.name}!</strong></p>`;
    setupMoveButtons(player, nextOpponent, () => loadNextOpponent(player));
  }
}

function updatePokeballs() {
  const container = document.getElementById("opponent-pokeballs");
  container.innerHTML = "";
  const remaining = ashTeam.length - currentOpponentIndex;
  for (let i = 0; i < remaining; i++) {
    const pokeball = document.createElement("img");
    pokeball.src = "../Assets/pokeballs/pokeball.png";
    pokeball.className = "pokeball-icon";
    container.appendChild(pokeball);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  startBattle();

  document.getElementById("pokemon-select").addEventListener("change", (e) => {
    selectedPokemonName = e.target.value;
    startBattle(); // herstart battle met nieuwe Pokémon
  });
});

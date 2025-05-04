"use strict";

// Capitalize helper
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Type-effectiviteit
const typeEffectiveness = {
  fire: { grass: 2, water: 0.5, fire: 0.5 },
  water: { fire: 2, grass: 0.5, water: 0.5 },
  grass: { water: 2, fire: 0.5, grass: 0.5 },
  electric: { water: 2, grass: 0.5, electric: 0.5 },
};

// Pokémon ophalen via API
async function getPokemonData(nameOrId) {
  try {
    const response = await fetch(
      `https://pokeapi.co/api/v2/pokemon/${String(nameOrId).toLowerCase()}`
    );
    if (!response.ok) throw new Error("Pokémon niet gevonden");
    const data = await response.json();

    const types = data.types.map(t => t.type.name); // [ 'grass', 'poison' ]
    const allMoves = data.moves;
    const selectedMoves = [];

    const usedMoveNames = new Set();

    async function getValidMove(moveEntry) {
      const res = await fetch(moveEntry.move.url);
      if (!res.ok) return null;
      const move = await res.json();

      if (
        move.power &&
        move.type &&
        move.power !== null &&
        move.type.name !== "status"
      ) {
        return {
          name: capitalize(move.name.replace("-", " ")),
          power: move.power,
          type: move.type.name,
        };
      }
      return null;
    }

    for (const type of types) {
      for (const moveEntry of allMoves) {
        const moveData = await getValidMove(moveEntry);
        if (
          moveData &&
          moveData.type === type &&
          !usedMoveNames.has(moveData.name)
        ) {
          selectedMoves.push(moveData);
          usedMoveNames.add(moveData.name);
          break; 
        }
      }
    }

    for (const moveEntry of allMoves) {
      if (selectedMoves.length >= 4) break;

      const moveData = await getValidMove(moveEntry);
      if (moveData && !usedMoveNames.has(moveData.name)) {
        selectedMoves.push(moveData);
        usedMoveNames.add(moveData.name);
      }
    }


    while (selectedMoves.length < 4) {
      selectedMoves.push({
        name: "Tackle",
        power: 40,
        type: "normal",
      });
    }

    return {
      name: capitalize(data.name),
      sprite: data.sprites.front_default,
      hp: data.stats.find((s) => s.stat.name === "hp").base_stat,
      attack: data.stats.find((s) => s.stat.name === "attack").base_stat,
      defense: data.stats.find((s) => s.stat.name === "defense").base_stat,
      speed: data.stats.find((s) => s.stat.name === "speed").base_stat,
      type: types[0], 
      moves: selectedMoves.slice(0, 4),
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

// Move damage berekenen
function calculateDamage(attacker, defender, move) {
  const effectiveness = typeEffectiveness[move.type]?.[defender.type] || 1;
  const rawDamage = attacker.attack + move.power - defender.defense / 2;
  return Math.max(1, rawDamage * effectiveness);
}

// Aanval uitvoeren
function attackWithMove(attacker, defender, move, attackerCard, defenderCard, log) {
  // Verwijder standaardtekst indien aanwezig
  const standaardRegel = "Kies een move om de battle te starten.";
  if (log.innerHTML.includes(standaardRegel)) {
    log.innerHTML = ""; // Leegmaken bij eerste echte actie
  }

  const damage = calculateDamage(attacker, defender, move);
  defender.hp = Math.max(0, defender.hp - damage);

  log.innerHTML += `<p>${attacker.name} gebruikt <strong>${move.name}</strong> (${move.type})!</p>`;

  const effectiveness = typeEffectiveness[move.type]?.[defender.type] || 1;
  if (effectiveness > 1) log.innerHTML += `<p>Het is super effectief!</p>`;
  if (effectiveness < 1) log.innerHTML += `<p>Het is niet erg effectief...</p>`;

  defenderCard.classList.add("shake"); 
  setTimeout(() => defenderCard.classList.remove("shake"), 500);

  updateCard(defenderCard, defender);
  log.innerHTML += `<p>${defender.name} verliest ${Math.round(damage)} HP.</p>`;

  return defender.hp <= 0;
}




function disableMoveButtons() {
  document.querySelectorAll(".move-btn").forEach((btn) => (btn.disabled = true));
}

function setupMoveButtons(player, opponent) {
  const buttons = document.querySelectorAll(".move-btn");
  const cards = document.querySelectorAll(".pokemon-card");
  const log = getBattleLog();

  buttons.forEach((btn, i) => {
    const move = player.moves[i];
    btn.textContent = move.name;
    btn.disabled = false;
    btn.onclick = async () => {
      disableMoveButtons();

      const opponentFainted = attackWithMove(
        player,
        opponent,
        move,
        cards[0],
        cards[1],
        log
      );

      if (opponentFainted) {
        log.innerHTML += `<p><strong>${player.name} wint!</strong></p>`;
        return;
      }

      await new Promise((res) => setTimeout(res, 1000));

      const counterMove =
        opponent.moves[Math.floor(Math.random() * opponent.moves.length)];

      const playerFainted = attackWithMove(
        opponent,
        player,
        counterMove,
        cards[1],
        cards[0],
        log
      );

      if (playerFainted) {
        log.innerHTML += `<p><strong>${opponent.name} wint!</strong></p>`;
        return;
      }
      setupMoveButtons(player, opponent);
    };
  });
}

async function loadBattle(opponentName = null) {
  const cards = document.querySelectorAll(".pokemon-card");
  const userPokemonName = localStorage.getItem("selectedPokemon") || "pikachu";
  const userNickname = localStorage.getItem("pokemonNickname");

  const player = await getPokemonData(userPokemonName);
  const opponent = opponentName
    ? await getPokemonData(opponentName)
    : await getPokemonData(Math.floor(Math.random() * 151) + 1);

  if (player && userNickname) {
    player.name = capitalize(userNickname);
  }

  if (player && opponent) {
    updateCard(cards[0], player);
    updateCard(cards[1], opponent);
    setupMoveButtons(player, opponent);
  }

  const log = getBattleLog();
  log.innerHTML = "<p>Kies een move om de battle te starten.</p>";
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
    loadBattle();
  });


});

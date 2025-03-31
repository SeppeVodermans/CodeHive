"use strict";
/*Fetch Pokemon Data*/
async function getPokemonData(pokemonNameOrId) {
  try {
    const response = await fetch(
      `https://pokeapi.co/api/v2/pokemon/${pokemonNameOrId.toLowerCase()}`
    );
    if (!response.ok) throw new Error("Pokémon niet gevonden!");

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error.message);
    return null;
  }
}

/*Update Main Pokemon*/
async function updateMainPokemon(pokemonName) {
  const pokemonData = await getPokemonData(pokemonName);
  if (!pokemonData) return;

  /*Update Info Main Pokemon*/
  document.querySelector(".main-pokemon img").src =
    pokemonData.sprites.front_default;
  document.querySelector(".main-pokemon h3").innerText = pokemonData.name;
  document.querySelector(
    ".main-pokemon p"
  ).innerText = `Type: ${pokemonData.types.map((t) => t.type.name).join(", ")}`;
}

/*Update Pokemon List*/
async function updatePokemonList(pokemonNames) {
  const pokemonGrid = document.querySelector(".pokemon-grid");
  pokemonGrid.innerHTML = "";

  for (let name of pokemonNames) {
    const pokemonData = await getPokemonData(name);
    if (!pokemonData) continue;

    const card = document.createElement("div");
    card.classList.add("pokemon-card");
    card.innerHTML = `
            <img src="${pokemonData.sprites.front_default}" alt="${
      pokemonData.name
    }">
            <h3>${pokemonData.name}</h3>
            <p>Type: ${pokemonData.types.map((t) => t.type.name).join(", ")}</p>
            <button onclick="viewPokemonDetails('${
              pokemonData.name
            }')">View More Details</button>
            <div class="stats">
              <span>W</span> <span>L</span> <span>D</span>
            </div>
        `;
    pokemonGrid.appendChild(card);
  }
}

/*Test Pokemons*/
document.addEventListener("DOMContentLoaded", () => {
  // Laad wat extra Pokémons om de grid te vullen
  updatePokemonList(["eevee", "jigglypuff", "vulpix", "oddish"]);
});

/* Gegevens ophalen van uit localStorage van new game */
document.addEventListener("DOMContentLoaded", () => {
  let outputElement = document.getElementById("output");
  if (!outputElement) {
    alert("Element with ID 'output' not found!");
    return;
  }
  outputElement.textContent = "Welcome to your Pokémon adventure!";
});

document.addEventListener("DOMContentLoaded", async () => {
  const trainerName = localStorage.getItem("trainerName");
  const pokemonNickname = localStorage.getItem("pokemonNickname");
  const selectedPokemon = localStorage.getItem("selectedPokemon");
  const selectedGender = localStorage.getItem("selectedGender");

  // Trainer naam invullen
  const trainerNameEl = document.querySelector(".trainer-name");
  if (trainerName && trainerNameEl) {
    trainerNameEl.textContent = trainerName;
  }

  // Profielfoto aanpassen op basis van gender
  const profileImageEl = document.querySelector(".trainer-image img");
  if (profileImageEl && selectedGender) {
    profileImageEl.src =
      selectedGender === "M"
        ? "../Assets/Player/male.png"
        : "../Assets/Player/female.png";
  }

  // Main Pokémon (nickname en afbeelding/type ophalen via API)
  if (selectedPokemon) {
    const data = await getPokemonData(selectedPokemon);
    if (data) {
      document.querySelector(".main-pokemon img").src =
        data.sprites.front_default;
      document.querySelector(".main-pokemon h3").textContent =
        pokemonNickname || data.name;
      document.querySelector(".main-pokemon p").textContent =
        "Type: " + data.types.map((t) => t.type.name).join(", ");
    }
  }

  // Voeg eventueel hier meer toe om andere teamleden te tonen
});

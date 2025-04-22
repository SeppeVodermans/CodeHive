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
/*async function updateMainPokemon(pokemonName) {
  const pokemonData = await getPokemonData(pokemonName);
  if (!pokemonData) return;
*/
  /*Update Info Main Pokemon*/
  /*document.querySelector(".main-pokemon img").src =
    pokemonData.sprites.front_default;
  document.querySelector(".main-pokemon h3").innerText = pokemonData.name;
  document.querySelector(
    ".main-pokemon p"
  ).innerText = `Type: ${pokemonData.types.map((t) => t.type.name).join(", ")}`;
}*/

/*Update Pokemon List*/
/*async function updatePokemonList(pokemonNames) {
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
}*/

/*Test Pokemons*/
/*document.addEventListener("DOMContentLoaded", () => {
  updateMainPokemon("gengar");
  updatePokemonList([
    "bulbasaur",
    "squirtle",
    "pikachu",
    "jigglypuff",
    "eevee",
  ]);
});*/

/* Gegevens ophalen van uit localStorage van new game */
/*document.addEventListener("DOMContentLoaded", () => {
  let outputElement = document.getElementById("output");
  if (!outputElement) {
    alert("Element with ID 'output' not found!");
    return;
  }
  outputElement.textContent = "Welcome to your Pokémon adventure!";
});

let trainerName = localStorage.getItem("trainerName");
let pokemonNickname = localStorage.getItem("pokemonNickname");
let profielImageSrc = localStorage.getItem("profileImage");

document.getElementById("trainer-name").textContent = trainerName;
document.getElementById("pokemonNickname").textContent = pokemonNickname;

let profielImage = document.getElementById("trainer-image");
if (profielImageSrc) {
  profielImage.src = profielImageSrc;
}*/

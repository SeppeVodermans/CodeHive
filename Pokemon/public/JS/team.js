/*"use strict";*/

/* Fetch Pokémon data vanuit PokéAPI */
/*async function getPokemonData(pokemonNameOrId) {
  try {
    const response = await fetch(
      `https://pokeapi.co/api/v2/pokemon/${pokemonNameOrId.toLowerCase()}`
    );
    if (!response.ok) throw new Error("Pokémon niet gevonden!");
    return await response.json();
  } catch (error) {
    console.error(error.message);
    return null;
  }
}*/

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
/*Team renderen*/
/*async function renderTeam() {*/
  const team = JSON.parse(localStorage.getItem("trainerTeam") || "[]");
  const grid = document.querySelector(".pokemon-grid");
  grid.innerHTML = "";

  for (const member of team) {
    const data = await getPokemonData(member.name);
    if (!data) continue;

    const card = document.createElement("div");
    card.classList.add("pokemon-card");

    const displayName = member.nickname || data.name;
    const typeList = data.types.map((t) => t.type.name).join(", ");

    card.innerHTML = `
          ${
            member.isMain
              ? `<span class="main-indicator">	&#11088; Main Pokémon</span>`
              : ""
          }
      <img src="${data.sprites.front_default}" alt="${data.name}">
      <h3>${displayName}</h3>
      <p>Type: ${typeList}</p>
      <span>W</span> <span>L</span> <span>D</span>
    `;

    member.isMain ? grid.prepend(card) : grid.appendChild(card);
  }

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
/*Trainer info vanuit localStorage halen*/
/*function loadTrainerInfo() {
  const trainerName = localStorage.getItem("trainerName");
  const selectedGender = localStorage.getItem("selectedGender");

  const nameEl = document.querySelector(".trainer-name");
  const imgEl = document.querySelector(".trainer-image img");

  if (trainerName && nameEl) nameEl.textContent = trainerName;
  if (imgEl && selectedGender) {
    imgEl.src =
      selectedGender === "M"
        ? "../Assets/Player/male.png"
        : "../Assets/Player/female.png";
  }
}*/

/*Team in localStorage opslaan*/
/*function setTrainerTeam(pokemonArray) {
  const uniqueTeam = [];

  for (const pokemon of pokemonArray) {
    if (uniqueTeam.length >= 6) {
      console.warn("Teamlimiet van 6 bereikt. Extra Pokémon worden genegeerd.");
      break;
    }

    const alreadyInTeam = uniqueTeam.some(
      (p) =>
        p.name.toLowerCase() === pokemon.name.toLowerCase() &&
        (p.nickname || "").toLowerCase() ===
          (pokemon.nickname || "").toLowerCase()
    );

    if (!alreadyInTeam) {
      uniqueTeam.push(pokemon);
    } else {
      console.warn(
        `⚠️ ${pokemon.name} (${pokemon.nickname}) is al in je team.`
      );
    }
  }

  localStorage.setItem("trainerTeam", JSON.stringify(uniqueTeam));
}
*/
/*INIT*/
/*document.addEventListener("DOMContentLoaded", async () => {
  loadTrainerInfo();

  const selectedName = localStorage.getItem("selectedPokemon");
  const nickname = localStorage.getItem("pokemonNickname");

  const extraPokemons = [];

  const team = [
    { name: selectedName, nickname: nickname, isMain: true },
    ...extraPokemons.map((p) => ({ ...p, isMain: false })),
  ];

  setTrainerTeam(team);
  await renderTeam();
});*/

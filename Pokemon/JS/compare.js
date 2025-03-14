"use strict";

/*Fetch Pokemon Data*/
document.addEventListener("DOMContentLoaded", () => {
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

  const generateButton = document.querySelector(".generate-button");
  const searchBar = document.querySelector(".search-bar");

  async function updatePokemonDisplay(pokemonData, containerSelector) {
    if (!pokemonData) return;

    const container = document.querySelector(containerSelector);
    if (!container) return;

    // Update afbeelding
    const imgElement = container.querySelector("img");
    imgElement.src = pokemonData.sprites.front_default;

    // Update naam
    const nameElement = container.querySelector(".pokemon-name");
    nameElement.textContent = pokemonData.name.toUpperCase();

    // Update type
    const typeBadge = container.querySelector(".type-badge");
    typeBadge.textContent = pokemonData.types
      .map((t) => t.type.name.toUpperCase())
      .join(", ");
    typeBadge.className = `type-badge type-${pokemonData.types[0].type.name.toLowerCase()}`;

    // Update stats
    const stats = {
      hp: pokemonData.stats[0].base_stat,
      attack: pokemonData.stats[1].base_stat,
      defense: pokemonData.stats[2].base_stat,
      speed: pokemonData.stats[5].base_stat,
    };

    const maxStatValue = 150; // Voor schaaldoeleinden
    container.querySelector(
      ".stat-bar-container:nth-child(1) .stat-bar"
    ).style.width = `${(stats.hp / maxStatValue) * 100}%`;
    container.querySelector(
      ".stat-bar-container:nth-child(2) .stat-bar"
    ).style.width = `${(stats.attack / maxStatValue) * 100}%`;
    container.querySelector(
      ".stat-bar-container:nth-child(3) .stat-bar"
    ).style.width = `${(stats.defense / maxStatValue) * 100}%`;
    container.querySelector(
      ".stat-bar-container:nth-child(4) .stat-bar"
    ).style.width = `${(stats.speed / maxStatValue) * 100}%`;
  }

  async function updateBattleComparison(pokemon1, pokemon2) {
    const data1 = await getPokemonData(pokemon1);
    const data2 = await getPokemonData(pokemon2);

    updatePokemonDisplay(
      data1,
      ".battle-section .pokemon-container:nth-child(1)"
    );
    updatePokemonDisplay(
      data2,
      ".battle-section .pokemon-container:nth-child(3)"
    );
  }

  generateButton.addEventListener("click", () => {
    const input = searchBar.value.trim().split(",");
    if (input.length === 2) {
      updateBattleComparison(input[0], input[1]);
    } else {
      alert(
        "Voer twee Pokémon-namen in, gescheiden door een komma (bijv. Charizard, Blastoise)"
      );
    }
  });

  // Standaardwaarden bij het laden
  updateBattleComparison("squirtle", "blastoise");
});

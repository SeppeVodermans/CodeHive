"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const generateButton = document.querySelector(".generate-button");
  const searchBar = document.querySelector(".search-bar");

  async function getPokemonData(pokemonName) {
    try {
      const response = await fetch(
        `https://pokeapi.co/api/v2/pokemon/${pokemonName.toLowerCase()}`
      );
      if (!response.ok)
        throw new Error(`Pokémon ${pokemonName} niet gevonden!`);
      return await response.json();
    } catch (error) {
      console.error(error.message);
      return null;
    }
  }

  async function updatePokemonDisplay(pokemonData, container) {
    if (!pokemonData) return;

    const imgElement = container.querySelector("img");
    const nameElement = container.querySelector(".pokemon-name");
    const typeBadge = container.querySelector(".type-badge");
    const statSpans = container.querySelectorAll(".stat-row .stat-label span");

    // Update de Pokémon-afbeelding
    imgElement.src = pokemonData.sprites.front_default;

    // Update de naam
    nameElement.textContent = pokemonData.name.toUpperCase();

    // Update het type en voeg een CSS-klasse toe voor styling
    typeBadge.textContent = pokemonData.types
      .map((t) => t.type.name.toUpperCase())
      .join(", ");
    typeBadge.className = `type-badge type-${pokemonData.types[0].type.name.toLowerCase()}`;

    // Update de stats (HP, Attack, Defense, Speed)
    const stats = {
      hp: pokemonData.stats[0].base_stat,
      attack: pokemonData.stats[1].base_stat,
      defense: pokemonData.stats[2].base_stat,
      speed: pokemonData.stats[5].base_stat,
    };

    const statKeys = Object.keys(stats);
    statSpans.forEach((span, index) => {
      span.textContent = stats[statKeys[index]];
    });

    return stats;
  }

  async function updateBattleComparison(pokemon1, pokemon2) {
    const container1 = document.querySelector(
      ".battle-section .pokemon-container:nth-child(1)"
    );
    const container2 = document.querySelector(
      ".battle-section .pokemon-container:nth-child(3)"
    );

    const data1 = await getPokemonData(pokemon1);
    const data2 = await getPokemonData(pokemon2);

    if (data1 && data2) {
      const stats1 = await updatePokemonDisplay(data1, container1);
      const stats2 = await updatePokemonDisplay(data2, container2);

      comparePokemonStats(stats1, stats2, container1, container2);
    }
  }

  function comparePokemonStats(stats1, stats2, container1, container2) {
    const statRows1 = container1.querySelectorAll(".stat-row .stat-label span");
    const statRows2 = container2.querySelectorAll(".stat-row .stat-label span");

    Object.keys(stats1).forEach((stat, index) => {
      const value1 = stats1[stat];
      const value2 = stats2[stat];

      // Reset alle klassen eerst
      statRows1[index].classList.remove(
        "stat-higher",
        "stat-lower",
        "stat-equal"
      );
      statRows2[index].classList.remove(
        "stat-higher",
        "stat-lower",
        "stat-equal"
      );

      // Vergelijk de stats en voeg de juiste klasse toe
      if (value1 > value2) {
        statRows1[index].classList.add("stat-higher");
        statRows2[index].classList.add("stat-lower");
      } else if (value2 > value1) {
        statRows2[index].classList.add("stat-higher");
        statRows1[index].classList.add("stat-lower");
      } else {
        statRows1[index].classList.add("stat-equal");
        statRows2[index].classList.add("stat-equal");
      }
    });
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

  // Standaard vergelijking bij het laden
  updateBattleComparison("charizard", "blastoise");
});

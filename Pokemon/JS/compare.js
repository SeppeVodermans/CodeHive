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

    const statSpans = container.querySelectorAll(".stat-row .stat-label span");
    if (statSpans.length === 4) {
      statSpans[0].textContent = stats.hp;
      statSpans[1].textContent = stats.attack;
      statSpans[2].textContent = stats.defense;
      statSpans[3].textContent = stats.speed;
    }
  }

  async function updateBattleComparison(pokemon1, pokemon2) {
    const data1 = await getPokemonData(pokemon1);
    const data2 = await getPokemonData(pokemon2);

    if (data1 && data2) {
      updatePokemonDisplay(
        data1,
        ".battle-section .pokemon-container:nth-child(1)"
      );
      updatePokemonDisplay(
        data2,
        ".battle-section .pokemon-container:nth-child(3)"
      );

      // **Vergelijk de stats nadat beide Pokémon zijn opgehaald**
      comparePokemonStats(data1, data2);
    }
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

  function comparePokemonStats(pokemon1, pokemon2) {
    const stats1 = pokemon1.stats;
    const stats2 = pokemon2.stats;

    let comparisonHTML = `<h3>${pokemon1.name} vs ${pokemon2.name}</h3><table border='1'><tr><th>Stat</th><th>${pokemon1.name}</th><th>${pokemon2.name}</th></tr>`;

    stats1.forEach((stat, index) => {
      comparisonHTML += updateColorStats(stat, stats2[index]);
    });

    comparisonHTML += "</table>";
    document.getElementById("comparison-container").innerHTML = comparisonHTML;
  }

  function updateColorStats(stat1, stat2) {
    const value1 = stat1.base_stat;
    const value2 = stat2.base_stat;
    const color1 = value1 > value2 ? "style='color: green;'" : "";
    const color2 = value2 > value1 ? "style='color: green;'" : "";

    return `<tr><td>${stat1.stat.name}</td><td ${color1}>${value1}</td><td ${color2}>${value2}</td></tr>`;
  }

  // Standaardwaarden bij het laden
  updateBattleComparison("sandile", "blastoise");
});

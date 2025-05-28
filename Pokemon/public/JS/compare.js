"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const searchBar = document.querySelector(".search-bar");
  const generateButton = document.querySelector(".generate-button");

  async function getPokemonData(name) {
    try {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name.toLowerCase()}`);
      if (!res.ok) throw new Error("Niet gevonden");
      return await res.json();
    } catch (err) {
      console.error("Fout:", err.message);
      return null;
    }
  }

  async function updatePokemonUI(data, container) {
    if (!data) return;

    container.querySelector("img").src = data.sprites.front_default;
    container.querySelector(".pokemon-name").textContent = data.name.toUpperCase();
    const badge = container.querySelector(".type-badge");
    const type = data.types[0].type.name;

    badge.textContent = data.types.map(t => t.type.name.toUpperCase()).join(", ");
    badge.className = `type-badge type-${type}`;

    const stats = {
      hp: data.stats[0].base_stat,
      attack: data.stats[1].base_stat,
      defense: data.stats[2].base_stat,
      speed: data.stats[5].base_stat,
    };

    const spans = container.querySelectorAll(".stat-label span");
    Object.values(stats).forEach((val, idx) => {
      spans[idx].textContent = val;
    });

    return stats;
  }

  function compareStats(playerStats, searchedStats) {
    const playerSpans = document.querySelectorAll("#player-pokemon .stat-label span");
    const searchedSpans = document.querySelectorAll("#searched-pokemon .stat-label span");

    ["hp", "attack", "defense", "speed"].forEach((stat, i) => {
      const val1 = playerStats[stat];
      const val2 = searchedStats[stat];

      playerSpans[i].className = "";
      searchedSpans[i].className = "";

      if (val1 > val2) {
        playerSpans[i].classList.add("stat-higher");
        searchedSpans[i].classList.add("stat-lower");
      } else if (val2 > val1) {
        searchedSpans[i].classList.add("stat-higher");
        playerSpans[i].classList.add("stat-lower");
      } else {
        playerSpans[i].classList.add("stat-equal");
        searchedSpans[i].classList.add("stat-equal");
      }
    });
  }

  async function loadComparePage() {
    const ownName = localStorage.getItem("selectedPokemon") || "pikachu";
    const playerData = await getPokemonData(ownName);
    const defaultData = await getPokemonData("charizard");

    if (playerData && defaultData) {
      const playerStats = await updatePokemonUI(playerData, document.getElementById("player-pokemon"));
      const defaultStats = await updatePokemonUI(defaultData, document.getElementById("searched-pokemon"));
      compareStats(playerStats, defaultStats);
    }
  }

  generateButton.addEventListener("click", async () => {
    const searchName = searchBar.value.trim();
    if (!searchName) return;

    const ownName = localStorage.getItem("selectedPokemon") || "pikachu";
    const playerData = await getPokemonData(ownName);
    const searchData = await getPokemonData(searchName);

    if (playerData && searchData) {
      const playerStats = await updatePokemonUI(playerData, document.getElementById("player-pokemon"));
      const searchStats = await updatePokemonUI(searchData, document.getElementById("searched-pokemon"));
      compareStats(playerStats, searchStats);
    }
  });

  loadComparePage();
});

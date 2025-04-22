async function getAllPokemon() {
  try {
    console.log("Bezig met ophalen van Pokémon...");
    const response = await fetch("https://pokeapi.co/api/v2/pokemon?limit=151");
    if (!response.ok)
      throw new Error("Fout bij het ophalen van de Pokémon lijst.");

    const data = await response.json();
    console.log("Opgehaalde gegevens:", data);

    const pokemonList = await Promise.all(
      data.results.map(async (pokemon) => {
        return await getPokemonData(pokemon.name);
      })
    );

    console.log("Geverifieerde Pokémon:", pokemonList);
    displayPokemon(pokemonList);
  } catch (error) {
    console.error("Fout:", error.message);
  }
}

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

function displayPokemon(pokemonList) {
  const container = document.getElementById("pokemon-container");
  if (!container) {
    console.error("Fout: #pokemon-container bestaat niet in de HTML!");
    return;
  }

  container.innerHTML = "";
  console.log("Pokémon worden weergegeven...");

  const pokemonGrid = document.createElement("div");
  pokemonGrid.classList.add("pokemon-grid");

  const caughtPokemon = JSON.parse(localStorage.getItem("caughtPokemon")) || [];

  pokemonList.forEach((pokemon) => {
    if (!pokemon) return;

    const pokemonTypes = pokemon.types.map((t) => t.type.name).join(", ");
    const isCaught = caughtPokemon.includes(pokemon.name);

    const pokemonCard = document.createElement("div");
    pokemonCard.classList.add("pokemon-card");
    pokemonCard.setAttribute("data-type", pokemonTypes);

    const imgStyle = isCaught
      ? ""
      : 'style="filter: grayscale(100%); opacity: 0.5;"';

    pokemonCard.innerHTML = `
        <img src="${pokemon.sprites.front_default}" alt="${
      pokemon.name
    }" ${imgStyle}>
        <p>${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</p>
      `;

    pokemonGrid.appendChild(pokemonCard);
  });

  container.appendChild(pokemonGrid);
}

document.getElementById("search-bar").addEventListener("input", function () {
  const searchValue = this.value.toLowerCase();
  const pokemonCards = document.querySelectorAll(".pokemon-card");

  pokemonCards.forEach((card) => {
    const name = card.querySelector("p").textContent.toLowerCase();
    if (name.includes(searchValue)) {
      card.style.display = "block";
    } else {
      card.style.display = "none";
    }
  });
});

document.getElementById("type-filter").addEventListener("change", function () {
  const selectedType = this.value;
  const pokemonCards = document.querySelectorAll(".pokemon-card");

  pokemonCards.forEach((card) => {
    const pokemonType = card.getAttribute("data-type");
    if (selectedType === "all" || pokemonType.includes(selectedType)) {
      card.style.display = "block";
    } else {
      card.style.display = "none";
    }
  });
});

// Laadt alle Pokémon bij het starten van de pagina
document.addEventListener("DOMContentLoaded", () => {
  console.log("Pagina geladen, start ophalen van Pokémon...");
  getAllPokemon();
});

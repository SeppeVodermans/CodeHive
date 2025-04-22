async function getPokemonTypes() {
  try {
    const response = await fetch("https://pokeapi.co/api/v2/type");
    if (!response.ok)
      throw new Error("Fout bij het ophalen van Pokémon types!");

    const data = await response.json();
    const typeFilter = document.getElementById("type-filter");

    const allOptions = document.createElement("option");
    allOptions.value = "all";
    allOptions.textContent = "Alle types";
    typeFilter.appendChild(allOptions);

    data.results.forEach((type) => {
      const option = document.createElement("option");
      option.value = type.name;
      option.textContent = capitalizeFirstLetter(type.name);
      typeFilter.appendChild(option);
    });
  } catch (error) {
    console.error("Fout bij het ophalen van types:", error);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  console.log("Pagina geladen, start ophalen van Pokémon...");
  getPokemonTypes();
  getAllPokemon();
});

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

async function displayPokemon(pokemonList) {
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

  for (const pokemon of pokemonList) {
    if (!pokemon) continue;

    const pokemonTypes = pokemon.types.map((t) => t.type.name).join(", ");
    const isCaught = caughtPokemon.includes(pokemon.name);

    const pokemonCard = document.createElement("div");
    pokemonCard.classList.add("pokemon-card");
    pokemonCard.setAttribute("data-type", pokemonTypes);

    const img = document.createElement("img");
    img.src = pokemon.sprites.front_default;
    img.alt = pokemon.name;
    if (!isCaught) {
      img.style.filter = "grayscale(100%)";
      img.style.opacity = "0.5";
    }

    const name = document.createElement("p");
    // name.textContent = pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);

    const infoIcon = document.createElement("span");
    infoIcon.classList.add("info-icon");
    infoIcon.textContent = "ℹ";

    const tooltip = document.createElement("div");
    tooltip.classList.add("tooltip");

    if (isCaught) {
      const speciesRes = await fetch(
        `https://pokeapi.co/api/v2/pokemon-species/${pokemon.name}`
      );
      const speciesData = await speciesRes.json();
      const entry = speciesData.flavor_text_entries.find(
        (e) => e.language.name === "en"
      );
      const description = entry
        ? entry.flavor_text.replace(/\f/g, " ")
        : "No description available.";

      tooltip.innerHTML = `
        <strong>${pokemon.name}</strong><br>
        Type: ${pokemonTypes}<br>
        ${description}
      `;
    } else {
      tooltip.innerHTML = `
        <strong>???</strong><br>
        Type: ???<br>
        Beschrijving: ???
      `;
    }

    infoIcon.appendChild(tooltip);

    pokemonCard.appendChild(infoIcon);
    pokemonCard.appendChild(img);
    pokemonCard.appendChild(name);

    pokemonGrid.appendChild(pokemonCard);
  }

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

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

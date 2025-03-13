// Functie om Pokémon gegevens op te halen
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

// Functie om de hoofd-Pokémon te updaten
async function updateMainPokemon(pokemonName) {
  const pokemonData = await getPokemonData(pokemonName);
  if (!pokemonData) return;

  // Update de hoofd-Pokémon sectie
  document.querySelector(".main-pokemon img").src =
    pokemonData.sprites.front_default;
  document.querySelector(".main-pokemon h3").innerText = pokemonData.name;
  document.querySelector(
    ".main-pokemon p"
  ).innerText = `Type: ${pokemonData.types.map((t) => t.type.name).join(", ")}`;
}

// Functie om de lijst met Pokémon te vullen
async function updatePokemonList(pokemonNames) {
  const pokemonGrid = document.querySelector(".pokemon-grid");
  pokemonGrid.innerHTML = ""; // Leegmaken voor nieuwe Pokémon

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

// **Voer de functies uit met een standaardlijst**
document.addEventListener("DOMContentLoaded", () => {
  updateMainPokemon("gengar"); // Hoofd Pokémon instellen
  updatePokemonList([
    "bulbasaur",
    "squirtle",
    "pikachu",
    "jigglypuff",
    "eevee",
  ]); // Lijst genereren
});

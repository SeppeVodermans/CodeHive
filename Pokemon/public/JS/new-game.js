const starterNames = ["growlithe", "squirtle", "bulbasaur", "pikachu"];
let selectedPokemon = null;

async function getPokemonData(pokemonName) {
  try {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`);
    if (!response.ok) throw new Error(`Pokémon ${pokemonName} niet gevonden!`);
    const data = await response.json();
    return {
      name: data.name,
      img: data.sprites.front_default,
    };
  } catch (error) {
    console.error(error.message);
    return null;
  }
}

async function renderStarterOptions() {
  const grid = document.getElementById("pokemon-grid");
  grid.innerHTML = "";

  const pokemonList = await Promise.all(starterNames.map(name => getPokemonData(name)));

  pokemonList.forEach(pokemon => {
    if (!pokemon) return;
    const card = document.createElement("div");
    card.classList.add("pokemon-card");
    card.innerHTML = `
      <img src="${pokemon.img}" alt="${pokemon.name}" />
      <h3>${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</h3>
      <button onclick="selectPokemon('${pokemon.name}')">Choose</button>
    `;
    grid.appendChild(card);
  });
}

function selectPokemon(pokemonName) {
  selectedPokemon = pokemonName;
  localStorage.setItem("selectedPokemon", pokemonName);
  document.getElementById("output").innerHTML = `You selected <strong>${pokemonName}</strong>!`;
  document.getElementById("name-section").style.display = "block";
}

function updateProfileImage() {
  const selectedGender = document.querySelector('input[name="gender"]:checked')?.value;
  const profileImage = document.querySelector(".trainer-info img");
  if (selectedGender === "M") {
    profileImage.src = "../Assets/Player/male.png";
  } else {
    profileImage.src = "../Assets/Player/female.png";
  }
  localStorage.setItem("selectedGender", selectedGender);
}

document.addEventListener("DOMContentLoaded", () => {
  localStorage.clear();
  renderStarterOptions();

  document.querySelectorAll('input[name="gender"]').forEach(radio => {
    radio.addEventListener("change", updateProfileImage);
  });
});

async function saveTrainer() {
  console.log("saveTrainer called.");
  const name = document.getElementById("trainer-name").value.trim();
  const gender = document.querySelector("input[name='gender']:checked")?.value;
  const customPokemonName = document.getElementById("pokemon-name").value.trim();

  if (!name || !gender || !selectedPokemon) {
    alert("Fill in all fields.");
    return;
  }

  try {
    const response = await fetch("/new-game", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        gender,
        starterPokemonName: selectedPokemon, // we send the name only
        customPokemonName
      })
    });

    const data = await response.json();
    if (data.success) {
      window.location.href = "/team";
    } else {
      alert("Trainer creation failed.");
    }
  } catch (err) {
    console.error("Error saving trainer:", err);
    alert("Server error.");
  }
}

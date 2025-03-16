async function getPokemonData(pokemonName) {
  try {
    const response = await fetch(
      `https://pokeapi.co/api/v2/pokemon/${pokemonName.toLowerCase()}`
    );
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

const pokemonTypes = {
  Fire: ["charmander", "vulpix", "growlithe"],
  Water: ["squirtle", "psyduck", "totodile"],
  Grass: ["bulbasaur", "chikorita", "oddish"],
  Electric: ["pikachu", "mareep", "electrike"],
};

async function fetchPokemonOptions() {
  for (const type in pokemonTypes) {
    pokemonTypes[type] = await Promise.all(
      pokemonTypes[type].map(async (name) => await getPokemonData(name))
    );
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  await fetchPokemonOptions();
});

function updatePokemonList() {
  let type = document.getElementById("starter-pokemon").value;
  let pokemonGrid = document.getElementById("pokemon-grid");

  pokemonGrid.innerHTML = "";

  if (type && pokemonTypes[type]) {
    pokemonTypes[type].forEach((pokemon) => {
      if (!pokemon) return;
      let div = document.createElement("div");
      div.classList.add("pokemon-card");
      div.innerHTML = `
        <img src="${pokemon.img}" alt="${pokemon.name}" width="80"/>
        <h3>${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</h3>
        <button onclick="selectPokemon('${pokemon.name}')">Choose</button>
      `;
      pokemonGrid.appendChild(div);
    });
  }
}

document
  .getElementById("starter-pokemon")
  .addEventListener("change", updatePokemonList);

function selectPokemon(pokemonName) {
  localStorage.setItem("selectedPokemon", pokemonName);
  document.getElementById(
    "output"
  ).innerHTML = `You selected <strong>${pokemonName}</strong>!`;
  document.getElementById("name-section").style.display = "block";
}

function savePokemonName() {
  let pokemonName = document.getElementById("pokemon-name").value;

  if (pokemonName.trim() === "") {
    alert("Please enter a valid name!");
    return;
  }

  localStorage.setItem("pokemonNickname", pokemonName);
  alert(`Your Pokémon is now called ${pokemonName}!`);
}

function saveTrainer() {
  let trainerName = document.getElementById("trainer-name").value;
  let selectedPokemon = localStorage.getItem("selectedPokemon");
  let pokemonNickname = localStorage.getItem("pokemonNickname");
  let selectedGender = localStorage.getItem("selectedGender");

  if (!trainerName.trim()) {
    alert("Please enter your name!");
    return;
  }

  if (!selectedPokemon) {
    alert("Please choose a Pokémon!");
    return;
  }

  if (!pokemonNickname) {
    alert("Please name your Pokémon before continuing!");
    return;
  }

  localStorage.setItem("trainerName", trainerName);
  localStorage.setItem("pockemonNickName", pokemonNickname);
  localStorage.setItem("selectedGender", selectedGender);
  document.getElementById(
    "output"
  ).innerHTML = `Welcome <strong>${trainerName}</strong>! You chose <strong>${selectedPokemon}</strong> and named it <strong>${pokemonNickname}</strong>! 🎉`;
  window.location.href = "team.html";
}
function updateProfileImage() {
  let selectedGender = document.querySelector(
    'input[name="gender"]:checked'
  ).value;
  let profileImage = document.querySelector(".trainer-info img");
  if (selectedGender === "M") {
    profileImage.src = "../Assets/Player/male.png";
  } else {
    profileImage.src = "../Assets/Player/female.png";
  }
}
document.querySelectorAll('input[name="gender"]').forEach((radio) => {
  radio.addEventListener("change", updateProfileImage);
});

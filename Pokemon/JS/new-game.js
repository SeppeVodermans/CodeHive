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

let pokemonLoadedData = false;
async function fetchPokemonOptions() {
  for (const type in pokemonTypes) {
    pokemonTypes[type] = await Promise.all(
      pokemonTypes[type].map(async (name) => await getPokemonData(name))
    );
  }
  pokemonLoadedData = true;
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
  console.log("Pokémon Selected:", pokemonName);

  localStorage.setItem("selectedPokemon", pokemonName);

  document.getElementById(
    "output"
  ).innerHTML = `You selected <strong>${pokemonName}</strong>!`;
  document.getElementById("name-section").style.display = "block";
}

function savePokemonName() {
  let pokemonName = document.getElementById("pokemon-name").value;

  if (!pokemonName) {
    alert("Please enter a valid name!");
    return;
  }

  localStorage.setItem("pokemonNickname", pokemonName);
  alert(`Your Pokémon is now called ${pokemonName}!`);
}

function saveTrainer() {
  let trainerName = document.getElementById("trainer-name").value.trim();
  let selectedPokemon = localStorage.getItem("selectedPokemon") || "";
  let pokemonNickname = localStorage.getItem("pokemonNickname") || "";
  let selectedGender = document.querySelector(
    'input[name="gender"]:checked'
  )?.value;

  console.log("Trainer Name:", trainerName);
  console.log("Selected Pokémon:", selectedPokemon);
  console.log("Pokémon nickname:", pokemonNickname);
  console.log("Selected Gender:", selectedGender);

  if (!trainerName) {
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
  //   if (!selectedGender) {
  //     alert("Please select a gender!");
  //     return;
  //   }

  localStorage.setItem("trainerName", trainerName);
  localStorage.setItem("selectedPokemon", selectedPokemon);
  localStorage.setItem("pokemonNickname", pokemonNickname);
  localStorage.setItem("selectedGender", selectedGender);
  document.getElementById(
    "output"
  ).innerHTML = `Welcome <strong>${trainerName}</strong>! You chose <strong>${selectedPokemon}</strong> and named it <strong>${pokemonNickname}</strong>! 🎉`;
  output.classList.add("fade-out");
  setTimeout(() => {
    window.location.href = "team.html";
  }, 3000);

  const team = [
    {
      name: selectedPokemon,
      nickname: pokemonNickname,
      isMain: true,
    },
  ];

  localStorage.setItem("trainerTeam", JSON.stringify(team));
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
  localStorage.setItem("selectedGender", selectedGender);
}
document.querySelectorAll('input[name="gender"]').forEach((radio) => {
  radio.addEventListener("change", updateProfileImage);
});

document.addEventListener("DOMContentLoaded", () => {
  console.log("clearing previous data...");
  localStorage.removeItem("selectedPokemon");
  localStorage.removeItem("pokemonNickname");
  localStorage.removeItem("trainerName");
});
// localStorage.setItem("selectedPokemon", "pikachu");
// console.log(localStorage.getItem("selectedPokemon"));

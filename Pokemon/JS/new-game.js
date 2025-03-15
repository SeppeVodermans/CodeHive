const pokemonOptions = {
  Fire: [
    {
      name: "Charmander",
      img: "../Assets/Generation 1 Pokémon/0004 Charmander.png",
    },
    { name: "Vulpix", img: "../Assets/Generation 1 Pokémon/Vulpix.png" },
    {
      name: "Growlithe",
      img: "../Assets/Generation 1 Pokémon/Growlithe.png",
    },
  ],
  Water: [
    {
      name: "Squirtle",
      img: "../Assets/Generation 1 Pokémon/0007 Squirtle.png",
    },
    {
      name: "Psyduck",
      img: "../Assets/Generation 1 Pokémon/Psyduck.png",
    },
    {
      name: "Totodile",
      img: "../Assets/Generation 1 Pokémon/Totodile.png",
    },
  ],
  Grass: [
    {
      name: "Bulbasaur",
      img: "../Assets/Generation 1 Pokémon/0001 Bulbasaur.png",
    },
    {
      name: "Chikorita",
      img: "../Assets/Generation 1 Pokémon/Chikorita.png",
    },
    { name: "Oddish", img: "../Assets/Generation 1 Pokémon/Oddish.png" },
  ],
  Electric: [
    {
      name: "Pikachu",
      img: "../Assets/Generation 1 Pokémon/0025 Pikachu.png",
    },
    { name: "Mareep", img: "../Assets/Generation 1 Pokémon/Mareep.png" },
    {
      name: "Electrike",
      img: "../Assets/Generation 1 Pokémon/Electrike.png",
    },
  ],
};

function updatePokemonList() {
  let type = document.getElementById("starter-pokemon").value;
  let pokemonGrid = document.getElementById("pokemon-grid");

  pokemonGrid.innerHTML = "";

  if (type && pokemonOptions[type]) {
    pokemonOptions[type].forEach((pokemon) => {
      let div = document.createElement("div");
      div.classList.add("pokemon-card");
      div.innerHTML = `<img src="${pokemon.img}" alt="${pokemon.name}" width="80"/>
              <h3>${pokemon.name}</h3>
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

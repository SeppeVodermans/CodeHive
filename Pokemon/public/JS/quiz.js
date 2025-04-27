let currentPokemon;
let count = 0;

document.addEventListener("DOMContentLoaded", function () {
  const pokemonImage = document.getElementById("pokemonImage");
  const inputField = document.querySelector(".guess-box input");
  const button = document.querySelector(".guess-box button");

  let correctPokemonName = "";

  async function getRandomPokemon() {
    const randomId = Math.floor(Math.random() * 151) + 1;
    const response = await fetch(
      `https://pokeapi.co/api/v2/pokemon/${randomId}`
    );
    const data = await response.json();

    correctPokemonName = data.name;
    currentPokemon = data;

    pokemonImage.src = data.sprites.other["official-artwork"].front_default;
    pokemonImage.style.opacity = "1";
    pokemonImage.style.display = "block";
    pokemonImage.classList.add("silhouette");

    inputField.value = "";
  }

  function checkAnswer(event) {
    if (event) event.preventDefault();

    if (
      inputField.value.trim().toLowerCase() === correctPokemonName.toLowerCase()
    ) {
      count += 5;
      pokemonImage.classList.remove("silhouette");

      setTimeout(() => {
        getRandomPokemon();
      }, 2000);
    }
    console.log(count);
  }

  button.addEventListener("click", checkAnswer);
  inputField.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
      checkAnswer(event);
    }
  });
  document.getElementById("skip").addEventListener("click", getRandomPokemon);
  document.addEventListener("keypress", async function (event) {
    if (event.key === "Enter") {
      await getRandomPokemon(event);
    }
  });

  getRandomPokemon();
});

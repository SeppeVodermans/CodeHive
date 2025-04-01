let currentPokemon;
let caughtPokemons = [];
let isCatching = false;

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

async function loadRandomPokemon() {
  const randomId = Math.floor(Math.random() * 151) + 1;
  const respons = await fetch(`https://pokeapi.co/api/v2/pokemon/${randomId}`);
  const data = await respons.json();

  currentPokemon = data;

  document.querySelector("#pokemonImage").src =
    data.sprites.other["official-artwork"].front_default;
  pokemonImage.style.opacity = "1";
  pokemonImage.style.display = "block";

  document.querySelector(
    "#pokemonName"
  ).textContent = `Een wilde ${capitalizeFirstLetter(
    data.name ?? "onbekend"
  )} duikt op!`;
}
window.onload = loadRandomPokemon;

let rareAttempts = 2;
let normalAttempts = 3;
let epicAttempts = 1;

function updateStatus() {
  document.getElementById("rare-attempts").textContent = rareAttempts;
  document.getElementById("normal-attempts").textContent = normalAttempts;
  document.getElementById("epic-attempts").textContent = epicAttempts;
}

function generateRandomNumber() {
  return Math.floor(Math.random() * 100) + 1;
}

async function attemptCatch(ballType) {
  if (!currentPokemon || isCatching) return;
  isCatching = true;

  if (caughtPokemons.some(pokemon => pokemon.name === currentPokemon.name)) {
    document.getElementById("catch-status").textContent = `✅ ${capitalizeFirstLetter(currentPokemon.name)} is al gevangen!`;
    isCatching = false;
    return;
  }

  let pokemonNumber = generateRandomNumber();
  let playerNumber = generateRandomNumber();
  let catchChances = { rare: 70, normal: 50, epic: 90 }[ballType] || 50;

  const ball = document.querySelector(`#${ballType}-pokeball img`);
  const pokemonImage = document.querySelector("#pokemonImage");

  // Pokémon springt in de bal
  pokemonImage.classList.add("jump");
  await new Promise((resolve) => setTimeout(resolve, 700));

  // Pokémon verdwijnt & bal schudt
  pokemonImage.style.opacity = "0";
  ball.classList.add("shake");
  await new Promise((resolve) => setTimeout(resolve, 4000));
  ball.classList.remove("shake");

  if (pokemonNumber <= catchChances && playerNumber <= catchChances) {
    document.getElementById("catch-status").textContent = `🎉 Je hebt ${capitalizeFirstLetter(currentPokemon.name)} gevangen!`;

    // Laat keuze-opties zien
    document.getElementById("catch-options").style.display = "block";

    await new Promise((resolve) => {
      document.getElementById("keep-pokemon").onclick = () => {
        document.getElementById("catch-options").style.display = "none";

        // Laat bijnaam-invoer zien
        document.getElementById("nickname-container").style.display = "block";
        document.getElementById("confirm-nickname").onclick = () => {
          let nickname = document.getElementById("nickname-input").value.trim();
          let finalName = nickname || capitalizeFirstLetter(currentPokemon.name);

          caughtPokemons.push({ ...currentPokemon, nickname: finalName });
          document.getElementById("catch-status").textContent = `🎉 ${finalName} is toegevoegd aan je collectie!`;

          // Reset nickname invoer en verberg
          document.getElementById("nickname-input").value = "";
          document.getElementById("nickname-container").style.display = "none";
          resolve();
        };
      };

      document.getElementById("release-pokemon").onclick = () => {
        document.getElementById("catch-status").textContent = `😢 Je hebt ${capitalizeFirstLetter(currentPokemon.name)} vrijgelaten!`;
        document.getElementById("catch-options").style.display = "none";
        resolve();
      };
    });
  } else {
    document.getElementById("catch-status").textContent = `😢 ${capitalizeFirstLetter(currentPokemon.name)} is ontsnapt!`;
  }

  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Reset Pokémon afbeelding
  pokemonImage.style.opacity = "1";
  pokemonImage.style.display = "block";
  pokemonImage.classList.remove("jump");

  await loadRandomPokemon(); // Laad nieuwe Pokémon
  isCatching = false;
}
document.getElementById("rare-pokeball").addEventListener("click", async () => {
  if (rareAttempts > 0) {
    rareAttempts--;
    await attemptCatch("rare");
    updateStatus();
  } else {
    alert("Geen pogingen meer met de Rare Pokéball!");
  }
});

document
  .getElementById("normal-pokeball")
  .addEventListener("click", async () => {
    if (normalAttempts > 0) {
      normalAttempts--;
      await attemptCatch("normal");
      updateStatus();
    } else {
      alert("Geen pogingen meer met de Normale Pokéball!");
    }
  });

document.getElementById("epic-pokeball").addEventListener("click", async () => {
  if (epicAttempts > 0) {
    epicAttempts--;
    await attemptCatch("epic");
    updateStatus();
  } else {
    alert("Geen pogingen meer met de Epic Pokéball!");
  }
});
updateStatus();

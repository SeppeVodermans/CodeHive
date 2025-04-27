async function searchEvolution() {
    const name = document.getElementById("pokemonInput").value.toLowerCase().trim();
    const container = document.getElementById("evolutionPath");
    container.innerHTML = "Laden...";

    const capitalize = str => str.charAt(0).toUpperCase() + str.slice(1);

    try {
        const result = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${name}`);
        const data = await result.json();

        const evolutionRes = await fetch(data.evolution_chain.url);
        const evolutionData = await evolutionRes.json();

        const path = [];
        let current = evolutionData.chain;
        while (current) {
            path.push(current.species.name);
            current = current.evolves_to[0];
        }

        container.innerHTML = "";

        for (let i = 0; i < path.length; i++) {
            const pokeName = path[i];

            
            const pokeRes = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokeName}`);
            const pokeData = await pokeRes.json();

            const div = document.createElement("div");
            div.className = "pokemon";
            div.innerHTML = `<img src="${pokeData.sprites.front_default}" alt="${pokeName}"><p>${capitalize(pokeName)}</p>`;
            container.appendChild(div);

            if (i < path.length - 1) {
                const arrow = document.createElement("div");
                arrow.className = "arrow";
                arrow.innerText = "→";
                container.appendChild(arrow);
            }
        }
    } catch (err) {
        container.innerHTML = "Kon de evolutie niet ophalen, controleer de naam.";
        console.error(err);
    }
}

document.getElementById("searchForm").addEventListener("submit", function (event) {
    event.preventDefault();
    searchEvolution();
});

async function main() {
    try {
        const response = await fetch("https://pokeapi.co/api/v2/pokemon?limit=2"); 
        if (!response.ok) throw new Error("Fout bij het ophalen van Pokémon");

        const data = await response.json();
        
        data.results.forEach(pokemon => {
            alert("Uw Pokemon is " + pokemon.name)
        });
    } 
    catch (e) {
        alert("Error: " + e.message);
    }
}

main();
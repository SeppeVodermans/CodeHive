window.onload = function (){
    const username = localStorage.getItem('username');
    if(username){
        alert('Welkom terug, ' + username + '!');
    }
};

const form = document.querySelector('form');
form.addEventListener('submit', function(event){
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    if(username && password){
        localStorage.setItem('username', username);
        alert("Je bent ingelogd als " + username);
        form.reset();
    } else {
        alert("Vul een geldige gebruikersnaam en wachtwoord in");
    }
});


const projectLinks = document.querySelectorAll('ul li a');

projectLinks.forEach(link  => {
    link.onclick = (event) => {
        event.preventDefault();
        document.querySelectorAll("div")
        const username = localStorage.getItem('username');
        const projectName = event.target.textContent; 

        if(!username && password){
            alert("Je moet eerst inloggen om een spel te spelen");
        } else if (projectName === 'Pokemon'){
            alert("Welkom bij Pokemon");
        } else {
            alert("Je kunt niet deelnemen aan deze spel");
        }
    }
});


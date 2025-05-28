/*
window.onload = function () {
  // const username = localStorage.getItem("username");
  if (username) {
    alert("Welkom terug, " + username + "!");
  }
};
*/
const form = document.querySelector("form");

if (form) {
  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    if (username && password) {
      localStorage.setItem("username", username);
      alert("Je bent ingelogd als " + username);
      window.location.href = "new-game";
    } 
/*   else {
      alert("Vul een geldige gebruikersnaam en wachtwoord in");
    }
*/
  });
}

const registerButton = document.getElementById("registerButton");

if (registerButton) {
  registerButton.addEventListener("click", function () {
    window.location.href = "/register"; 
  });
}


const projectLinks = document.querySelectorAll("ul li a");

projectLinks.forEach(link => {
    link.onclick = (event) => {
        event.preventDefault();
        
        const username = localStorage.getItem('username');
        const projectName = event.target.closest('li').querySelector('p').textContent; 
        
        if (!username) {
            if (projectName === 'Pokemon') {
                alert("Je moet eerst inloggen om Pokemon te spelen.");
                window.location.href = "aanmelden"; 
            } else {
                alert("Je moet eerst inloggen om een spel te spelen.");
            }
        } else if (projectName === 'Pokemon') {
            alert("Welkom bij Pokemon!");
            window.location.href = event.target.closest('a').href; 
            window.location.href = "aanmelden"; 
        } else {
            alert("Je kunt niet deelnemen aan dit spel.");
        }
    };
});

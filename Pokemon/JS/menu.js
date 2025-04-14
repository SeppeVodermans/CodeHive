/*js voor menu rechts*/
document.addEventListener('DOMContentLoaded', function() {
    const menuButton = document.querySelector('.menu-button');
    const mainContent = document.querySelector('.main-content');
    const menuOverlay = document.querySelector('.menu-overlay');
    const closeButton = document.querySelector('.close-button');
    const body = document.body;

    function openMenu() {
        menuOverlay.classList.add('active');
        mainContent.classList.add('behind-menu');
        body.classList.add('menu-open');
        menuButton.style.display = 'none';
    }

    function closeMenu() {
        menuOverlay.classList.remove('active');
        mainContent.classList.remove('behind-menu');
        body.classList.remove('menu-open');
        menuButton.style.display = 'flex';
    }

    menuButton.addEventListener('click', openMenu);
    closeButton.addEventListener('click', closeMenu);

    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        item.addEventListener('click', closeMenu);
    });
});
/*js voor exit menu*/
document.addEventListener('DOMContentLoaded', function() {
  const mainContent = document.querySelector('.main-content');
  const exitMenuOverlay = document.querySelector('.exit-menu-overlay');
  const body = document.body;
  
  const continueBtn = document.getElementById('continue-btn');
  const saveBtn = document.getElementById('save-btn');
  const quitBtn = document.getElementById('quit-btn');

  function openExitMenu() {
    exitMenuOverlay.classList.add('active');
  }

  function closeExitMenu() {
    exitMenuOverlay.classList.remove('active');
  }

  /*esc knop drukken*/
  document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
      if (exitMenuOverlay.classList.contains('active')) {
        closeExitMenu();
      } else {
        openExitMenu();
      }
    }
  });

  //speel verder 
  continueBtn.addEventListener('click', function(e) {
    e.preventDefault();
    closeExitMenu();
  });
//spel opslaan
  saveBtn.addEventListener('click', function(e) {
    e.preventDefault();
  });
//spel verlaten
  quitBtn.addEventListener('click', function(e) {
    e.preventDefault();
    window.location.href = '../index.html';
  });
});
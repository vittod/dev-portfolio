const doc = $(document);
const exitGame = $('#exit-game');
const musicPage = $('#music');
const contactPage = $('#contact');
const projectsLink = $('#projects-link');
const musicLink = $('#music-link');
const contactLink = $('#contact-link');
const allNav = $('.navbar-nav a');

doc
  .on('click', (e) => {
    console.log('e', e.target.id);
    switch (e.target.id) {
      case 'brand-link':
        showMainPage();
        highlightLink('clear');
        break;
      case 'music-link':
        showMusicPage();
        highlightLink('music-link');
        break;
      case 'contact-link':
        showContactPage();
        highlightLink('contact-link');
        break;
      case 'projects-link':
        showMainPage();
        highlightLink('projects-link');
        break;
      case 'projects':
        toggleGameView();
        toggleGameExit(2100);
        break;
      case 'exit-game':
        toggleGameView();
        toggleGameExit(200);
        highlightLink('clear');
        break;
      case 'explainPortfolioGame':
        highlightLink('clear');
        break;
      case 'modal-close':
        highlightLink('clear');
        break;
    }
  })
  .on('keydown', (e) => {
    switch (e.key) {
      case 'Escape':
        toggleGameView();
        toggleGameExit(200);
        highlightLink('clear');
        break;
    }
  });

function toggleGameExit(timer) {
  setTimeout(() => exitGame.toggle(), timer);
}

function showMusicPage() {
  musicPage.addClass('translate-up');
  contactPage.removeClass('translate-up');
}

function showMainPage() {
  contactPage.removeClass('translate-up');
  musicPage.removeClass('translate-up');
}
function showContactPage() {
  contactPage.addClass('translate-up');
  musicPage.removeClass('translate-up');
}

function highlightLink(target) {
  console.log('highlight', target);
  switch (target) {
    case 'clear':
      Array.prototype.slice.call(allNav).forEach((el) => el.classList.remove('nav-active'));
      break;
    case 'projects-link':
      Array.prototype.slice.call(allNav).forEach((el) => el.classList.remove('nav-active'));
      projectsLink.addClass('nav-active');
      break;
    case 'music-link':
      Array.prototype.slice.call(allNav).forEach((el) => el.classList.remove('nav-active'));
      musicLink.addClass('nav-active');
      break;
    case 'contact-link':
      Array.prototype.slice.call(allNav).forEach((el) => el.classList.remove('nav-active'));
      contactLink.addClass('nav-active');
      break;
  }
}

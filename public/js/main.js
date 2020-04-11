'use strict';

const offineIcon = document.getElementById('offline-img');

window.addEventListener('offline', () => {
  console.log('yo');
  offineIcon.classList.add('show-elem');
});
window.addEventListener('online', () => {
  console.log('no');
  offineIcon.classList.remove('show-elem');
});

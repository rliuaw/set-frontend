// Adapted from https://codepen.io/ullibodnar/pen/MXoezR

var toggleElements = [
  document.querySelector('body'),
  document.querySelector('.panel')
]

function refreshNightMode() {
  toggleElements.forEach(element => {
    if(element) {
      element.classList.remove('night-mode')
      if (localStorage.getItem('mode') === 'night') {
        element.classList.add('night-mode')
      }
    }
  });
}

// nightModeInitialize
var nightModeInitialize = function() {
  var footer = document.getElementById('footer-night-mode');
  var nightModeButton = document.createElement('button');
  nightModeButton.classList.add('nightModeButton');
  nightModeButton.innerText = '🌙 Night Mode';
  nightModeAddElement(nightModeButton);
  footer.appendChild(nightModeButton);

  // Recover night mode state, then enable transitions only after loaded.
  refreshNightMode();
  window.onload = (event) => {
    toggleElements.forEach(element => {if(element) element.classList.add('transition-mode')});
  };
}();


// Night mode button listener
document.querySelector('.nightModeButton').onclick = function () {
  if (localStorage.getItem('mode') === 'night') {
    localStorage.setItem('mode', 'day');
  } else {
    localStorage.setItem('mode', 'night');
  }
  refreshNightMode();
};

function nightModeAddElement(element) {
  if(element) {
    element.classList.remove('night-mode')
    if (localStorage.getItem('mode') === 'night') {
      element.classList.add('night-mode')
    }
    element.classList.add('transition-mode')
    toggleElements.push(element);
  }
}
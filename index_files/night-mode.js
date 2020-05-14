// Adapted from https://codepen.io/ullibodnar/pen/MXoezR

var nightModeToggleButton = document.querySelector(".nightModeButton");
var body = document.querySelector("body");
var panel = document.querySelector(".panel");

function toggleNight() {
  nightModeToggleButton.classList.toggle("night-mode");
  body.classList.toggle("night-mode");
  panel.classList.toggle("night-mode");
}

if (localStorage.getItem("mode") === "night") {
  toggleNight();
}

nightModeToggleButton.onclick = function () {
  toggleNight();
  if (localStorage.getItem("mode") === "night") {
    localStorage.setItem("mode", "day");
  } else {
    localStorage.setItem("mode", "night");
  }
};
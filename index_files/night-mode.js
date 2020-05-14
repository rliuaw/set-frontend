// Adapted from https://codepen.io/ullibodnar/pen/MXoezR

var toggleElements = [
  document.querySelector(".nightModeButton"),
  document.querySelector("body"),
  document.querySelector(".panel")
]

function toggleNight() {
  toggleElements.forEach(element => {if(element) element.classList.toggle("night-mode")});
}

if (localStorage.getItem("mode") === "night") {
  toggleNight();
}

document.querySelector(".nightModeButton").onclick = function () {
  toggleNight();
  if (localStorage.getItem("mode") === "night") {
    localStorage.setItem("mode", "day");
  } else {
    localStorage.setItem("mode", "night");
  }
};
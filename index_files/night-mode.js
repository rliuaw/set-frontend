// Adapted from https://codepen.io/ullibodnar/pen/MXoezR

var toggleElements = [
  document.querySelector(".nightModeButton"),
  document.querySelector("body"),
  document.querySelector(".panel")
]
function toggleNight() {
  toggleElements.forEach(element => {if(element) element.classList.toggle("night-mode")});
}

// Recover night mode state, then enable transitions.
if (localStorage.getItem("mode") === "night") {
  toggleNight();
}
window.onload = (event) => {
  toggleElements.forEach(element => {if(element) element.classList.add("transition-mode")});
};


// Night mode button listener
document.querySelector(".nightModeButton").onclick = function () {
  toggleNight();
  if (localStorage.getItem("mode") === "night") {
    localStorage.setItem("mode", "day");
  } else {
    localStorage.setItem("mode", "night");
  }
};

function nightModeAddElement(element) {
  if(element) {
    toggleElements.push(element);
    if (localStorage.getItem("mode") === "night") {
      element.classList.add("night-mode")
    } else {
      element.classList.remove("night-mode")
    }
    element.classList.add("transition-mode")
  }
}
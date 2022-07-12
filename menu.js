const headerElement = document.querySelector("header > .name-container");

headerElement.innerHTML += "<li onclick='menuClicked(this);'>menu</li>"

const menuElement = document.querySelector(".name-container > li:last-child");

function menuClicked (e) {

    e.style.color = "red";

}
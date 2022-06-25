const cursorTag = document.querySelector("div.cursors");
const ball = cursorTag.querySelector("div");
const locationIndicator = document.querySelector(".cursor-location-parent>p");


let aimX = 0;
let aimY = 0;

let currentX = 0;
let currentY = 0;

let speed = 0.5;

const animate = function () {

    currentX += (aimX - currentX) * speed;
    currentY += (aimY - currentY) * speed;

    ball.style.left = currentX + "px";
    ball.style.top = currentY + "px";

    locationIndicator.innerHTML = aimX + " px, " + aimY + " px"

    requestAnimationFrame(animate);
}

animate();

document.addEventListener("mouseleave", function (event) {
    ball.style.opacity = 0;
});
document.addEventListener("mouseenter", function (event) {
    ball.style.opacity = 1;
    aimX = event.pageX;
    aimY = event.pageY;
});

document.addEventListener("mousemove", function (event) {

    aimX = event.pageX;
    aimY = event.pageY;

});
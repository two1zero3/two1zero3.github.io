const headerElement = document.querySelector("header > .name-container");
headerElement.innerHTML += "<li style='width:20vw;' onclick='menuClicked(this);'>menu</li>"
const menuOptions = ["all", "music", "video", "other"];
const menuColors = ["red" , "green", "blue", "orange"];
let menuIndex = 0;

const allItems = document.querySelectorAll("section > a");
const musicRecordings = document.querySelectorAll("section > a[itemtype*='MusicRecording']");
const videoObjects = document.querySelectorAll("section > a[itemtype*='VideoObject']");
const creativeWorks = document.querySelectorAll("section > a[itemtype*='CreativeWork']");

let menuArray = [allItems, musicRecordings, videoObjects, creativeWorks];

console.log(musicRecordings);

function menuClicked (e) {

    e.innerHTML = menuOptions[menuIndex % menuOptions.length];              //switch inner text on each click of the menu

    menuArray.forEach(element => {                                          //display no objects (to reset)
        element.forEach(element => {
            element.style.display = "none";
        });
    });

    menuArray[menuIndex % menuOptions.length].forEach(element => {          //display only selection objects
        element.style.display = "block";
        e.style.color = menuColors[menuIndex % menuOptions.length];
    });

    menuIndex++; //incriment for each menu item

}
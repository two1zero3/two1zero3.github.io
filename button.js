let soloElements = document.getElementsByClassName("solo");
let leftToggle = true;
let rightToggle = true;

function toggleCheckbox (e) {

    console.log(e);

    if (e == "left-button" && leftToggle) {

        for (let i = 0; i < soloElements.length; i++) {
            soloElements[i].style.display = "none";

        }

        leftToggle = !leftToggle;

    }
    else if (e == "left-button" && !leftToggle) {


        console.log(soloElements);
        for (let i = 0; i < soloElements.length; i++) {
            soloElements[i].style.display = "block";
        }

        leftToggle = !leftToggle;

    }

}
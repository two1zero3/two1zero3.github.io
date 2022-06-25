const locations = document.querySelectorAll("ul.member-links li")

const updatedTimes = function () {

    locations.forEach(location => {

        const outputMinutes = location.querySelector("output:first-of-type");
        const outputHours = location.querySelector("output:last-of-type");
        const timezone = location.getAttribute("data-timezone");

        const now = luxon.DateTime.now().setZone(timezone);

        outputMinutes.innerHTML = now.toFormat("mm");
        outputHours.innerHTML = now.toFormat("HH");

    })

}

updatedTimes();

setInterval(function () {
    updatedTimes();
}, 1000)

console.log(locations);

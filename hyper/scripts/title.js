let body;

function setup () {

    body = select("body");

    //when clicking the body redirect to the next page
    body.mousePressed(redirect);
    
}

function draw () {

}

function redirect () {

    body.class("fade-out");
    setTimeout(() => {
        window.location.href = "submit.html";
    }, 1000);
}
// Description: Main entry point for the application
let canvas;
let motion = false;
let ios = false;
let cursor;
let information;
let spotify;
let urlCodexObject;

// if (typeof DeviceMotionEvent.requestPermission === 'function') {
//     // add another event listener on click to request permission
//     document.body.addEventListener('click', function() {
//       DeviceMotionEvent.requestPermission()
//         .then(function() {
//           console.log('DeviceMotionEvent enabled');

//           motion = true;
//           ios = true;
//         })
//         .catch(function(error) {
//           console.warn('DeviceMotionEvent not enabled', error);
//         })
//     })
// }

function setup() {

    canvas = createCanvas(windowWidth, windowHeight);
    canvas.parent("canvas-container");

    spotify = new spotifyData("submit");
    console.log(spotify);

    urlCodexObject = new urlCodex("encode");
}

function draw() {
  select("#cover-art").style("border", `0.25em solid ${select("#color").value()}`);
  select("textarea").style("color", select("#color").value());
}


function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}
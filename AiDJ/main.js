// TODO : REWRITE INGESTION PART OF AUDIO TO MAKE EVERYTHING 44.1Khz (STARTED) --> DONE
// ALSO OPTIMISE / REWRITE WAVEFORM DISPLAY PART OF CODE !! --> DONE
// MAKE WAVEFORM COLORED DEPENDING ON LOW MID HIGH ENERGY --> ALMOST DONE
// MAKE WAVEFORM DISPLACEABLE WHEN DRAGGING IT UP OR DOWN --> FIND SOLUTION FOR MAKING IT SMOOTH
// START WORK TO MAKE EVERYTHING WORK WITH 2 MUSIC TRACKS
// START WORK ON THE INTERFACE AND LOOPING / FX ETC

// !! MAKE WAVEFORM DISPLAY MORE PLAYFUL ? MORE INTUITIVE SOMETHING MORE GRAPHIC LIKE DOTS?

// 2022 Copyright Andreas Reza Abbaszadeh
var canvas;
var musicTrackL; // the current left track playing --> refer to musicTrack.js constructor
var musicTrackR; // the current right track playing --> refer to musicTrack.js constructor
var audioCtx;  // define AudioContext as 44.1khz --> hardcoded in p5.sound.js to simplify audio processing by Essentia

var drag = 0;
var bpmL;
var bpmR;

var mouseWasPressed;

//Create P5.js Canvas in global mode
function setup() {

    audioCtx = getAudioContext();
    audioCtx.suspend();

    pixelDensity(displayDensity());

    canvas = createCanvas(windowWidth,windowHeight);
    canvas.parent("#Canvas");

    //CREATE LEFT AND RIGHT TRACKS FROM CLASS
    musicTrackL = new MusicTrack(0);
    musicTrackR = new MusicTrack(1);
    canvas.drop( (e) => {musicTrackL.dropHandler(e)} );

    frameRate(240);

}

p5.prototype.mouseWasPressed = function () {
    mouseWasPressed = mouseIsPressed;
}

p5.prototype.registerMethod('post', p5.prototype.mouseWasPressed);

function draw() {

    background(255);

    // set the sync of the pg buffer position relating to the track play position + metronome tick log console
    musicTrackL.sync();
    musicTrackR.sync();

    push();

    stroke(255,0,0);
    line(0,musicTrackL.pg.height/2,musicTrackL.pg.width*2,musicTrackL.pg.height/2); //red line in the middle of the screen

    stroke(255,255,255);
    line(200, 0, 200, 400);

    fill(255);
    text(~~frameRate(), 50, 50);

    pop();

}

function mousePressed() {
    userStartAudio();
    
}

const closestIndex = (num, arr) => {
    let curr = arr[0], diff = Math.abs(num - curr);
    let index = 0;
    for (let val = 0; val < arr.length; val++) {
       let newdiff = Math.abs(num - arr[val]);
       if (newdiff < diff) {
          diff = newdiff;
          curr = arr[val];
          index = val;
       };
    };
    return index;
};
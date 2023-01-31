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

var inputFile;
var myButton;

var drag = 0;

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

    myButton = new Clickable(50,450);
    myButton.text = "⏯︎";
    myButton.textScaled = true;
    myButton.cornerRadius = 200;
    myButton.resize(100, 100);
    myButton.onHover = function () {this.color = "lightgray"};
    myButton.onOutside = function () {this.color = "white"};
    myButton.onPress = playPause.bind(musicTrackL); //IMPORTANT --> USE BIND FOR COOL OTHER USES

    inputFile = createFileInput(handleFile);

    frameRate(240);

}

function draw() {
    fill("blue");
    rect(0,0,400);

    // set the sync of the pg buffer position relating to the track play position + metronome tick log console
    musicTrackL.sync();
    musicTrackR.sync();

    myButton.draw();

    push();

    stroke(255,0,0);
    line(0,200,400,200); //red line in the middle of the screen

    stroke(255,255,255);
    line(200, 0, 200, 400);

    fill(255);
    text(~~frameRate(), 50, 50);

    pop();

}

function handleFile (file) {
    musicTrackL.dropHandler(file);
}

function playPause () {

    if(this.sound) {

        if (this.sound.isPlaying() && this.sound.playbackRate > 0.1) {

            this.sound.pause();
            myButton.textColor = "red";

        } else if(!this.sound.isPlaying()) {

            this.sound.play(0,1,1);
            myButton.textColor = "green";

        } else if (this.sound.playbackRate < 0.01) {

            this.sound.rate(1);
        }

    }
}

function mousePressed() {
    userStartAudio();
}

function mouseDragged(e) {

    // if (musicTrackL.sound) {

    //     drag += e.movementY;
    //     if (musicTrackL.sound.isPlaying()) {
    //         musicTrackL.sound.rate(0.001);
    //     } else {
    //         musicTrackL.sound.pause();
    //     }
        
    //     console.log(drag);

    // }

}

function mouseReleased() {

    // if (musicTrackL.sound) {
    //     //drag/100 because 1 second is 100 pixels
    //     //if drag and music is playing then jump to position and play
    //     //if drag and music not playing then jump to position and play with playback rate 0
    //     if ( drag !== 0 && musicTrackL.sound.isPlaying() ) {

    //         let time = musicTrackL.sound.currentTime() + drag/100;
    //         time = max(time, 0);
    //         time = min(time, musicTrackL.sound.duration() - 0.01);
    //         console.log(time,  musicTrackL.sound.duration());

    //         musicTrackL.sound.stop();
    //         musicTrackL.sound.play(0,1,1, time);
    //         console.log("CASE 1");
    //     } else if ( drag !== 0 && !musicTrackL.sound.isPlaying() ) {

    //         let time = musicTrackL.sound.currentTime() + drag/100;
    //         time = max(time, 0);
    //         time = min(time, musicTrackL.sound.duration() - 0.01);
    //         console.log(time,  musicTrackL.sound.duration());


    //         musicTrackL.sound.stop();
    //         musicTrackL.sound.play(0,0,1, time);
    //         console.log("CASE 2");
    //     } 

    //     drag = 0; // reset drag
    // }
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
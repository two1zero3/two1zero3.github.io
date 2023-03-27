// !! MAKE WAVEFORM DISPLAY MORE PLAYFUL ? MORE INTUITIVE SOMETHING MORE GRAPHIC LIKE DOTS?
// GET TICK & TEMPO INFORMATION FROM SPOTIFY --> GET HELP FROM ID3 TAGS CHECK ARE.NA

// 2022 Copyright Andreas Reza Abbaszadeh
var canvas;
var musicTrackL; // the current left track playing --> refer to musicTrack.js constructor
var musicTrackR; // the current right track playing --> refer to musicTrack.js constructor
var soundScraper; //the sound data collection class
var syncTracks;
var audioCtx;  // define AudioContext as 44.1khz --> hardcoded in p5.sound.js to simplify audio processing by Essentia

var drag = 0;
var bpmL;
var bpmR;

var svg;
const proxyUrl = 'https://corsproxy.io/?';

p5.disableFriendlyErrors = true;
var mouseWasPressed;

function loadedContent() {
    svg = document.querySelector("svg");
}

//Create P5.js Canvas in global mode
function setup() {

    audioCtx = getAudioContext();
    audioCtx.suspend();

    pixelDensity(displayDensity());

    canvas = createCanvas(windowWidth/2, windowHeight / 3);
    canvas.parent("#Canvas");

    //CREATE LEFT AND RIGHT TRACKS FROM CLASS
    soundScraper = new soundData();
    musicTrackL = new MusicTrack(0);
    musicTrackR = new MusicTrack(1);
    syncTracks = new syncAlgorithm(0.01, 0.001);
    canvas.drop((e) => { musicTrackL.dropHandler(e) });

    frameRate(240);
    textAlign(CENTER, CENTER);

}

p5.prototype.mouseWasPressed = function () {
    mouseWasPressed = mouseIsPressed;
}

p5.prototype.registerMethod('post', p5.prototype.mouseWasPressed);

function draw() {

    background(230);

    stroke(255, 0, 0);
    line(0, height / 2, width, height / 2); //red line in the middle of the screen

    // set the sync of the pg buffer position relating to the track play position + metronome tick log console
    musicTrackL.sync();
    musicTrackR.sync();

    push();

    fill(0);
    // text(~~frameRate(), 50, 50);

    if(musicTrackL.syncOn) {
        syncTracks.syncLoop(musicTrackL, musicTrackR);
    } else if(musicTrackR.syncOn) {
        syncTracks.syncLoop(musicTrackR, musicTrackL);
    }

    pop();

}

function mousePressed() {
    userStartAudio();
}

function windowResized() {
    resizeCanvas(windowWidth/2, windowHeight / 3);

    let tempL = musicTrackL.pg;
    let tempR = musicTrackR.pg;

    musicTrackL.pg = createGraphics(width / 2, height); //make buffer
    musicTrackL.offsetX = 0 * musicTrackL.pg.width;

    musicTrackR.pg = createGraphics(width / 2, height); //make buffer
    musicTrackR.offsetX = 1 * musicTrackR.pg.width;

    tempL.remove();
    tempR.remove();
}

function addSong() {
    //show or hide the add song menu
    if (select(".addsong").elt.classList.contains('visible')) {
        select(".addsong").elt.classList.remove('visible');
        select(".addsong").elt.classList.add('hidden');
        console.log(select(".addsong"));
    } else {
        select(".addsong").elt.classList.remove('hidden');
        select(".addsong").elt.classList.add('visible');
    }
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

function indexOfNearestLessThan(array, needle) {
	if (array.length === 0) return -1;

	var high = array.length - 1,
		low = 0,
		mid,
		item,
		target = -1;
	
	if (array[high] < needle) {
		return high;
	}

	while (low <= high) {
		mid = (low + high) >> 1;
		item = array[mid];
		if (item > needle) {
			high = mid - 1;
		} else if (item < needle) {
			target = mid;
			low = mid + 1;
		} else {
			return low;
		}
	}

	return target;
}

function getAvg(grades) {
    const total = grades.reduce((acc, c) => acc + c, 0);
    return total / grades.length;
  }
  
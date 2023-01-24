//2022 - Andreas Abbaszadeh
let notes = [];
let noteSize = 200;
let backgroundColors;
let backgroundCount = 0;
let drawShapes = false;
let reverb;
let myButton;
let myButton2;
let myButton3;
let backgroundState = false;
let MidiInputsList = [];

//2 couleurs par notes --> density / taille selon la note --> faire + ou - transparent selon hauteur de la gamme


function setup () {
    pixelDensity(displayDensity());
    createCanvas(windowWidth, windowHeight);
    ellipseMode(CENTER);
    rectMode(CENTER);
    noFill();

    myButton = new Clickable(0,0);
    myButton.onPress = _ => {backgroundState = !backgroundState; console.log(backgroundState)};
    myButton.text = "background on/off";   
    myButton2 = new Clickable(100,0);
    myButton2.onPress = _ => {notes.length = 0; backgroundCount++;}
    myButton2.text = "background color";   
    myButton3 = new Clickable(200, 0);
    myButton3.onPress = _ => {drawShapes = !drawShapes;}
    myButton3.text = "connecting lines";   

    reverb = new p5.Reverb();
    reverb.set(3, 2);

    push();
    colorMode(RGB, 255, 255, 255, 255);
    backgroundColors = [255,0, color(127, 127, 127)];
    pop();
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

//TODO :
//ADD REVERB AND INSTEAD OF SINE WAVE ADD IN OTHER SOUND
//THINK OF WAYS TO MAKE DISPLAY MORE INTERSTING? --> MAKE GUI FOR OPTIONS
//MAKE HUE CHANGE ACCORDING TO TIME --> NO?
//MAKE WHOLE CANVAS ADVANCE ACCORDING TO TIME --> Youtube piano https://www.youtube.com/watch?v=8w57c3f9GrI but inverse to make it ??

// Enable WEBMIDI.js and trigger the onEnabled() function when ready
WebMidi
.enable()
.then(onEnabled)
.catch(err => alert(err));

// Function triggered when WEBMIDI.js is ready
function onEnabled() {
    // Display available MIDI input devices
    if (WebMidi.inputs.length < 1) {
        document.body.innerHTML+= "No device detected.";
    } else {
        WebMidi.inputs.forEach((device, index) => {
        MidiInputsList.push(`${index}: ${device.name} \n`);
        console.log( `${index}: ${device.name}`);
        });
    }

    let inputSelection = prompt("chose the inputs from the list [0,1,2,3 ...] \n "+ MidiInputsList, 0);

    const mySynth = WebMidi.inputs[inputSelection];
    mySynth.channels[1].addListener("noteon", e => {
      notes.push(new P5Notes(e.note));
    });

}   

function draw() {

    if (backgroundState)
        background(backgroundColors[backgroundCount % backgroundColors.length]);

    for (let i = 0; i < notes.length; i++) {

        notes[i].update();
        notes[i].draw();
        if (notes[i].lifespan <= 0)
            notes.splice(i, 1);

    }
    if (drawShapes === true) {
        beginShape();
        for (let k = 0; k < notes.length; k++) {
            push();
            stroke(0);
            vertex(notes[k].pos.x, notes[k].pos.y);
            pop();
        }
        endShape(CLOSE);
    }

    push();
    rectMode(CORNER);
    myButton.draw(); 
    myButton2.draw(); 
    myButton3.draw(); 
    pop();

}

function randomNegOrPos() {
    if (random(0, 1) > 0.5) {
        return 1
    } else {
        return -1
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

function keyPressed(e) {
    if (key == 'a' || key == 'A') {

        //clear all notes
        notes.length = 0;

        //set index as one more than previous still in range of array
        backgroundCount++;
    }
    if (key == 't' || key == 'T') {
        drawShapes = !drawShapes;
    }
} 
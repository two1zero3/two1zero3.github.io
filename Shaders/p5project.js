let capture;
let captureWidth = 800;
let captureHeight = 600;
let nbOfWindows = 3;
let imageFrames = [];
let captureIndex = 0;
let colorPicker;
let isonorm3098;
let button;
let buttonWidth = 100;
let buttonHeight = 100;
let contrastIndex = 0;
let typeOfContrast = ["Contraste de Couleur en Soie", "Contraste de Clair / Obscur", "Contraste Chaud / Froid", "Contraste de Quantité", "Contraste de Qualité", "Contraste Simultané",  "Contraste de Complementaires"];

function preload() {

    // PRELOAD FONT

    isonorm3098 = loadFont("./Isonorm3098.otf");
    pixelDensity(2.0);


}

// MAKE ARRAY WITH 1 CAPTURE and 8 BLACK IMAGES

function createFramesArray (arr) {

    for (let i = 0; i < nbOfWindows; i++) {
            
        if(i == 0) {

            arr.push(capture);

        } else {

            let tempFileName = createImage(captureWidth, captureHeight);
            tempFileName.loadPixels();
            for (let i = 0; i < tempFileName.width; i++) {
                for (let j = 0; j < tempFileName.height; j++) {
                    tempFileName.set(i, j, color(0, 0, 0));
                }
            }
            tempFileName.updatePixels();

            arr.push(tempFileName);

        }
        
    }

}

function setup() {

    //CREATE CANVAS

    let canvas = createCanvas(windowWidth, windowHeight);
    canvas.parent("canvas-container");
    noStroke();

    //SET FRAME RATE

    frameRate(30);

    //CREATE VIDEO CAPTURE

    capture = createCapture(VIDEO);
    capture.size(captureWidth, captureHeight);
    capture.hide();

    // MAKE ARRAY WITH 1 CAPTURE and 8 BLACK IMAGES

    createFramesArray(imageFrames);

    //ALIGNMENT SETTINGS

    // imageMode(CENTER);
    // rectMode(CENTER);
    textAlign(CENTER);

    //SPAWN IN BUTTON

    button = createButton("");
    button.size(buttonWidth, buttonHeight);
    button.position(width/2 - buttonWidth/2, height/2 + captureHeight/2 + 50);
    button.mousePressed(changeButtonText);

    // SPAWN IN COLOR PICKER

    colorPicker = createColorPicker('#ed225d');
    colorPicker.size(captureWidth, 40);
    colorPicker.position(width/2 - captureWidth/2, height/2 + captureHeight/2);
    colorPicker.style( "background-color: white;" );

    //TEXT OPTIONS

    textSize(35);
    textFont(isonorm3098);
    
}

//MAIN DRAW FUNCTION

function draw() {

    background(colorPicker.color()); //COLOR EMITTED FOR IMAGE

    text(typeOfContrast[ contrastIndex % typeOfContrast.length ], width/2, height/2 - captureHeight/2 - 20); //CREATE TEXT

    translate(width/2 - captureWidth/2, height/2 - captureHeight/2);

    for (let i = 0; i < imageFrames.length; i++) {
        
        image(imageFrames[i], (captureWidth/3) * (i%3), (captureHeight/3) * (Math.floor(i/3)), captureWidth/3, captureHeight/3);

    }

}

//ADAPT SCREEN SIZE

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    button.position(width/2 - buttonWidth/2, height/2 + captureHeight/2 + 50);
    colorPicker.position(width/2 - captureWidth/2, height/2 + captureHeight/2);
}

//CHANGE BUTTON TEXT

changeButtonText = () => setTimeout(() => { shiftArray(imageFrames, captureIndex); }, 3000); // "TAKE IMAGE" FUNCTION

// SHIFT FIRST ARRAY ITEM FORWARD 1 STEP

function shiftArray (arr , index) {

    if (captureIndex < (nbOfWindows - 1) ) {

        tint(255); // workaround found on https://discourse.processing.org/t/about-taking-a-photo-with-the-webcam/3816

        arr.splice(index + 1, 0, arr.splice(index, 1)[0]); // REMOVE 1 ELEMENT AND USE IT TO SPLICE IT BACK IN BUT ONE RANK FURTHER UP

        arr[index].copy(capture, 0, 0, captureWidth, captureHeight, 0, 0, captureWidth, captureHeight); //COPY WEBCAM FREEZE FRAME TO THE OLD SCREEN

        captureIndex++;

    } else {

        console.log("limit reached");
        contrastIndex++;

        saveCanvas(canvas, typeOfContrast[ contrastIndex % typeOfContrast.length ], "png"); // DOWNLOAD IMAGE TAKEN

        captureIndex = 0;  // RESET IMAGES TAKEN COUNTER
        arr.splice(0, nbOfWindows); // DELETE ALL IMAGES FRAMES
        createFramesArray(arr);  // RESET ALL IMAGE FRAMES
        

    }

}

// MAKE INTERFACE BETTER
// MAKE CODE CLEANER
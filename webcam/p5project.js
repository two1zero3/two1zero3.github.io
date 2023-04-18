//MAKE WINDOWS MOVABLE WITH YOUR MOUSE --> MAYBE EVEN RESIZABLE?
//MAKE A IMAGE FRAME CLASS FOR EACH ONE


let capture;
let captureWidth = 1600 / 2;
let captureHeight = 1200 / 2;
let nbOfWindows = 3;
let imageFrames = [];
let captureIndex = 0;
let colorPicker;
let button;
let buttonWidth = 100;
let buttonHeight = 100;


// MAKE ARRAY WITH 1 CAPTURE and 3 BLACK IMAGES
function createFramesArray(arr) {

    for (let i = 0; i < nbOfWindows; i++) {

        if (i == 0) {

            arr.push(new imageFrame(width/2, height/2, capture));

        } else {

            let tempFileName = new imageFrame(width/2 + random(-width/2, width/2), height/2 + random(-height/4, height/4), createImage(captureWidth, captureHeight));
            tempFileName.image.loadPixels();

            for (let i = 0; i < tempFileName.image.width; i++) {
                for (let j = 0; j < tempFileName.image.height; j++) {
                    tempFileName.image.set(i, j, color(0, 0, 0));
                }
            }

            tempFileName.image.updatePixels();

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
    capture.hide();

    // MAKE ARRAY WITH 1 CAPTURE and 8 BLACK IMAGES

    createFramesArray(imageFrames);

    //ALIGNMENT SETTINGS

    imageMode(CENTER);
    textAlign(CENTER);

    //SPAWN IN BUTTON

    button = createButton("");
    button.size(buttonWidth, buttonHeight);
    // button.position(width / 2 - buttonWidth / 2, height / 2 + captureHeight / 2 - 100);
    button.mousePressed(buttonGotClicked);
    button.parent("interface-container");

    // SPAWN IN COLOR PICKER

    colorPicker = createColorPicker('#ed225d');
    // colorPicker.size(captureWidth, 40);
    // colorPicker.position(width / 2 - colorPicker.size().width/2, height / 2 - colorPicker.size().height/2);
    colorPicker.style("background-color: white;");
    colorPicker.parent("interface-container");

    //TEXT OPTIONS

    //textSize(35);
    //textFont(isonorm3098);

}

//MAIN DRAW FUNCTION

function draw() {

    background(colorPicker.color()); //COLOR EMITTED FOR IMAGE

    //text(typeOfContrast[ contrastIndex % typeOfContrast.length ], width/2, height/2 - captureHeight/2 - 20); //CREATE TEXT

    for (let i = 0; i < imageFrames.length; i++) {

        image(imageFrames[i].image, imageFrames[i].x, imageFrames[i].y, captureWidth / 4, captureHeight / 4);
        imageFrames[i]._mousePressed();

    }

}

//ADAPT SCREEN SIZE

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    button.position(width / 2 - buttonWidth / 2, height / 2 + captureHeight / 2 + 50);
    colorPicker.position(width / 2 - captureWidth / 2, height / 2 + captureHeight / 2);
}

// BUTTON CHANGE 

buttonGotClicked = () => setTimeout(() => { shiftArray(imageFrames, captureIndex); }, 3000); // "TAKE IMAGE" FUNCTION

// SHIFT FIRST ARRAY ITEM FORWARD 1 STEP

function shiftArray(arr, index) {

    if (captureIndex < (nbOfWindows - 1)) {

        console.log(arr);

        tint(255); // workaround found on https://discourse.processing.org/t/about-taking-a-photo-with-the-webcam/3816

        // REMOVE 1 ELEMENT AND USE IT TO SPLICE IT BACK IN BUT ONE RANK FURTHER UP
        arr.splice(index + 1, 0, arr.splice(index, 1)[0]); 

        //COPY WEBCAM FRAME TO IMAGE FRAME
        arr[index].image.copy(capture, 0, 0, captureWidth, captureHeight, 0, 0, captureWidth, captureHeight); 

        captureIndex++;

        console.log(arr);

    } else {

        console.log("limit reached");

        saveCanvas(canvas, "canvas", "png"); // DOWNLOAD IMAGE TAKEN

        captureIndex = 0;  // RESET IMAGES TAKEN COUNTER
        arr.splice(0, nbOfWindows); // DELETE ALL IMAGES FRAMES
        createFramesArray(arr);  // RESET ALL IMAGE FRAMES


    }

}

function mousePressed() {

    for (let i = 0; i < imageFrames.length; i++) {
        //find the first imageFrame with less than 50 dist to mouse and make it dragging true to drag
        //then break to not drag any others
        if (imageFrames[i].distToMouse() < 100) {
            imageFrames[i].dragging = true;
            break;
        }

    }

}

function mouseReleased() {

    for (let i = 0; i < imageFrames.length; i++) {

        imageFrames[i].dragging = false;

    }

}

Array.prototype.max = function () {
    return Math.max.apply(null, this);
};

Array.prototype.min = function () {
    return Math.min.apply(null, this);
};
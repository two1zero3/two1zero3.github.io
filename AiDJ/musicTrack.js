class MusicTrack {

    constructor(trackNumber) {

        this.pg = createGraphics(min(windowWidth/2, 200), min(windowHeight/2, 400)); //makes a PGraphics buffer 3 times the height of the canvas --> 1200 px

        this.offsetX = trackNumber*this.pg.width;
        this.offsetY = 0;

        this.drag = 0;

        this.upload = createFileInput(this.dropHandler.bind(this));
        this.upload.position(trackNumber*this.pg.width,windowHeight-50);
        this.upload.id("fileInput" + trackNumber);
        this.upload.hide();

        this.label = createElement("label", "UPLOAD");
        this.label.size(this.pg.width, 100);
        this.label.style("border", "1px solid black");
        this.label.style("font-family", "sans-serif");
        this.label.style("background", "red");
        this.label.attribute("for", "fileInput" + trackNumber);
        this.label.position(trackNumber*this.pg.width,windowHeight-50);

        this.createPlayPauseButton(trackNumber);
        this.createReverbButton(trackNumber);

        this.trackNumber = trackNumber;

    }

    sync() { //draw loop

        if (this.sound) {
            //draw the PGraphics buffer
            this.pg.push();
            image(this.pg, this.offsetX, this.offsetY + this.drag);

            //metronome and dragging
            this.metronome();
            this.dragWaveform();

            //draw waveform tick lines and make index/time updated
            if(this.peaks && this.ticks) {
                textAlign(CENTER, CENTER);
                text(this.bpm, 50 + this.trackNumber*this.pg.width, 450);
                this.index = round(this.sound.currentTime()*100);
                this.drawAudioWaveform(this.index, this.bass, this.snare);
                this.drawTickLines();
            }
            this.pg.pop();
            
        }
        this.button.draw();
        this.button2.draw();

    }

    metronome() {
        if (this.ticks && this.sound.currentTime() > this.ticks[this.tickCount]) {
            console.log("TICK " + this.tickCount);
            this.tickCount++;
        }
    }

    dragWaveform() {

        let c1 = mouseX < this.pg.width*(this.trackNumber+1);
        let c2 = mouseX > this.pg.width*this.trackNumber;
        let c3 = mouseY < this.pg.height;
        let c4 = mouseY > 0;
        
        if (mouseIsPressed && c1 && c2 && c3 && c4 ) {
            this.drag += mouseY - pmouseY;
        }

        if (!mouseIsPressed && mouseWasPressed && this.drag != 0) {

            let jumpTime = this.sound.currentTime() + this.drag/100;

            jumpTime = min(jumpTime, this.sound.duration() - 0.01);
            jumpTime = max(jumpTime, 0.01);

            this.sound.jump(jumpTime);

            this.drag = 0;
        }

    }

    createPlayPauseButton (trackNumber) {

        this.button = new Clickable(trackNumber*this.pg.width,this.pg.height);
        this.button.text = "⏯︎";
        this.button.textScaled = true;
        this.button.cornerRadius = 0;
        this.button.resize(100, 100);
        this.button.onHover = function () {this.color = "lightgray"};
        this.button.onOutside = function () {this.color = "white"};
        this.button.onPress = this.playPause.bind(this);

    }

    createReverbButton(trackNumber) {

        this.reverb = new p5.Reverb();
        this.reverb.drywet(0);

        this.button2 = new Clickable(trackNumber*this.pg.width+this.pg.width/2,this.pg.height);
        this.button2.text = "reverb";
        this.button2.textScaled = true;
        this.button2.cornerRadius = 0;
        this.button2.resize(100, 100);
        this.button2.onHover = function () {this.color = "lightgray"};
        this.button2.onOutside = function () {this.color = "white"};
        this.button2.onPress = this.reverbToggle.bind(this);

    }

    reverbToggle () {

        if (this.sound) {

            console.log(this.reverb.drywet());

            if (this.reverb.drywet() == 0) {
                this.reverb.drywet(0.5);
                this.button2.textColor = "green";
                console.log("case 1");
            } else if (this.reverb.drywet() != 0) {
                this.reverb.drywet(0);
                this.button2.textColor = "red";
                console.log("case 2");
            }

        }

    }

    playPause () {

        if(this.sound) {

            if (this.sound.rate() != 0) {
    
                this.sound.rate(0);
                this.sound.setVolume(0);
                this.button.textColor = "red";
    
            } else if (this.sound.rate() == 0) {

                this.sound.rate(1);
                this.sound.setVolume(1);
                this.button.textColor = "green";
    
            }

            if(!this.sound.isPlaying()) {
                this.sound.play(0,0,0);
            }
    
        }
    }

    dropHandler (event) {

        console.log(this.trackNumber, "TRACKNUMBER");

        //clears all previous data to reset for new file
        if (this.sound && this.sound.isPlaying()) {
            this.sound.stop();
        }
        this.pg.clear();
    
        //handles the file given by pre-processing it aswell as passing the audio to essentia.js
        audioCtx.resume();
        console.log('File(s) dropped');
        console.log(event.file);
        loadSound(event.file,e => {

            this.sound = e;
            this.index = 0;
            this.ticks = undefined;
            this.plotPoints = (e.buffer.length/e.buffer.sampleRate) * 100; //--> 441 samples per pixel or 10ms per pixel
            this.tickCount = 0;
            this.essentiaAnalyseTrack(e);
            this.sound.play(0, 0, 0);
            this.sound.disconnect();
            this.reverb.process(this.sound, 3, 2);
    
        });
    
    }

    //main audio analysis work
    essentiaAnalyseTrack (e) {

        //create web worker for async analysis

        const essentiaWorker = new Worker("essentiaProcessing.js");
        essentiaWorker.postMessage([ e.buffer.getChannelData(0), e.buffer.getChannelData(1), e.buffer.sampleRate]);

        essentiaWorker.onmessage = (e) => { 
            console.log(e.data);
            this.ticks = e.data.ticks;
            this.bpm = e.data.bpm.toFixed(2);
            this.bass = e.data.bass;
            this.snare = e.data.snare;
            this.peaks = this.sound.getPeaks(this.plotPoints);
            this.drawAudioWaveform();
        }

    }

    //eventually combine tick & waveform into 1 function
    drawTickLines() {

        this.pg.push(); //new drawing state for making the lines colored
        this.pg.stroke(0, 255, 255);
        this.pg.translate(0, this.sound.currentTime()*100);

        let indexTick = closestIndex(this.sound.currentTime(), this.ticks);

        //draw beat detection ticks in white lines
        for (let i = indexTick-5; i < indexTick+5; i++) {

            let x1 = 0;
            let y1 = this.pg.height/2 - this.ticks[i]*100;  //WHY -10 ?
            let x2 = this.pg.width;
            let y2 = this.pg.height/2 - this.ticks[i]*100   //WHY -10 ?

            this.pg.line(x1,y1,x2,y2);

        }

        this.pg.pop();

    }

    drawAudioWaveform(index, bass, snare) {

        //draw the audio waveform on the pg buffer and then translate

        let HALF_PG_HEIGHT = ceil(this.pg.height/2);
        
        this.pg.push();
        this.pg.translate(0, this.sound.currentTime()*100);
        this.pg.background(127);

        //this.pg.blendMode(EXCLUSION);

        this.pg.colorMode(HSB, 360, 1, 1, 1);
        this.pg.strokeWeight(1);

        //MAIN DRAWING LOOP
        for (let i = max(index-HALF_PG_HEIGHT, 0); i < index+HALF_PG_HEIGHT; i++) {

            //optimise this maybe?
            this.pg.stroke(250, snare[i]*20, 1);

            if (bass[i] > 0.3) {
                this.pg.stroke(0, bass[i], 1);
            }

            let x1 = map(this.peaks[i], -1, 1, 0, this.pg.width);
            let y1 = this.pg.height/2 - i;
            let x2 = map(this.peaks[i], -1, 1, this.pg.width, 0);
            let y2 = this.pg.height/2 - i;

            //DRAW LINES
            this.pg.line(x1,y1,x2,y2);
        }
        
        this.pg.pop();
    
    }

}
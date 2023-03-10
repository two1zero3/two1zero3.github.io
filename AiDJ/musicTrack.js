class MusicTrack {

    constructor(trackNumber) {

        this.pg = createGraphics(width/2, height); //make buffer

        this.offsetX = trackNumber*this.pg.width;
        this.offsetY = 0;

        this.drag = 0;

        this.createPlayPauseButton(trackNumber);
        this.createReverbButton(trackNumber);
        this.createLoopButton(trackNumber);
        this.createLoopLengthButton(trackNumber);
        this.createTempoButtons(trackNumber);
        this.createSearchBox(trackNumber);
        this.createVolumeSlider();

        this.trackNumber = trackNumber;

        select(`#load-${this.cssSide}`).mousePressed(() => soundScraper.loadTrackUp(this));

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

                this.index = round(this.sound.currentTime()*100);
                this.closestTick = closestIndex(this.sound.currentTime(), this.ticks);

                this.drawAudioWaveform(this.index, this.bass, this.snare);
                this.drawTickLines();

                this.sound.setVolume(this.volumeSlider.value());

                select(`.bpm-${this.cssSide}`).html(this.bpm.toFixed(1));
                
            }

            this.pg.pop();
            
        }

    }

    metronome() {
        if (this.ticks && this.sound.currentTime() > this.ticks[this.tickCount]) {
            // console.log("TICK " + this.tickCount);
            this.ledBlink();
            this.tickCount++;
        }
    }

    ledBlink() {
        let led = select(`.bpm-indicator-${this.cssSide}`);

        if(led.style("visibility") == "hidden") {
            led.style("visibility", "visible");
        } else {
            led.style("visibility", "hidden");
        }
    }

    dragWaveform() {

        let c1 = mouseX < this.offsetX+this.pg.width;
        let c2 = mouseX > this.offsetX;
        let c3 = mouseY < this.pg.height;
        let c4 = mouseY > this.offsetY;
        
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

        if (trackNumber == 0) {
            this.cssSide = "left";
        } else {
            this.cssSide = "right";
        }

        this.button = select(`.play-${this.cssSide}`);
        this.button.mousePressed(this.playPause.bind(this));

    }

    createReverbButton(trackNumber) {

        this.reverb = new p5.Reverb();
        this.reverb.drywet(0);

        this.reverbButton = select(`.sync-${this.cssSide}`);

        //when mouse pressed invoke reverbtoggle with this bind and pass in the text element as arguement for it to be able to change its color (on/off)
        this.reverbButton.mousePressed(this.reverbToggle.bind(this, select(`.sync-text-${this.cssSide}`))); 
    }

    createLoopButton (trackNumber) {

        this.loopButton = select(`.loop-${this.cssSide}`);
        this.loopButton.mousePressed(this.loopToggle.bind(this));

    }

    createLoopLengthButton (trackNumber) {

        this.loopLengthButton = select(`.looplength-${this.cssSide}`);
        this.loopLengthButton.mousePressed(this.loopLengthToggle.bind(this));

    }

    createTempoButtons(trackNumber) {

        this.tempoMoreButton = select(`.bpm-more-${this.cssSide}`);
        this.tempoMoreButton.mousePressed(this.rateSlider.bind(this, 0.1));
        this.tempoLessButton = select(`.bpm-less-${this.cssSide}`);
        this.tempoLessButton.mousePressed(this.rateSlider.bind(this, -0.1));
        
        // this.slider.changed(this.rateSlider.bind(this));

    }

    createSearchBox (trackNumber) {

        //dont need this to be in musictrack.js can be put in soundcloudDownloader.js
        this.searchBox = select("#addsong-searchbar");
        this.searchBox.attribute("onKeyDown", `soundScraper.searchBoxEnter(event)`);

    }

    createVolumeSlider () {
        this.volumeSlider = select(`.vol-${this.cssSide} > input`);
    }

    rateSlider(value) { //change logic for it to change 0.1 bpm at a time with 2 buttons

        console.log("RATESLIDER");
        if(this.bpm) {
            
            this.bpm = this.bpm + value;
            console.log(this.bpm);
            let rate = this.bpm/this.initialBpm; //calc real

            if (this.sound.rate() != 0) {
                this.sound.rate(rate);
            }

        }
        
    }

    loopLengthToggle() {

        let loopLengths = [2,4,8,16];
        let index = closestIndex(parseInt(this.loopLengthButton.html()), loopLengths);

        if(!this.isLooping) {

            index++;
            index = index % loopLengths.length;

        }

        this.loopLengthButton.html(loopLengths[index]);
        this.loopLength = loopLengths[index];

    }

    loopToggle() {

        if(this.ticks) {
            if(this.isLooping) {
                this.sound.removeCue(this.cuePoint);
            }
            if(!this.isLooping) {

                console.log("IS NOT LOOPING");
                this.loopStartTime = this.sound.currentTime();
                this.closestTickForLoop = closestIndex(this.loopStartTime, this.ticks);

                let loopStartTimeQuantized = this.ticks[this.closestTickForLoop];
                let timeForCuePoint = this.ticks[this.closestTickForLoop+this.loopLength];

                this.cuePoint = this.sound.addCue(timeForCuePoint,() => {this.sound.jump(loopStartTimeQuantized)});
            }

            this.isLooping = !this.isLooping;


        }
    }

    reverbToggle (button) {

        if (this.sound) {

            console.log(this.reverb.drywet());

            if (this.reverb.drywet() == 0) {
                this.reverb.drywet(0.5);
                button.style("color", "green");
            } else if (this.reverb.drywet() != 0) {
                this.reverb.drywet(0);
                button.style("color", "red");
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

                this.sound.rate(this.bpm / this.initialBpm);
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
            this.loopLength = parseInt(this.loopLengthButton.html()); //FIX / UNDERSTAND
            console.log(this.loopLength);
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
            // console.log(e.data);
            // this.ticks = e.data.ticks;
            // this.bpm = e.data.bpm;
            // this.initialBpm = e.data.bpm;
            // this.bass = e.data.bass;
            // this.snare = e.data.snare;
            // this.peaks = this.sound.getPeaks(this.plotPoints);
            // this.isLooping = false;
            // this.drawAudioWaveform();

            this.ticks = [];
            this.spotify.beats.forEach(element => {
                this.ticks.push(element.start);
            });
            
            this.bpm = this.spotify.track.tempo;
            this.initialBpm = this.spotify.track.tempo;
            this.bass = e.data.bass;
            this.snare = e.data.snare;
            this.peaks = this.sound.getPeaks(this.plotPoints);
            this.isLooping = false;
            this.drawAudioWaveform();

        }

    }

    //eventually combine tick & waveform into 1 function --> no?
    drawTickLines() {

        this.pg.push(); //new drawing state for making the lines colored
        this.pg.stroke(0, 255, 255);
        this.pg.translate(0, this.sound.currentTime()*100);

        //draw beat detection ticks in white lines
        for (let i = this.closestTick-6; i < this.closestTick+6; i++) {

            let x1 = 0;
            let y1 = this.pg.height/2 - this.ticks[i]*100;  
            let x2 = this.pg.width;
            let y2 = this.pg.height/2 - this.ticks[i]*100;

            this.pg.line(x1,y1,x2,y2);

        }

        if (this.isLooping)
            this.drawLoop();

        this.pg.pop();

    }

    drawLoop() {

        let x1_l = 0;
        let y1_l = this.pg.height/2 - this.ticks[this.closestTickForLoop]*100; 
        let x2_l = this.pg.width;
        let y2_l = this.pg.height/2 - this.ticks[this.closestTickForLoop+this.loopLength]*100; 
        this.pg.fill(255,0,0,50);
        this.pg.rect(x1_l, y2_l, this.pg.width, y1_l - y2_l);

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
            this.pg.stroke(250, snare[floor(i/2)]*20, 1);

            if (bass[i] > 0.3) {
                this.pg.stroke(0, bass[floor(i/2)], 1);
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
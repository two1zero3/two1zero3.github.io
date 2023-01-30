class MusicTrack {

    constructor(trackNumber) {

        this.pg = createGraphics(windowWidth/4, height); //makes a PGraphics buffer 3 times the height of the canvas --> 1200 px
        //this.pg.blendMode(MULTIPLY);
        this.offsetX = trackNumber*this.pg.width;
        this.offsetY = 0;
    }

    sync() {

        //If sounds exists then sync it with 1 line = 10ms so currentTime*100 as the position 
        //minus height to make it be visible and then + height/2 to center it
        if (this.sound) {

            push();

            image(this.pg, this.offsetX, this.offsetY + drag);

            pop();

            //metronome
            this.metronome();

            this.pg.push()
            //this.pg.translate(-this.pg.width/2, -this.pg.height/2); //webgl

            if(this.peaks && this.ticks) {
                this.index = round(this.sound.currentTime()*100);
                this.drawAudioWaveform(this.index, this.bass, this.snare);
                this.drawTickLines();
            }

            this.pg.pop();
        }

    }

    metronome() {
        if (this.ticks && this.sound.currentTime() > this.ticks[this.tickCount]) {
            console.log("TICK " + this.tickCount);
            this.tickCount++;
        }
    }

    dropHandler (event) {

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
        
        this.pg.push();

        this.pg.translate(0, this.sound.currentTime()*100);
        this.pg.background(128);

        this.pg.colorMode(HSB, 360, 1, 1, 1);
        this.pg.strokeWeight(5);

        //MAIN DRAWING LOOP
        for (let i = index-200; i < index+200; i++) {

            this.pg.stroke(250, 1, snare[i]*20);

            if (bass[i] > 0.3) {
                this.pg.stroke(0, 1, bass[i]);
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
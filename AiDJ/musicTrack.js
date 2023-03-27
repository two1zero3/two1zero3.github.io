class MusicTrack {

    constructor(trackNumber) {

        this.pg = createGraphics(width / 2, height); //make buffer

        this.offsetX = trackNumber * this.pg.width;
        this.offsetY = 0;

        this.drag = 0;

        this.cssSide(trackNumber);
        this.buttons = new createDeckButtons(this.cssSide, this);

        this.trackNumber = trackNumber;
        this.angle;

        this.pg.noFill();

        select(`#load-${this.cssSide}`).mousePressed(() => soundScraper.loadTrackUp(this));

    }

    sync() { //draw loop

        //make EQ slider reset to the middle easily
        this.buttons.stickySlider();

        if (this.sound) {

            //draw the PGraphics buffer
            this.pg.push();
            image(this.pg, this.offsetX, this.offsetY + this.drag);

            //metronome dragging the waveform to jump and the spinning load indicator, also update volume
            this.metronome();
            this.dragWaveform();
            this.loadIndicator(10, 20);

            //draw waveform tick lines and make index/time updated
            if (this.peaks && this.ticks) {

                this.index = round(this.sound.currentTime() * 100);
                this.closestTick = closestIndex(this.sound.currentTime(), this.ticks);

                this.drawAudioWaveform(this.index, this.bass, this.snare);
                this.drawTickLines();
                this.updateBarPercent();
                this.buttons.update(this);

            }

            this.pg.pop();

        }

    }

    updateBarPercent() {

        //update BPM label in the HTML
        select(`.bpm-${this.cssSide}`).html(this.bpm.toFixed(1));

        //get bar % completion for sync
        this.barBefore = indexOfNearestLessThan(this.ticks, this.sound.currentTime());
        this.barAfter = this.barBefore + 1;

        if (this.barBefore != -1) {
            this.barPercent = map(this.sound.currentTime(), this.ticks[this.barBefore], this.ticks[this.barAfter], 0, 100);
            this.barLength = (this.ticks[this.barAfter] - this.ticks[this.barBefore]);
            // circle(width / 2, height / 2, this.barPercent / 5); //indicator of bar length (not useful now its up on the bar)
        }

        select(`.bpm-indicator-${this.cssSide} > .bpm-percent`).style("width", this.barPercent + "%");
        select(`.bpm-indicator-${this.cssSide} > .bpm-percent`).style("height", this.barPercent + "%");

    }

    metronome() {
        if (this.ticks && this.sound.currentTime() > this.ticks[this.tickCount]) {
            // console.log("TICK " + this.tickCount);
            // this.ledBlink();
            this.tickCount++;
        }
    }

    ledBlink() {
        let led = select(`.bpm-indicator-${this.cssSide}`);

        if (led.style("visibility") == "hidden") {
            led.style("visibility", "visible");
        } else {
            led.style("visibility", "hidden");
        }
    }

    dragWaveform() {

        let c1 = mouseX < this.offsetX + this.pg.width;
        let c2 = mouseX > this.offsetX;
        let c3 = mouseY < this.pg.height;
        let c4 = mouseY > this.offsetY;

        if (mouseIsPressed && c1 && c2 && c3 && c4) {
            this.drag += mouseY - pmouseY;
        }

        if (!mouseIsPressed && mouseWasPressed && this.drag != 0) {

            let jumpTime = this.sound.currentTime() + this.drag / 100;

            jumpTime = min(jumpTime, this.sound.duration() - 0.01);
            jumpTime = max(jumpTime, 0.01);

            this.sound.jump(jumpTime);

            this.drag = 0;
        }

    }

    cssSide (trackNumber) {
        if (trackNumber == 0) {
            this.cssSide = "left";
        } else {
            this.cssSide = "right";
        }
    }

    dropHandler(event) {

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
        loadSound(event.file, e => {

            this.sound = e;
            this.index = 0;
            this.ticks = undefined;
            this.plotPoints = (e.buffer.length / e.buffer.sampleRate) * 100; //--> 441 samples per pixel or 10ms per pixel
            this.tickCount = 0;
            this.loopLength = parseInt(this.buttons.loopLengthButton.html());
            this.essentiaAnalyseTrack(e);
            this.sound.play(0, 0, 0);

            if (this == musicTrackL) {
                this.syncOn = true;
                musicTrackR.syncOn = false;
            } else if (this == musicTrackR) {
                this.syncOn = true;
                musicTrackL.syncOn = false;
            }
            

            //connecting the audio effects
            this.sound.disconnect();
            this.sound.connect(this.HPfilter);
            this.HPfilter.chain(this.LPfilter, this.reverb, this.delay);
        });

    }

    //main audio analysis work
    essentiaAnalyseTrack(e) {

        //create web worker for async analysis

        const essentiaWorker = new Worker("essentiaProcessing.js");
        essentiaWorker.postMessage([e.buffer.getChannelData(0), e.buffer.getChannelData(1), e.buffer.sampleRate]);

        essentiaWorker.onmessage = (e) => {

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
        this.pg.stroke(0);
        this.pg.translate(0, this.index);

        //draw beat detection ticks in white lines
        for (let i = this.closestTick - 6; i < this.closestTick + 6; i++) {

            let x1 = 0;
            let y1 = this.pg.height / 2 - this.ticks[i] * 100;
            let x2 = this.pg.width;
            let y2 = this.pg.height / 2 - this.ticks[i] * 100;

            this.pg.line(x1, y1, x2, y2);

        }

        if (this.isLooping)
            this.drawLoop();

        this.pg.pop();

    }

    drawLoop() {

        //what is used to draw the loop indicator
        let x1_l = 0;
        let y1_l = this.pg.height / 2 - this.ticks[this.closestTickForLoop] * 100;
        let x2_l = this.pg.width;
        let y2_l = this.pg.height / 2 - this.ticks[this.closestTickForLoop + this.loopLength] * 100;
        this.pg.fill(255, 0, 0, 50);
        this.pg.rect(x1_l, y2_l, this.pg.width, y1_l - y2_l);

    }

    drawAudioWaveform(index, bass, snare) {

        //draw the audio waveform on the pg buffer and then translate

        let HALF_PG_HEIGHT = ceil(this.pg.height / 2);

        this.pg.push();
        this.pg.translate(0, index);
        this.pg.clear();
        // this.pg.blendMode(EXCLUSION);
        this.pg.strokeCap(ROUND);
        this.pg.strokeWeight(0.5);

        this.pg.colorMode(HSB, 360, 1, 1, 1);

        //MAIN DRAWING LOOP
        for (let i = max(index - HALF_PG_HEIGHT, 0); i < index + HALF_PG_HEIGHT; i++) {

            this.pg.stroke(lerpColor(this.pg.color(199, 1, 1), this.pg.color(55, 1, 1), snare[~~(i / 2)] * 20));

            if (bass[~~(i / 2)] > 0.25) {
                this.pg.stroke(22, 1, bass[~~(i / 2)]); //ORANGE
            }

            let x1 = map(this.peaks[i], -1, 1, 0, this.pg.width);
            let y1 = this.pg.height / 2 - i;
            let x2 = map(this.peaks[i], -1, 1, this.pg.width, 0);
            let y2 = this.pg.height / 2 - i;

            //DRAW LINES
            this.pg.line(x1, y1, x2, y2);

        }
        this.pg.pop();

    }

    loadIndicator(numSquares, radius) {

        if (!this.snare) {
            push();
            strokeWeight(0);
            stroke(0);
            translate(this.trackNumber * this.pg.width + this.pg.width / 2, this.pg.height / 2);
            for (let i = 0; i < numSquares; i++) {
                let angle = i * (TWO_PI / numSquares);
                let x = radius * cos(angle);
                let y = radius * sin(angle);
                let col = (angle * 40) + frameCount * 2;
                col %= 255;
                fill(col);
                circle(x, y, radius / 2);
            }
            pop();

        }
    }

}
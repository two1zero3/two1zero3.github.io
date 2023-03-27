class createDeckButtons {

    constructor(cssSide, deck) {

        this.createPlayButton(cssSide, deck);
        this.createLoopButton(cssSide, deck);
        this.createLoopLengthButton(cssSide, deck);
        this.createReverbButton(cssSide, deck);
        this.createDelayButton(cssSide, deck);
        this.createSyncButton(cssSide, deck);
        this.createVolumeSlider(cssSide, deck);
        this.createEQSlider(cssSide,deck);

    }

    createPlayButton(cssSide, deck) {
        this.playPauseButton = select(`.play-${cssSide}`);
        this.playPauseButton.mousePressed(this.playPause.bind(deck, this.playPauseButton));
    }

    createLoopButton(cssSide, deck) {
        this.loopButton = select(`.loop-${cssSide}`);
        this.loopButton.mousePressed(this.loopToggle.bind(deck, this.loopButton));
    }
    createLoopLengthButton(cssSide, deck) {
        this.loopLengthButton = select(`.looplength-${cssSide}`);
        this.loopLengthButton.mousePressed(this.loopLengthToggle.bind(deck));
    }
    createReverbButton(cssSide, deck) {
        deck.reverb = new p5.Reverb();
        deck.reverb.drywet(0);
        deck.reverb.set(3, 2);

        this.reverbButton = select(`.reverb-${cssSide}`);
        //when mouse pressed invoke reverbtoggle with "deck" bind and pass in the text element as arguement for it to be able to change its color (on/off)
        this.reverbButton.mousePressed(this.reverbToggle.bind(deck, this.reverbButton));
    }
    createDelayButton(cssSide, deck) {
        deck.delay = new p5.Delay();
        deck.delay.drywet(0);
        deck.delay.delayTime(0.12);
        deck.delay.feedback(0.75);
        deck.delay.filter(2300);

        this.delayButton = select(`.delay-${cssSide}`);
        this.delayButton.mousePressed(this.delayToggle.bind(deck, this.delayButton));
    }
    createSyncButton(cssSide, deck) {
        this.syncButton = select(`.sync-${cssSide}`);
        this.syncButton.mousePressed(this.syncToggle.bind(deck, this.syncButton));
    }
    createVolumeSlider(cssSide, deck) {
        this.volumeSlider = select(`.vol-${cssSide}`);
    }
    createEQSlider(cssSide, deck) {
        this.eqSlider = select(`.eq-${cssSide}`);
        //instanciate the two filters
        deck.HPfilter = new p5.HighPass();
        deck.LPfilter = new p5.LowPass();

        //disconnect them
        deck.HPfilter.disconnect();
        deck.LPfilter.disconnect();
        //make sure its fully applied
        deck.HPfilter.drywet(1);
        deck.LPfilter.drywet(1);
    }

    update(deck) {

        this.syncToggle.bind(deck, this.syncButton)();

        if (deck.sound.rate() > 0) {

            //update volume every frame
            deck.sound.setVolume(this.volumeSlider.value(), 0.05, 0);

            //update EQ/Filter every frame
            let freqHP = map(this.eqSlider.value(), 0, 0.5, 2500, 20, true); //for HPFilter
            let freqLP = map(this.eqSlider.value(), 0.5, 1, 22000, 300, true); //for LPFilter

            //set the filters at the calculates frequency cutoff
            deck.HPfilter.freq(freqHP); 
            deck.LPfilter.freq(freqLP);
        }
    }

    stickySlider() {
        //make EQ slider reset to the middle easily
        if(0.4 < this.eqSlider.value() && this.eqSlider.value() < 0.6) {
            this.eqSlider.value(0.5);
        }
    }

    buttonStyleOn (button) {
        //get value of svg color
        let fillColor;
        let strokeColor;

        if (button.elt.getElementsByTagName("svg")[0]) {
            fillColor = button.elt.getElementsByTagName('svg')[0].lastElementChild.getAttribute("fill");
            strokeColor = button.elt.getElementsByTagName('svg')[0].lastElementChild.getAttribute("stroke");
        } else {
            fillColor = "red";
        }
        
        //set it as background --> use fill / stroke depending on shape
        if(fillColor) {
            
            button.style("background-color", fillColor);
        } else if (strokeColor) {
            button.style("background-color", strokeColor);
        }
    }
    buttonStyleOff (button) {
        button.style("background-color", "#F5F5F5");
    }

    playPause(button) {
        if (this.sound) {

            if (this.sound.rate() != 0) {

                this.sound.rate(0);
                this.sound.setVolume(0);
                this.buttons.buttonStyleOff(button); // turn to off color for button

            } else if (this.sound.rate() == 0) {

                this.buttons.buttonStyleOn(button); //turn to on color for button

                this.sound.rate(this.bpm / this.initialBpm);
                this.sound.setVolume(1);

            }

            if (!this.sound.isPlaying()) {
                this.sound.play(0, 0, 0);
            }

        }
    }

    loopToggle(button) {

        if (this.ticks) {
            if (this.isLooping) {
                this.sound.removeCue(this.cuePoint);
                this.buttons.buttonStyleOff(button); // turn to off color for button
            }
            if (!this.isLooping) {

                this.buttons.buttonStyleOn(button); //turn to on color for button

                console.log("IS NOT LOOPING");
                this.loopStartTime = this.sound.currentTime();
                this.closestTickForLoop = closestIndex(this.loopStartTime, this.ticks);

                let loopStartTimeQuantized = this.ticks[this.closestTickForLoop];
                let timeForCuePoint = this.ticks[this.closestTickForLoop + this.loopLength];

                this.cuePoint = this.sound.addCue(timeForCuePoint, () => { this.sound.jump(loopStartTimeQuantized) });
            }

            this.isLooping = !this.isLooping;


        }
    }

    loopLengthToggle() {

        let loopLengths = [2, 4, 8, 16];
        let index = closestIndex(parseInt(this.buttons.loopLengthButton.html()), loopLengths);

        if (!this.isLooping) {

            index++;
            index = index % loopLengths.length;

        }

        this.buttons.loopLengthButton.html(loopLengths[index]);
        this.loopLength = loopLengths[index];

    }

    reverbToggle(button) {

        if (this.sound) {

            console.log(this.reverb.drywet());

            if (this.reverb.drywet() == 0) {
                this.reverb.drywet(0.5);
                this.buttons.buttonStyleOn(button); //turn to on color for button
            } else if (this.reverb.drywet() != 0) {
                this.reverb.drywet(0);
                this.buttons.buttonStyleOff(button); // turn to off color for button
            }

        }

    }

    delayToggle(button) {

        if (this.sound) {

            console.log(this.delay.drywet());

            if (this.delay.drywet() == 0) {
                this.delay.drywet(0.5);
                this.buttons.buttonStyleOn(button); //turn to on color for button
            } else if (this.delay.drywet() != 0) {
                this.delay.drywet(0);
                this.buttons.buttonStyleOff(button); // turn to off color for button
            }

        }

    }

    syncToggle(button) {

        //if sound is loaded and ready/playing
        if (this.sound && this.ticks && this.bpm) {
            
            if (this.syncOn) {

                this.buttons.buttonStyleOn(button); //turn to on color for button

            } else if (!this.syncOn) {

                this.buttons.buttonStyleOff(button); // turn to off color for button

            }
        }
    }
}
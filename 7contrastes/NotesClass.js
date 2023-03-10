class P5Notes {

    constructor(note) {

        this.note = note;
        this.osc = new p5.Oscillator('sine');
        this.freq = Math.pow(2, (note.number-69)/12) * 440; //cool function to determine midi note number to frequency 
        this.osc.disconnect();
        this.osc.connect(reverb);

        //for noise function
        this.xoff = 0.0;
        this.yoff = random(1024);

        this.size = noteSize;
        this.pos = createVector(random(noteSize, width-noteSize), random(noteSize, height-noteSize)); // random position thats still inside the canvas
        //this.pos = createVector( width/2, height/2);
        //this.pos = createVector( map(note.number, 40, 90, 0, width), height/2);
        this.vector = p5.Vector.random2D().normalize().mult(4); //random direction vector
        this.lifespan = 200;
        
        colorMode(HSB, 360, 100, 100, 100); //make notes span the entire color hue range
        this.color = color(map(this.note.number, 36, 84, 0, 360), 100, 100, this.note.attack*100); //assign colors in randomColors array to pitch

        this.playNote(); //play initial note

        console.log(this);

    }

    update() {

        //make lifespan 1 less every frame
        this.lifespan--;

        //change color slightly every frame
        //let hueCalc = (hue(this.color)+1) % 360;
        ///this.color = color(hueCalc, 100, 100, 50);

        //perlin noise move through x axis
        this.xoff = this.xoff + 0.01;

        //rotate random
        let rotateNoise = map(noise(this.xoff, this.yoff), 0, 1, -TWO_PI, TWO_PI)*0.01;
        this.vector.rotate(rotateNoise);

        //make x and y move at the speed and direction
        this.pos.add(this.vector);

        //collision detection
        if ( this.pos.x + this.size/2 > width || this.pos.x - this.size/2 < 0) {
            this.vector.mult(-1, 1);
            this.playNote();
        }
        if ( this.pos.y + this.size/2 > height || this.pos.y - this.size/2 < 0) {
            this.vector.mult(1, -1);
            this.playNote();
        }

        //make size go down with time
        this.size = lerp(this.size, 0, 0.01);

    }

    draw () {
        push();
        translate(this.pos.x, this.pos.y);

        noStroke();
        fill(this.color);
        
        square(0, 0, this.size);

        pop();   
    }

    playNote() {

        //make sound play 0.5s at volume 0.2
        this.osc.freq(this.freq, 0.1);
        this.osc.amp(0.5, 0.1);
        this.osc.start();
        this.osc.amp(0, 0.5);
        this.osc.stop(0.5);

    }

}
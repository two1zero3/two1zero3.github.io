/*
    Authored by Thomas Castleman, 2018
*/

// Note class handles attributes that all played notes share
class Note {
  
  int channel, velocity, pitch;   // store the channel, velocity and pitch + modulation
  int lifespan;                   // lifespan of note, in frames
  boolean isReleased;             // whether or not the note has been released yet
  float x, y;                     // Position of the note
  float directionX, directionY;    //left to right or right to left / top to down or down to top
  float size;                     // Size of Square when created
  color col;                      // Color of square
  float scale;                      //scale in relation to this.size
  float distToCenter;
  SinOsc sin;

  // constructor for new Note object
  Note(int channel_, int pitch_, int velocity_, int lifespan_) {
    this.channel = channel_;
    this.pitch = pitch_;
    this.velocity = velocity_;
    this.lifespan = lifespan_;

    this.scale = 1;
    this.isReleased = false;
    this.x = width/2;
    //this.x = map(pitch, 48, 84, 0, width); //map notes from note 48 to 84 to be closer to x = 0 or x = width
    this.y = height/2;
    this.directionX = randomDirection();
    this.directionY = randomDirection();
    this.size = map(velocity, 0, 127, 10, 500); //map size of squares to velocity of the note played
    
    this.sin = new SinOsc(sketch);

    pushStyle();
    colorMode(HSB, 360, 100, 100); //make notes span the entire color hue range
    this.col = color(randomColors[pitch], map(velocity, 0, 127, 25, 100), 100); //assign colors in randomColors array to pitch
    popStyle(); // change back to normal
  }
  
  // update note properties
  void update() {

    //set x and y
    this.x = this.x + 0.0509*this.velocity*this.directionX;
    this.y = this.y + 0.0619*this.velocity*this.directionY; // make it go down in Y axis slowly
    this.scale = lerp(this.lifespan, 0, 0.1) / noteLifespan; //maybe find method to make division by initial lifespan better coded --> set lifespan as passed on variable or for the whole sketch as global variable

    this.distToCenter = this.scale * (this.size/2); //distance from center of square to any side
    //println(distToCenter);

    //bounce mechanics 
    if (this.x > width - this.distToCenter || this.x < this.distToCenter) {
      this.directionX = -this.directionX;
    }
    if (this.y > height - this.distToCenter || this.y < this.distToCenter ) {
      this.directionY = -this.directionY;
    }



    //note collision detection
    Iterator<Note> iter = nm.notes.iterator();

    while(iter.hasNext()) {

      Note n = iter.next();

      if (dist(n.x, n.y, this.x, this.y) < this.distToCenter && this.x != n.x) { //if note x and y is inside this.x this.y and the note is not ourselves

        line(n.x, n.y, this.x, this.y);
        //play note if this is the frame of collision
        this.playNote();
          //println(dist(n.x, n.y, this.x, this.y))
        
      }

    }

  }
  
  // display note on canvas
  void display() {

    pushMatrix();
    translate(this.x, this.y); //figure out why it is changing x when it shouldn't
    scale(this.scale);  //lerp scale to make transitions smoother

    stroke(255);
    fill(this.col, 127); // 50% transparency
    square(0, 0, this.size); //size square acording to velocity
    
    popMatrix();

  }

  void playNote() {

        //println(n.pitch + ", " + this.pitch);

        //calc midi pitch to frequency in hz
        float f = (float)Math.pow(2, (this.pitch-69.0)/12.0);

        //play note with envelope
        this.sin.freq(f*440);
        this.sin.play();

  }

}
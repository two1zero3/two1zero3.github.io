//Authored by Andreas Abbaszadeh, 2022
//Find creative ways to display notes --> maybe make the squares bounce around / use a grid?
// Rewrite parts of the code that are unclear --> add comments aswell
//Add note sound of note played --> make something more even ?
// WHEN 2 NOTES COLIDE PLAY THE TWO NOTES --> MAKES COLORS ASWELL


import themidibus.*; //Import the library
import java.util.*;
import processing.sound.*;

//SETTINGS
PApplet sketch;
int noteLifespan = 500;
float[] randomColors = new float[100];
String MidiName = "MIDI1";
float attackTime = 0.001;
float sustainTime = 0.004;
float sustainLevel = 0.3;
float releaseTime = 0.4;

MidiBus myBus; // The MidiBus
NoteManager nm;

void setup() {
  size(960, 960);
  background(0);

  sketch = this;

  rectMode(CENTER);
  pixelDensity(displayDensity());

  println(this);

  MidiBus.list();
  myBus = new MidiBus(this, MidiName, 1);
  nm = new NoteManager();

  for (int i = 0; i < randomColors.length; i++) {
    randomColors[i] = int(random(0, 360));
  }

}

void draw() {

  background(0);
  nm.track();

}

void controllerChange(int channel, int number, int value) {

  println("Controller Change: " + channel + ", " + number + ", " + value);

}

void noteOn(int channel, int pitch, int velocity) {
  nm.addNote(new Note(channel, pitch, velocity, noteLifespan));
  println ("Note on: " + channel + ", " + pitch + ", " + velocity);
}

void noteOff(int channel, int pitch, int velocity) {
  nm.releaseNote(new Note(channel, pitch, velocity, noteLifespan));
  println("Note off: " + channel + ", " + pitch + ", " + velocity);
}

static int randomDirection() {

  float rand = new Random().nextFloat();

  if (rand > 0.5) {
    return 1;
  } else {
    return -1;
  }

}

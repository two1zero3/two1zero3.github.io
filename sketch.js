let img;
var members = []; //Sverre + Me
const coordinates = [

  {x: 0.50, y: 0.50, color: "red", name: "Andreas"},
  {x: 0.50, y: 0.30, color: "blue", name: "Sverre"},
  // {x: 0.36, y: 0.32, color: "black", name: "Lancey"}

];

function preload() {
  img = loadImage("images/UTMmap.png");
}

function setup() {
  var canvas = createCanvas(Math.min(windowWidth, 700) - 100, (Math.min(windowWidth, 700) - 100)*0.5); //check whats smaller windowWidth or 600px and choose the smallest (-100 to make margins)
  canvas.parent('sketch-holder');
  for (let i = 0; i < coordinates.length; i++) {       // makes one point on map for each cooridnates using Person class and pushing it to the members array
    let x = coordinates[i].x;
    let y = coordinates[i].y;
    let color = coordinates[i].color;
    let obj = new Person(x, y, color);
    members.push(obj);
  }
}
  
function draw() {
  image(img, 0, 0, width, height);
  members.forEach(i => i.draw());
}

function windowResized() {
  resizeCanvas(Math.min(windowWidth, 700) - 100, (Math.min(windowWidth, 700) - 100)*0.5); //makeing sure desktop resizing works
}

class Person {

  constructor(x, y, color, name) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.name = name;
  }

  draw() {
    stroke(0);
    strokeWeight(3);
    fill(this.color);
    ellipse(this.x*width, this.y*height, 10);
  }

}

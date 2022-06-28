var mapboxClient = mapboxSdk({ accessToken: "pk.eyJ1IjoiYW5kcmVhc3R3byIsImEiOiJjbDR3dTQ3ZDIwNmd3M2Juc212OXBwaGJvIn0.BDS295yeoS1tViQ_n6COpg" });

let img;
var members = []; //Sverre + Me
const coordinates = [
  {x:0.483, y: 0.53, color: "red", name: "Andreas"},
  {x:0.483, y: 0.33, color: "blue", name: "Sverre"},
];

const request = mapboxClient.static.getStaticImage({
  ownerId: 'mapbox',
  styleId: 'satellite-v9',
  width: 600,
  height: 300,
  logo: false,
  attribution: false,
  position: {
    bbox: [  
      -24.489555,
      28.748999,
      41.340523,
      61.259999
    ],
  }
});

function preload() {
  img = loadImage(request.url());
}

function setup() {
  var canvas = createCanvas(Math.min(windowWidth, 700) - 100, (Math.min(windowWidth, 700) - 100)*0.5); //check whats smaller windowWidth or 600px and choose the smallest (-100 to make margins)
  canvas.parent('sketch-holder');
  noLoop();
  for (let i = 0; i < coordinates.length; i++) {       // makes one point on map for each cooridnates using Person class and pushing it to the members array
    let x = coordinates[i].x;
    let y = coordinates[i].y;
    let color = coordinates[i].color;
    let obj = new Person(x, y, color);
    members.push(obj);
  }
}
  
function draw() {
  clear();
  image(img, 0, 0, width, height);
  members.forEach(i => i.draw());
}

function windowResized() {
  resizeCanvas(Math.min(windowWidth, 700) - 100, (Math.min(windowWidth, 700) - 100)*0.5); //making sure desktop resizing works 600+100 for 100px margins
}

class Person {

  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.color = color;
  }

  draw() {
    stroke(0);
    strokeWeight(0);
    fill(this.color);
    rectMode(CENTER);
    square(this.x*width, this.y*height, 10);
  }

}
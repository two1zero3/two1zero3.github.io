class CursorObject {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = 50; //mabye use accelerationZ to change size?
        this.posX = width/2;
        this.posY = height/2;
    }

    update() {
        // takes rotation data and adds it to the x and y position of the circle
        this.x += rotationY * 0.1;
        this.y += rotationX * 0.1;
    
        //reset the circle to the center of the screen if the mouse is pressed
        if(!mouseIsPressed) {
            this.x = width/2;
            this.y = height/2;
        }
        
    }

    draw() {
        fill(255);
        if(!mouseIsPressed) {   
            background(50);
        }
        circle(this.x, this.y, this.size);
    }
}
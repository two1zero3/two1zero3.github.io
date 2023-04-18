class imageFrame {


    constructor(x, y, image) {
        this.x = x;
        this.y = y;
        this.image = image;
        this.offsetX;
        this.offsetY;
        this.dragging;
    }

    _mousePressed() {

        if(this.dragging) {
        
            // DRAG ITEM
            this.x = lerp(this.x, mouseX, 0.25);
            this.y = lerp(this.y, mouseY, 0.25);

            //make it conserve the offset in between mouseclick and real position
            this.offsetX = dist(this.x, 0, mouseX, 0);
            this.offsetY = dist(this.y, 0, mouseY, 0);

        }
    } 

    distToMouse() {

        let distToMouse = dist(mouseX, mouseY, this.x, this.y);

        return distToMouse;

    }

}
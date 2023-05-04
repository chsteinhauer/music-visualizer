import { state } from "../model/state";

let marN = 10; // n of marioni present
let marAll = [];
let colors = ['#FE6B85', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5', '#2196F3', '#00BCD4', '#009688', '#4CAF50', '#8BC34A'];

function setupTestaaa() {
    createCanvas(800, 400);

    for (let i = 0; i < marN; i++) {

        //x    y    r  n    a  
        let mar = new Marione(50, 100, 25, 5, -90);
        marAll.push(mar);
    }

}

function drawTestaaa() {

    background('#222')

    translate(width / 2, height / 2);
    for (let i = 0; i < marN; i++) {

        push();
        rotate(TWO_PI * i / marN);

        let x = random(-width, width) / width + 0.005;
        let y = random(-height, height) / height - 0.005;

        marAll[i].drawGradient(colors[i % 10]);
        marAll[i].drawShape();
        marAll[i].moveShape(x, y);
        pop();

    }
}

class Marione {

    constructor(cx, cy, r, n, a) {
        this.radius = r;
        this.springing = 0.0005;
        this.damping = 0.50;
        this.nodes = n;
        this.rotAngle = a;
        this.accelX = 0.0; // aX
        this.accelY = 0.0; // aY
        this.deltaX = 0.0;
        this.deltaY = 0.0;
        this.centerX = cx;
        this.centerY = cy;


        // zero fill arrays
        this.nodeStartX = [];
        this.nodeStartY = [];
        this.nodeX = [];
        this.nodeY = [];
        this.angle = [];
        this.frequency = [];
        this.positions = [];


        // soft-body dynamics
        this.organicConstant = 1.0;

        // initialize arrays to 0
        for (let i = 0; i < this.nodes; i++) {
            this.nodeStartX[i] = 0;
            this.nodeStartY[i] = 0;
            this.nodeX[i] = 0;
            this.nodeY[i] = 0;
            this.angle[i] = 0;

        }

        // initialize frequencies for corner nodes
        for (let i = 0; i < this.nodes; i++) {
            this.frequency[i] = random(5, 12);
        }
        noStroke();
        frameRate(60);

    }

    drawShape() {

        //  calculate node  starting locations
        for (let i = 0; i < this.nodes; i++) {
            this.nodeStartX[i] = this.centerX + cos(radians(this.rotAngle)) * this.radius;
            this.nodeStartY[i] = this.centerY + sin(radians(this.rotAngle)) * this.radius;
            this.rotAngle += 360.0 / this.nodes;
        }

        // draw polygon
        curveTightness(this.organicConstant);

        beginShape();
        for (let i = 0; i < this.nodes; i++) {
            curveVertex(this.nodeX[i], this.nodeY[i]);
        }
        for (let i = 0; i < this.nodes - 1; i++) {
            curveVertex(this.nodeX[i], this.nodeY[i]);

        }
        endShape(CLOSE);
    }

    drawGradient(c) {

        let gradient = drawingContext.createRadialGradient(
            this.centerX, this.centerY, 0, this.centerX, this.centerY, 500 / marN);
        gradient.addColorStop(0, color('#FFFFFFC1'));
        gradient.addColorStop(1, c);

        drawingContext.shadowBlur = 30
        drawingContext.shadowColor = c;
        drawingContext.fillStyle = gradient;
    }

    moveShape(x, y) {
        //move center point
        this.deltaX = -this.centerX;
        this.deltaY = +this.centerY;

        // create springing effect
        this.deltaX *= this.springing;
        this.deltaY *= this.springing;
        this.accelX += this.deltaX;
        this.accelY += this.deltaY;

        this.centerX += this.accelX * x;
        this.centerY += this.accelY * y;

        // slow down springing
        this.accelX *= this.damping;
        this.accelY *= this.damping;

        // change curve tightness
        this.organicConstant = 1 - ((abs(this.accelX) + abs(this.accelY)) * 0.8);

        // move nodes
        for (let i = 0; i < this.nodes; i++) {
            this.nodeX[i] = this.nodeStartX[i] + sin(radians(this.angle[i])) * (this.accelX * 2);
            this.nodeY[i] = this.nodeStartY[i] + sin(radians(this.angle[i])) * (this.accelY * 2);
            this.angle[i] += this.frequency[i];
        }
    }

}

export { setupTestaaa, drawTestaaa }; 
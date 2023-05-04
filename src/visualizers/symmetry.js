import { State } from "../model/state";

const symmetry = 6;   
const angle = 360 / symmetry;
// Color Palettes 
const palettes = [
    ["#ffadad","#ffd6a5","#fdffb6","#caffbf","#9bf6ff","#a0c4ff","#bdb2ff","#bdb2ff","#fffffc"],
    ["#d9ed92","#b5e48c","#99d98c","#76c893","#52b69a","#34a0a4","#168aad","#1a759f","#1e6091"],
    ["#f94144","#f3722c","#f8961e","#f9844a","#f9c74f","#90be6d","#43aa8b","#4d908e","#577590"],
    ["#eeef20","#dddf00","#d4d700","#bfd200","#aacc00","#80b918","#55a630","#2b9348","#007f5f"],
    ["#33658a","#86bbd8","#2f4858","#f6ae2d","#f26419","#2afc98","#09e85e","#16c172","#ffc1cf"],
];

var n;

function setupSymmetry() {
    const canvas = createCanvas(windowWidth, windowHeight);
    canvas.parent("canvas");
    background(255);
    angleMode(DEGREES);
    stroke(0, 30);
    noFill();

    n = 0.01;
}

function drawSymmetry() {
    background(255)

    const test = State.sources[3];

    translate(width/2 + 20,height/2 + 20);
    drawFigure(test, drawBezier);
}

function getVector(index, total) {
    const angle = map(index % total, 0, total, 0, TWO_PI);
    const v = p5.Vector.fromAngle(angle + PI);
    v.mult(r);
    return v;
}


function drawFigure(source, draw) {
    
    
    for (let i = 0; i < symmetry; i++) {
        rotate(angle);
        var ang = map(i, 0, symmetry, 0, TWO_PI);
        var x = cos(ang);
        var y = sin(ang);
        draw(source, x, y);
        push();
        scale(1,-1);
        draw(source, x, y);
        pop();
    }
}

function drawCurve(source, _x, _y) {
    const data = State.getEnvelope(source);
    // Set the tightness value
    //curveTightness(tightnessValue);
    
    // Draw curve using curveVertex()

    push();
    beginShape();
    for (let i = 0; i < data.length; i++) {
        const x = map(log(i), 0, log(data.length), 0, width) * _x;
        const y = map(data[i], 1, 0, 50, 0) * _y;
        curveVertex(x, y);
    }
    endShape();
    pop();
}

function drawBezier(source,x,y) {
    const wave = State.getWaveform(source);
    const freq = State.getSpectrum(source);

    translate(width/2,height/2);

    push();

    beginShape();

    for (let i = 0; i < wave.length; ++i) {
        const a = 1;
        const w = wave[i]*a;
        const f = freq[i]*a;

        const r = w;
        rotate(TWO_PI/(1/r*r))

        vertex(w, w*i, f, f*i, w, f);
    }
    endShape();
    pop();
}

// var x1 = w * noise(n * frameCount, 10) * x;
// var x2 = w * noise(n * frameCount, 20);
// var x3 = w * noise(n * frameCount, 30);
// var x4 = w * noise(n * frameCount, 40);
// var y1 = h * noise(n * frameCount, 50) * y;
// var y2 = h * noise(n * frameCount, 60);
// var y3 = h * noise(n * frameCount, 70);
// var y4 = h * noise(n * frameCount, 80);

export { setupSymmetry, drawSymmetry }
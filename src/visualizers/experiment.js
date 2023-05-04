import { cos } from "@tensorflow/tfjs";
import { State } from "../model/state";

const Exp = 6;   
const angle = 360 / Exp;
// Color Palettes 
const palettes = [
    ["#ffadad","#ffd6a5","#fdffb6","#caffbf","#9bf6ff","#a0c4ff","#bdb2ff","#bdb2ff","#fffffc"],
    ["#d9ed92","#b5e48c","#99d98c","#76c893","#52b69a","#34a0a4","#168aad","#1a759f","#1e6091"],
    ["#f94144","#f3722c","#f8961e","#f9844a","#f9c74f","#90be6d","#43aa8b","#4d908e","#577590"],
    ["#eeef20","#dddf00","#d4d700","#bfd200","#aacc00","#80b918","#55a630","#2b9348","#007f5f"],
    ["#33658a","#86bbd8","#2f4858","#f6ae2d","#f26419","#2afc98","#09e85e","#16c172","#ffc1cf"],
];

var n;

function setupExp() {
    const canvas = createCanvas(windowWidth, windowHeight);
    canvas.parent("canvas");
    background(255);
    angleMode(DEGREES);
    stroke(0, 30);
    noFill();
    n = 0.01;
}

function drawExp() {
    background(255)

    const test = State.sources[3];

    drawBezier(test);
}

function getVector(index, total) {
    const r = 150;
    const angle = map(index, 0, total, 0, TWO_PI);
    const v = p5.Vector.fromAngle(angle + PI);
    v.mult(r);

    return v;
}


function drawBezier(source) {
    const wave = State.getWaveform(source);
    const freq = State.getSpectrum(source);

    const N = wave.length;
    const max = 255;

    const w = width/2;
    const h = height/2;
    translate(w, h);
    push();
    beginShape();
    for (let i = 0; i < N; ++i) {
        const a = 0.1;
        const wav = wave[i];
        const frq = freq[i];
        
        const ang = getVector(i, N);
        const m = map(wav, -200, 0, 0, 1);
        //const res = ang.dot(vec);
        
        //rotate(TWO_PI/(1/r*r))
        //push()
        //strokeWeight(f);
        line(0, 0, ang.x*m, ang.y*m);
        //pop()
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

export { setupExp, drawExp }
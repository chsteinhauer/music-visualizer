import { State } from "../components/state";

const Exp = 6;   
const angle = 360 / Exp;
let pc = 0;
let ps = 0;
let x, y;

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
    background(0);
    //angleMode(DEGREES);
    rectMode(CENTER);
    ellipseMode(CENTER);
    stroke(0, 30);
    noFill();
    n = 0.01;

    colorMode(HSB);
}

function drawExp() {
    const test = State.sources[3];

    drawStuff(test);
}

function getVector(index, total) {
    const r = 150;
    const angle = map(index, 0, total, 0, TWO_PI);
    const v = p5.Vector.fromAngle(angle + PI);
    v.mult(r);

    return v;
}

function drawStuff(source) {
    const chunk = 16; 
    const wave = State.getByteWaveform(source);
    const freq = State.getByteSpectrum(source);

    background(0);
    strokeWeight(1);

    translate(width/2, height/2);
    for (let i = 0; i < freq.length; i += chunk) {
        const data = freq.slice(i, i + chunk);
        //stroke(frameCount % 360, 75, 100);

        stroke(255 - i);


        beginShape();
        push();
        for (let j = 0; j < data.length; j++) {
            const m = map(data[j], 0, 255, 0, 1);
            const g = (10 + 10*(1+i)) - (5*(1+i) * m)

            x = cos(j) * g;// - w * 20);
            y = sin(j) * g;
            
            curveVertex(x, y);
        }
        pop();
        endShape();

    }
    
}


function drawBezier(source) {



    const N = wave.length;
    const max = 255;
    const level = State.getLevel(source);


    //background(0, 0,0,0.075);
    background(0);
    stroke(frameCount % 360, 75, 100);
    strokeWeight(1);

    const _c = cos(level);
    const _s = sin(level);


    const c = _c - pc;
    const s = _s - ps;

    var ang1 = s * TWO_PI;		
	var ang2 = s * TWO_PI;
	var ang3 = c * TWO_PI;
	var rx = c * 60;
	var tx = c * 200;
	var size1 = c * 200;
	var size2 = s * 50;

    // var ang1 = TWO_PI * noise(0.01*frameCount + 10);		
	// var ang2 = TWO_PI * noise(0.01*frameCount + 20);
	// var ang3 = TWO_PI * noise(0.01*frameCount + 30);
	// var rx = 60 * noise(0.01*frameCount + 40);
	// var tx = 200 * noise(0.01*frameCount + 50);
	// var size1 = 200 * noise(0.01*frameCount + 60);
	// var size2 = 50 * noise(0.01*frameCount + 60);

    const w = width/2;
    const h = height/2;
    translate(w, h);

    const t = map(level, 0, 1, -5, 5);
    //curveTightness(t);



    beginShape();
	//for (var i = 0; i < 8; i++) {
    for (let i = 0; i < N; ++i) {
		push();
        x = cos(w) * gg;// - w * 20);
        y = sin(w) * gg;
        
        curveVertex(x, y);
		rotate(1 + TWO_PI * (i / N));
		//translate(, 0);
		//rect(0, 0, size1, size1);
        //ellipse(0, 0, size2);
        const wav = wave[i];
        const frq = freq[i];

        const w = map(wav, 0, max, 0, 1);
        //const scale = ((i+1) / N) * 200;

        //curveTightness(w);
        
        const gg = (150);//) - w * 20);

        
		// for (var j = 0; j < 6; j++) {
		// 	push();
		// 	rotate(ang2 + TWO_PI * j / 6);
		// 	translate(rx, 0);
		// 	rotate(ang3);
		// 	rect(rx, 0, size2, size2);
		// 	pop();
		// }		
		pop();
	}
    endShape(CLOSE);
    
    // let x, y;
    // beginShape();
    // for (let i = 0; i < N; ++i) {

    //     const wav = wave[i];
    //     const frq = freq[i];

    //     //const res = ang.dot(vec);
        

    //     const w = map(wav, 0, max, 0, 100);
    //     const vec = getVector(w, level);

    //     x = vec.x;
    //     y = vec.y;
        
    //     curveTightness(level);
    //     curveVertex(x, y);
        // line(x, y, px, py);
        // line(width - x, y, width - px, py);
        // line(x, height - y,  px, height -py);
        // line(width - x, height - y, width - px, height -py);

        // px = x;
        // py = y;
    // }
    // endShape();
    //pop();
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
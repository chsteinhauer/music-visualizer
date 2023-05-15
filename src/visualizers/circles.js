import { config } from "../model/config.js";
import { State } from "../components/state.js";

let pos;
let interval;

const palettes = [
    ["#ffadad","#ffd6a5","#fdffb6","#caffbf","#9bf6ff","#a0c4ff","#bdb2ff","#bdb2ff","#fffffc"],
    ["#d9ed92","#b5e48c","#99d98c","#76c893","#52b69a","#34a0a4","#168aad","#1a759f","#1e6091"],
    ["#f94144","#f3722c","#f8961e","#f9844a","#f9c74f","#90be6d","#43aa8b","#4d908e","#577590"],
    ["#eeef20","#dddf00","#d4d700","#bfd200","#aacc00","#80b918","#55a630","#2b9348","#007f5f"],
    ["#33658a","#86bbd8","#2f4858","#f6ae2d","#f26419","#2afc98","#09e85e","#16c172","#ffc1cf"],
];
const scale = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

function setupCircles() {
    const canvas = createCanvas(windowWidth, windowHeight);
    canvas.parent("canvas");
    noStroke();
    ellipseMode(CENTER);

    const N = State.sources.length;
    interval = height / (N + 1);
    pos = new Array(N + 1).fill(interval).map((x, i) => x * (i + 1));
}

function drawCircles() {
    if (!pos) return;

    background(255);

    const sources = config.sources;
    for (const [i, s] of State.sources.entries()) {
        const data = State.getByteSpectrum(s);

        const c = sources[i];
        drawShape(data, s, c, i);
    }
}

function drawShape(data, source, config, index) {
    const p = 20;
    const levels = State.getLevels(source, 8);
    fill(palettes[1][index]);
    // line
    push();
    for (let i = 0; i < data.length; i++) {
        const x = map(log(i), 0, log(data.length), p, width-p);
        const y = pos[index];
        const r = map(data[i], 0, 255, 1, 100);
        
        ellipse(x, y, r);
    }
    pop();

    // text
    push()
    fill(50, 15);

    fill(0, 102, 153, 51);
    text(source.title, width - 100, pos[index] - 10);
    pop()
}

export { setupCircles, drawCircles };
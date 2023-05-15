import { config } from "../static/config.js";
import { State } from "../components/state.js";

let pos;
let interval;

const scale = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

function setupBasic() {
    const canvas = createCanvas(windowWidth, windowHeight);
    canvas.parent("canvas");
    noFill();
    stroke(0, 50);

    const N = State.sources.length;
    interval = height / (N + 1);
    pos = new Array(N + 1).fill(interval).map((x, i) => x * (i + 1));
}

function drawBasic() {
    if (!pos) return;

    background(255);

    for (const [i, c] of config.sources.entries()) {
        const s = State.sources.find((_s) => _s.title === c.title);
        const data = State.getByteSpectrum(s);
        
        drawShape(data, s, i);
    }
}

function drawShape(data, source, index) {
    const p = 20;
    // line
    push();
    beginShape();
    for (let i = 0; i < data.length; i++) {
        const x = map(log(i), 0, log(data.length), p, width-p);
        const y = map(data[i], 100, 0, pos[index] - 40, pos[index]);
        curveVertex(x, y);
    }
    endShape();
    pop();

    // text
    push()
    fill(0, 102, 153, 51);
    text(source.title, width - 100, pos[index] - 10);
    pop()
}

export { setupBasic, drawBasic };
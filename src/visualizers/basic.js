import { config } from "../model/config.js";
import { State } from "../model/state.js";

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

    const sources = config.sources;
    for (const [i, s] of State.sources.entries()) {
        const data = State.getByteSpectrum(s);

        const c = sources[i];
        drawShape(data, s, c, i);
    }
}

function drawShape(data, source, config, index) {
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
    fill(50, 15);

    //const pitch = freqToMidi(source.frequency);
    //const p = map(source.frequency, config.minPitch, config.maxPitch, 0, 100);
    const level = State.getLevel(source);
    ellipse(width - 100, pos[index] - 10, 200*level);

    fill(0, 102, 153, 51);
    text(source.title + ": " + level, width - 100, pos[index] - 10);
    pop()
}

export { setupBasic, drawBasic };
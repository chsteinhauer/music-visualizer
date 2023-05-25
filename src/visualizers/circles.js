import { config } from "../static/config.js";
import { State } from "../components/state.js";
import { palette1 } from "../static/palettes.js";

let pos;
let interval;

function setupCircles() {
    const canvas = createCanvas(windowWidth, windowHeight);
    canvas.parent("canvas");
    noStroke();
    ellipseMode(CENTER);
    background(255);
    drawingContext.shadowColor = ('#0073b6');
    drawingContext.shadowBlur = 1;

    const N = State.sources.length;
    interval = height / (N + 1);
    pos = new Array(N + 1).fill(interval).map((x, i) => x * (i + 1));
}


function drawCircles() {
    if (!pos) return;

    background(255);

    for (const [i, c] of config.sources.entries()) {
        const s = State.sources.find((_s) => _s.title === c.title);
        const data = State.getByteSpectrum(s);
        
        drawShape(data, s, i);
    }
}

function drawShape(data, source, index) {
    const p = 200;
    const color = palette1.rgb[(3 - index) + 5];
    
    // circles
    push();
    for (let i = 0; i < data.length; i++) {
        const x = map(log(i), 0, log(data.length), p, width-p);
        const y = pos[index];
        const r = map(data[i], 0, 255, 1, 120);
        
        const c = map(data[i], 0, 255, 15, 110);
        fill(...color, c);
        ellipse(x, y, r);
    }
    pop();

    // text
    push()
    fill(0, 102, 153, 51);
    text(source.title, width - p - 35, pos[index] - 10);
    pop()
}

export { setupCircles, drawCircles };
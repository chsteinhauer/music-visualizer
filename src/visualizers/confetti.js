import { config } from "../static/config.js";
import { State } from "../components/state.js";
import { palette1 } from "../static/palettes.js";

let pos;
let interval;

const particles = [
    [], [], [], []
];

function setupConfetti() {
    const canvas = createCanvas(windowWidth, windowHeight);
    canvas.parent("canvas");

    ellipseMode(CENTER);
    background(0);

    const N = State.sources.length;
    interval = ((height / 2) / (N + 2)) + 75;
    pos = new Array(N + 1).fill(interval).map((x, i) => x * (i + 1)).reverse();
}

function drawConfetti() {
    if (!pos) return;

    background(0);
    const h = height / 2;
    const w = width / 2;
    translate(w, h);

    for (const [i, c] of config.sources.entries()) {
        push();
        const color = palette1.rgb[i + 4];

        const s = State.sources.find((_s) => _s.title === c.title);
        const data = State.getByteSpectrum(s);
        const level = State.getLevel(s);

        stroke(...color, 90 + 20 * level);
        const radius = (h - pos[i]) + 400;

        ellipse(0, 0, radius + 10 * level);

        drawShape(data, radius + 10 * level, color, 1, i);

        push();
            scale(-1, 1);
            drawShape(data, radius, color, -1, i);
        pop();

        const amount = particles[i].length;
        const test = level > 0.1 ? log(amount * 0.01 + level) * 0.15 : 0;
        for (let j = amount - 1; j >= 0; j--) {
            particles[i][j].update(level + test);
            particles[i][j].show();
            if (particles[i][j].finished()) {
                particles[i].splice(j, 1);
            }
        }
        pop();
    }
}

function drawShape(data, radius, color, s, index) {

    rotate(PI/2);

    push();
    const r = map(log(radius), 0, log(height/2), 0, 1);

    noStroke();
    const _color = [color[0], color[1]+random(-0, 10), color[2]];
    for (let i = 0; i < data.length; ++i) {

        const m = map(log(i), 0, log(data.length), 0, PI);
        const d = map(data[i], 0, 255, 0, 1);

        const x = (cos(m) * radius / 2) * s;
        const y = (sin(m) * radius / 2) * s;

        if (d > 0.01) {
            let p = new Particle(x, y, d * r * 15, d + 0.1 + m * 0.3 * r, _color, s);
            particles[index].push(p);
        }
    }

    pop();
}

class Particle {
    constructor(x, y, d, a, color, s) {
        this.x = x;
        this.y = y;

        this.vx = random(-1, 0.5);
        this.vy = random(-0.5*s, 1*s);
        this.alpha = 255 * a;
        this.a = a;
        this.d = d;
        this.color = color;
    }

    finished() {
        return this.alpha < 0;
    }

    update(d) {
        this.x += this.vx;
        this.y += this.vy;
        this.alpha -= 3 + 25 * d;
        this.d -= random(0.2, 1) * d;
    }

    show() {
        noStroke();
        fill(...this.color, this.alpha);
        ellipse(this.x, this.y, this.d);
    }
}

export { setupConfetti, drawConfetti };
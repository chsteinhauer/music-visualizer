import { State } from "../model/state.js";

let pos;
let interval;

function setupBasic() {
    var canvas = createCanvas(windowWidth, windowHeight);
    canvas.parent("canvas");
	noFill();
	stroke(0, 50);

    var N = State.sources.length;
    interval = height / (N + 1);
    pos = new Array(N + 1).fill(interval).map((x,i) => x * (i+1));
}

function drawBasic() {
    background(255);
    let index = 0;

    for (var s of State.sources) {
        const signal = s.buffer;
        s.analyser.getByteFrequencyData(signal);

        // line
        push();
        beginShape();
        for (let i = 0; i < signal.length; i++) {
            let x = map(log(i), 0, log(signal.length), 0, width);
            let y = map(signal[i], 100, 0, pos[index] - 40, pos[index]);
            curveVertex(x, y);
        }
        endShape();
        pop();

        // text
        push()
        fill(0, 102, 153, 51);
        text(s.title, width-50, pos[index] - 10);
        pop()

        index++;
    }

}

export { setupBasic, drawBasic };
import { Player } from "../components/audio-player.js";
import { State } from "../model/state";

let pos;
let interval;

function setupTest() {
    var canvas = createCanvas(windowWidth, windowHeight);
    canvas.parent("canvas");
	noFill();
	stroke(0, 50);

    var N = State.sources.length;
    interval = height / (N + 1);
    pos = new Array(N + 1).fill(interval).map((x,i) => x * (i+1));
}

function drawTest() {
    background(255);
    let index = 0;

    // push();
    // fill(210);
    // stroke(0);
    // ellipse(width / 2, height / 2, 10 + Player.getLevel() * 500);
    // pop();

    for (var s of State.sources) {
        const signal = s.buffer;
        s.analyser.getByteFrequencyData(signal);
        //console.log(signal);

        push();
        beginShape();
        for (let i = 0; i < signal.length; i++) {
            let x = map(i, 0, signal.length, 0, width);
            let y = map(signal[i], 100, 0, pos[index] - 40, pos[index]);
            curveVertex(x, y);
        }
        endShape();
        pop();

        index++;
    }

}

export { setupTest, drawTest };
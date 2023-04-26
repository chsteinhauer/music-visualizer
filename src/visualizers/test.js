import { State } from "../model/state";

let pos;
    
function setupTest() {
    var canvas = createCanvas(windowWidth, windowHeight);
    canvas.parent("canvas");
    ellipseMode(CENTER);
	noFill();
	stroke(0, 50);

    var N = State.sources.length;
    var interval = height / (N + 2);
    pos = new Array(N + 1).fill(interval).map((x,i) => x * (i+1));

    console.log(pos);
}

function drawTest() {
    background(255);

    var index = 0;

    //const test = state.analyzer;

    // for (var s of state.sources) {
    //     const signal = s.buffer;
    //     const N = signal.length;

    //     push();
    //     translate(0, pos[index]);
    //     beginShape();
    //     // for (let i = 0; i < N; i++) {
    //     //     let x = map(i, 0, N, 0, width);
    //     //     let y = map(signal[i], 0, 1, 0, height);
    //     //     vertex(x, y);
    //     // }
    //     endShape();
    //     pop();

    //     index++;
    // }
}

export { setupTest, drawTest };
import { state } from "../model/state";


function setupTest() {
    var canvas = createCanvas(800, 600);
    canvas.parent("canvas");
    background(51);
}

function drawTest() {
    background(51);
    setCenter(400, 300);

    const freq = state.pitch;
    const midi = freqToMidi(freq);
    const size = 10000/freq*0.8;

    polarEllipses(freq*(20/midi),size,size,freq*(20/midi));
}

export { setupTest, drawTest }; 
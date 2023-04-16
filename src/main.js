import { PitchDetector } from "./utils/PitchDetector";
import "p5js-wrapper";
import 'p5js-wrapper/sound';
import "../assets/libraries/polar/polar.min.js";
import { state } from "./model/state";
import { setup,draw } from "./visualizers";

const model_url = 'https://cdn.jsdelivr.net/gh/ml5js/ml5-data-and-models/models/pitch-detection/crepe/';

let audioContext;
let mic;
let clicked = false;
let pitch;


document.addEventListener('click', function (e) {
    if (clicked) return; 
    
    audioContext = getAudioContext();

    pitch = new PitchDetector();
    mic = new p5.AudioIn();
    mic.start(() => pitch.startPitch(model_url, audioContext, mic.stream));

    audioContext.resume();

    clicked = true;
})

function update () {
    state.pitch = pitch.getPitch();
}

window.setup = () => {
    setup();
}

window.draw = () => {
    if (!clicked) return;

    update();
    draw();
}

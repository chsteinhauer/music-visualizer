import { PitchDetector } from "./utils/PitchDetector";
import "p5js-wrapper";
import 'p5js-wrapper/sound';
import "../assets/libraries/polar/polar.min.js";
import { state } from "./model/state";
import { setup,draw } from "./visualizers";
import { AudioPlayer } from "./components/AudioPlayer";

const model_url = 'https://cdn.jsdelivr.net/gh/ml5js/ml5-data-and-models/models/pitch-detection/crepe/';
let pitch;
let player;

function update () {
    state.pitch = pitch.getPitch();
}

window.setup = () => {
    try {
        pitch = new PitchDetector();
        player = new AudioPlayer();
        player.setup((context, mic) => pitch.startPitch(model_url, context, mic.stream));

        setup();
    } catch (err) {
        console.log(err);
    }
}

window.draw = () => {
    try {
        update();
        draw();
    } catch (err) {
        console.log(err);
    }
}

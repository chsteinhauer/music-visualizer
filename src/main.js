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

        // example interaction with server
        exampleFetch();

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

async function exampleFetch() {
    const res = await fetch("http://localhost:3000/analyze", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            hello: "world",
            arr: [1,2,3,4]
        })
    });

    const text = await res.json();

    console.log(text);
}
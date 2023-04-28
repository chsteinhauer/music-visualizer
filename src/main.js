import "p5js-wrapper";
import 'p5js-wrapper/sound';
import "../assets/libraries/polar/polar.min.js";
import { State } from "./model/state";
import { setup, draw } from "./visualizers";
import { Player } from "./components/audio-player.js";
import { setupLoading, drawLoading } from "./visualizers/loading.js";


let _loading = true;

window.setup = async () => {

    try {

        State.setState("loading");
        setupLoading();

        var srcs = ["vocals", "bass", "drums", "other"]; //await sources();

        for (var s of srcs) {
            State.add({ title: s });
        }
        
        Player.init(() => {
            _loading = false;
        });

        setup();

    } catch (err) {
        console.error(err);
    }
}

window.draw = () => {
    try {
        if (State.isLoading()) {
            drawLoading(_loading, () => Player.display());
        } else if (State.isStreaming()) {
            draw();
        }
    } catch (err) {
        console.error(err);
    }
}

// Create a WebWorker for Audio Processing.
const worker = new Worker('./components/worker.js', { type: 'module'});

// Send FreeQueue instance and atomic state to worker.
worker.postMessage({
    type: 'init',
    data: {
        inputQueue: Player.inputQueue,
        outputQueue: Player.outputQueue,
        atomicState: Player.atomicState,
    }
});
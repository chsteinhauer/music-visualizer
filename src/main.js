import "p5js-wrapper";
import 'p5js-wrapper/sound';
import "../assets/libraries/polar/polar.min.js";
import { State } from "./model/state";
import { setup, draw, windowResized } from "./visualizers";
import { Player } from "./components/audio-player.js";
import { setupLoading, drawLoading } from "./visualizers/loading.js";
import { setupModel } from "./utils/pitch-detector.js";
import { clearTimeouts, setInterruptableTimeout } from "./utils/utils.js";

let _hoverPlaybar = false;
let _loading = true;
let _fs = false;

function reset() {
    setup();
}

window.windowResized = () => {
    windowResized();
}

window.setup = async () => {
    // Setup play button, have "start" and "stop" functionality
    const toggle = document.querySelector('#toggle-play');
    toggle.addEventListener('click', async () => { 
        setup();
        await Player.toggleButtonClickHandler(toggle);
    });

    const bar = document.querySelector('#playbar');
    bar.addEventListener("mouseleave", (e) => {
        _hoverPlaybar = false;
    });
    bar.addEventListener("mouseover", function (event) {
        clearTimeouts();
        _hoverPlaybar = true;
    });

    const fscreen = document.querySelector('#fullscreen');
    fscreen.addEventListener('click', () => fullscreen(!_fs));

    try {
        State.setState("loading");
        setupLoading();
        await setupModel();

        var srcs = ["vocals", "bass", "drums", "other"]; //await sources();

        for (var s of srcs) {
            State.add({ title: s });
        }

        Player.init(() => {
            _loading = false;
            
        });

    } catch (err) {
        console.error(err);
    }
}

window.draw = () => {
    try {
        if (State.isLoading()) {
            drawLoading(_loading, () => {
                Player.display();
            });
        } else if (State.isStreaming()) {
            draw();
        }
    } catch (err) {
        console.error(err);
    }
}

onmousemove = (e) => {
    const bar = document.querySelector('#playbar');

    if (bar.classList.contains("hide")) {
        bar.classList.remove("hide");
        bar.classList.add("show");
    }

    if (_hoverPlaybar) return;

    setInterruptableTimeout(() => { 
        bar.classList.remove("show");
        bar.classList.add("hide");
    }, 2000)
};

// Create a WebWorker for Audio Processing.
const worker = new Worker('./components/worker.js', { type: 'module'});

worker.onmessage = (msg) => {
    const freqs = msg.data;
    State.sources.forEach((s,i) => s.frequency = freqs[i]);//s.frequencyQueue.push(freqs[i]));
};

// Send FreeQueue instance and atomic state to worker.
worker.postMessage({
    type: 'init',
    data: Player.data
});

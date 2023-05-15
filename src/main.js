import "p5js-wrapper";
import 'p5js-wrapper/sound';
import "../assets/libraries/polar/polar.min.js";
import { State } from "./components/state.js";
import { _setup, _draw, _windowResized } from "./visualizers";
import { Player } from "./components/audio-player.js";
import { setupLoading, drawLoading } from "./visualizers/loading.js";
import { clearTimeouts, setInterruptableTimeout } from "./utils/utils.js";
import { getSampleNames } from "./utils/api.js";

let _loading = true;
let _hoverPlaybar = false;
let _fs = false;
let _file;


window.windowResized = () => {
    _windowResized();
}

window.setup = async () => {
    try {
        State.setState("loading");

        var srcs = ["drums", "bass", "other", "vocals"];
        for (var s of srcs) {
            State.add({ title: s });
        }

        setupLoading();
        setupWorker();
        await setupUIComponents();

        _loading = false;
    } catch (err) {
        console.error(err);
    }
}

window.draw = () => {
    try {
        if (State.isLoading()) {
            drawLoading(_loading, () => {
                const bar = document.querySelector('#playbar');

                bar.classList.remove("playbar-init");
                bar.classList.add("show");
            });
        } else if (State.isStreaming()) {
            _draw();
        }
    } catch (err) {
        console.error(err);
    }
}


function setupWorker() {
    // Create a WebWorker for Audio Processing.
    const worker = new Worker('./components/worker.js', { type: 'module'});

    worker.onmessage = (msg) => {
        const freqs = msg.data;
        State.sources.forEach((s,i) => { 
            s.frequency = freqs[i];
        });//s.frequencyQueue.push(freqs[i]));
    };

    // Send FreeQueue instance and atomic state to worker.
    worker.postMessage({
        type: 'init',
        data: Player.data
    });
}

async function setupUIComponents() {
    // Playerbar
    const bar = document.querySelector('#playbar');
    bar.addEventListener("mouseleave", (e) => {
        _hoverPlaybar = false;
    });
    bar.addEventListener("mouseover", () => {
        clearTimeouts();
        _hoverPlaybar = true;
    });

    // File explorer button
    const imp = document.querySelector('#import');
    imp.addEventListener('click', () => importFile());


    // Play/pause button
    const toggle = document.querySelector('#toggle-play');
    toggle.addEventListener('click', async () => { 
        await Player.toggleButtonClickHandler();
    });
    toggle.disabled = true;
    toggle.classList.add("disabled");

    const select = document.querySelector('#examples');
    const files = await getSampleNames();
    console.log(files);
    for (const file of files) {
        select.add(new Option(file));
    }
    select.addEventListener("change", async (e) => {
        const file = e.target.value;

        Player.stop();
        toggle.disabled = true;
        toggle.classList.add("disabled");

        console.log(file)

        await Player.setupFromExample(file, () => {
            toggle.disabled = false;
            toggle.classList.remove("disabled");
            _hoverPlaybar = false;
            _file = file;

            _setup();
        })
    });

    // Fullscreen button
    const fscreen = document.querySelector('#fullscreen');
    fscreen.addEventListener('click', () => fullscreen(!_fs));
}

onmousemove = (e) => {
    if (!_file) return;

    const bar = document.querySelector('#playbar');

    if (bar.classList.contains("hide")) {
        bar.classList.remove("hide");
    }
    bar.classList.add("show");

    if (_hoverPlaybar) {
        clearTimeouts();
        return;
    };

    setInterruptableTimeout(() => { 
        bar.classList.remove("show");
        bar.classList.add("hide");
    }, 2000)
};

function importFile() {
    const input = document.createElement('input');
    input.type = 'file';
    input.onchange = async _ => {
        // you can use this method to get file and perform respective operations
        const file = input.files[0];

        const toggle = document.querySelector('#toggle-play');

        await Player.setupFromFile(file, () => {
            toggle.disabled = false;
            toggle.classList.remove("disabled");
            _hoverPlaybar = false;
            _file = file;

            _setup();
        });
    };
    input.click();
}
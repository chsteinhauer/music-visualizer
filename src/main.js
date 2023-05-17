import "p5js-wrapper";
import 'p5js-wrapper/sound';
import "../assets/libraries/polar/polar.min.js";
import { State } from "./components/state.js";
import { _setup, _draw, _windowResized } from "./visualizers";
import { Player } from "./components/audio-player.js";
import { setupLoading, drawLoading } from "./visualizers/loading.js";
import { clearTimeouts, setInterruptableTimeout, shuffle } from "./utils/utils.js";
import { getSampleNames } from "./utils/api.js";
import { config } from "./static/config.js";

let _loading = true;
let _hoverControls = false;
let _fs = false;
let _file;

let _active = false;
let _samples = [];
let _visualizers = [];
let _list = [];


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

        if (State.isTesting) {
            shuffle(_samples);
            shuffle(_visualizers);

            _list = _visualizers.flatMap(v => _samples.map(s => { 
                return { 
                    sample: s,
                    visualizer: v,
                }
            }));

            shuffle(_list);

            console.log(_list);
            
        }

        _loading = false;
    } catch (err) {
        console.error(err);
    }
}

window.draw = async () => {
    
    try {
        if (State.isTesting) {

            if (State.isStreaming()) {
                _draw();
            } else if (!_loading) {
                
            }
        } else {
            if (State.isLoading()) {
                drawLoading(_loading, () => {
                    const bar = document.querySelector('#playbar');
    
                    bar.classList.remove("playbar-init");
                    bar.classList.add("show");
                });
            } else if (State.isStreaming()) {
                _draw();
            }
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
        _hoverControls = false;
    });
    bar.addEventListener("mouseover", () => {
        clearTimeouts();
        _hoverControls = true;
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

    // Select examples dropdown
    const examples = document.querySelector('#examples');
    const files = await getSampleNames();
    for (const file of files) {
        examples.add(new Option(file));
        _samples.push(file);
    }
    examples.addEventListener("change", async (e) => {
        const file = e.target.value;

        Player.stop();
        toggle.disabled = true;
        toggle.classList.add("disabled");

        console.log(file)

        await Player.setupFromExample(file, () => {
            toggle.disabled = false;
            toggle.classList.remove("disabled");
            _hoverControls = false;
            _file = file;

            _setup();
        })
    });

    // Select visualizer dropdown
    const visualizers = document.querySelector('#visualizers');
    for (const visualizer of config.visualizers) {
        visualizers.add(new Option(visualizer.title));
        _visualizers.push(visualizer.title);
    }
    visualizers.addEventListener("change", async (e) => {
        const title = e.target.value;

        _setup(title);
    });

    // Fullscreen button
    const fscreen = document.querySelector('#fullscreen');
    fscreen.addEventListener('click', () => fullscreen(!_fs));
}

onmousemove = (e) => {
    if (!_file) return;

    const controls = document.getElementsByClassName("controls");

    for (const control of controls) {
        if (control.classList.contains("hide")) {
            control.classList.remove("hide");
        }
        control.classList.add("show");
    }

    if (_hoverControls) {
        clearTimeouts();
        return;
    };

    setInterruptableTimeout(() => { 
        for (const control of controls) {
            control.classList.remove("show");
            control.classList.add("hide");
        }
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
            _hoverControls = false;
            _file = file;

            _setup();
        });
    };
    input.click();
}

onkeyup = async (e) => {
    if (e.key == " " ||
        e.code == "Space" ||      
        e.keyCode == 32      
    ) {
        if (!State.isTesting) return;
        console.log(Player.hasEnded());
        if (Player.hasEnded()) {
            Player.stop();
            _file = "test";

            if (_list.length > 0) {
                const test = _list.splice(0, 1)[0];

                console.log(test.sample, test.visualizer);

                await Player.setupFromExample(test.sample, () => {
                    _setup(test.visualizer);

                    Player.start();
                });
            }
        }
    }

    if (e.key == "f" ||
        e.code == "KeyF"    
    ) {
        fullscreen(true);
    }
}
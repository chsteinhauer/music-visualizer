import { config } from "../static/config";

const visualizers = config.visualizers;
let current = visualizers[0];
let ready = false;

function _setup(title = null) {
    if (title) {
        ready = false;
        current = visualizers.find(v => v.title === title);
    }

    current.setup();
    ready = true;
}

function _draw() {
    if (!ready) return;

    current.draw();
}

function _windowResized() {
    resizeCanvas(windowWidth, windowHeight, true);
}

export {_setup, _draw, _windowResized};

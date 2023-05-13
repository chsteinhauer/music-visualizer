import { setupBasic, drawBasic } from './basic.js';
import { drawExp, setupExp } from './experiment.js';
import { setupTestaaa, drawTestaaa } from './lau.js';


var fsetup = [setupBasic, setupTestaaa];
var fdraw = [drawBasic, drawTestaaa];

let index = 0; 

function _setup() {
    fsetup[index]()
}

function _draw() {
    fdraw[index]()
}

function _windowResized() {
    resizeCanvas(windowWidth, windowHeight, true);
}

export {_setup, _draw, _windowResized};

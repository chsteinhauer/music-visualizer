import { setupBasic, drawBasic } from './basic.js';
import { drawExp, setupExp } from './experiment.js';
import { setupTestaaa, drawTestaaa } from './lau.js';
import { setupCircles, drawCircles } from './circles.js';


var fsetup = [setupBasic, setupTestaaa, setupExp, setupCircles];
var fdraw = [drawBasic, drawTestaaa, drawExp, drawCircles];

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

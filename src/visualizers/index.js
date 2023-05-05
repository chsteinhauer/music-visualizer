import { setupBasic, drawBasic } from './basic.js';
import { drawExp, setupExp } from './experiment.js';
import { setupTestaaa, drawTestaaa } from './lau.js';


var fsetup = [setupBasic, setupTestaaa];
var fdraw = [drawBasic, drawTestaaa];

let index = 1; 

function setup() {
    fsetup[index]()
}

function draw() {
    fdraw[index]()
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight, true);
}

export {setup, draw, windowResized};

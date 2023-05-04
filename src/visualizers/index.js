import { setupBasic, drawBasic } from './basic.js';
import { drawSymmetry, setupSymmetry } from './symmetry.js';
import { drawExp, setupExp } from './experiment.js';

var fsetup = [setupBasic, setupExp];
var fdraw = [drawBasic, drawExp];

let index = 0;

function setup() {
    fsetup[index]()
}

function draw() {
    fdraw[index]()
}

export {setup, draw};

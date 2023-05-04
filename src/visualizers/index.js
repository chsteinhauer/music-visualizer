import { setupTest, drawTest } from './test.js';
import { setupTestaaa, drawTestaaa } from './lau.js';

var fsetup = [setupTest, setupTestaaa];
var fdraw = [drawTest, drawTestaaa];


let index = 1; 

function setup() {
    fsetup[index]()
}

function draw() {
    fdraw[index]()
}

export {setup, draw};

import { setupBasic, drawBasic } from './basic.js';

var fsetup = [setupBasic];
var fdraw = [drawBasic];

let index = 0;

function setup() {
    fsetup[index]()
}

function draw() {
    fdraw[index]()
}

export {setup, draw};

import { setupTest, drawTest } from './test.js';


var fsetup = [setupTest];
var fdraw = [drawTest];

let index = 0;



function setup() {
    fsetup[index]()
}

function draw() {
    fdraw[index]()
}

export {setup, draw};

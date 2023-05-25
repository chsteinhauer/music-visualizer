import { State } from "../components/state";

var countdown = 200;

function setupLoading() {
    const canvas = createCanvas(windowWidth, windowHeight);
    canvas.parent("canvas");
    clear();
    noFill();
    ellipseMode(CENTER);
    background(255);
    stroke('hsla(0, 0%, 100%, 0.4)');
    drawingContext.shadowColor = ('#0073b6');
    drawingContext.shadowBlur = 8;
  
}

function drawLoading(loading = true, callback) {
    if (loading) {
        drawLoadingScreen();
    } else {
        transitionLoadingScreen(callback);
    }
}

function transitionLoadingScreen(callback) {
    const p = (1 / countdown--);
    const mul = 7 * p;

    var ang1 = TWO_PI * noise(0.01 * frameCount + 10);
    var ang2 = TWO_PI * noise(0.01 * frameCount + 20);
    var ang3 = TWO_PI * noise(0.01 * frameCount + 30);
    var rx = 60 * noise(0.01 * frameCount + 40);
    var tx = 200 * noise(0.01 * frameCount + 50);
    var size1 = 200 * noise(0.01 * frameCount + 60) * mul;
    var size2 = 50 * noise(0.01 * frameCount + 60) * mul;

    translate(width / 2, height / 2);
    for (var i = 0; i < 8; i++) {
        push();
        rotate(ang1 + (TWO_PI * i) / 8);
        translate(tx, 0);
        rect(0, 0, size1, size1);
        for (var j = 0; j < 6; j++) {
            push();
            rotate(ang2 + (TWO_PI * j) / 6);
            translate(rx, 0);
            rotate(ang3);
            rect(rx, 0, size2, size2);
            pop();
        }
        pop();
    }

    if (countdown < 1) {
        State.setState("default");
        callback();
    }
}

function drawLoadingScreen() {
    var ang1 = TWO_PI * noise(0.01 * frameCount + 10);
    var ang2 = TWO_PI * noise(0.01 * frameCount + 20);
    var ang3 = TWO_PI * noise(0.01 * frameCount + 30);
    var rx = 60 * noise(0.01 * frameCount + 40);
    var tx = 200 * noise(0.01 * frameCount + 50);
    var size1 = 200 * noise(0.01 * frameCount + 60);
    var size2 = 50 * noise(0.01 * frameCount + 60);

    translate(width / 2, height / 2);
    for (var i = 0; i < 8; i++) {
        push();
        rotate(ang1 + (TWO_PI * i) / 8);
        translate(tx, 0);
        rect(0, 0, size1, size1);

        for (var j = 0; j < 6; j++) {
            push();
            rotate(ang2 + (TWO_PI * j) / 6);
            translate(rx, 0);
            rotate(ang3);
            rect(rx, 0, size2, size2);
            pop();
        }
        pop();
    }
}

export { setupLoading, drawLoading };

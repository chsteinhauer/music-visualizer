const symmetry = 6;   
const angle = 360 / symmetry;

var n;

function setupSymmetry() {
    createCanvas(windowWidth, windowHeight);
    background(255);
    angleMode(DEGREES);
    stroke(0, 18);
    noFill();

    n = 0.01;
}


function drawSymmetry() {
    background(255,20)
    
    drawFigure(width/2 + 20, height/2 + 20);
}


function drawFigure(posx,posy) {
    translate(posx,posy);
    
    for (let i = 0; i < symmetry; i++) {
        rotate(angle);
        var ang = map(i, 0, symmetry, 0, TWO_PI);
        var x = cos(ang);
        var y = sin(ang);
        drawBezier(x,y);
        push();
        scale(1,-1);
        drawBezier(x,y);
        pop();
    }
}

function drawBezier(x,y) {
    const w = (width / symmetry);
    const h = (height / symmetry);
  
    var x1 = w * noise(n * frameCount, 10) * x;
    var x2 = w * noise(n * frameCount, 20);
    var x3 = w * noise(n * frameCount, 30);
    var x4 = w * noise(n * frameCount, 40);
    var y1 = h * noise(n * frameCount, 50) * y;
    var y2 = h * noise(n * frameCount, 60);
    var y3 = h * noise(n * frameCount, 70);
    var y4 = h * noise(n * frameCount, 80);

    bezier(x1, y1, x2, y2, x3, y3, x4, y4);
}
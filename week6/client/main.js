window.onload = () => {
    console.log("script is connected");

    new p5(myCanvas, "canvas");
    new p5(mySecondCanvas, "canvas1");
};

const myCanvas = (sketch) => {
    sketch.setup = () => {
        sketch.createCanvas(400, 400);
    };

    sketch.draw = () => {
        sketch.background("aliceblue");
    };
};

const mySecondCanvas = (sketch) => {
    sketch.setup = () => {
        sketch.createCanvas(400, 400);
    };

    sketch.draw = () => {
        sketch.background("lavender");
    };
};
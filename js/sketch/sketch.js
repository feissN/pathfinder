document.querySelector("#iterative").addEventListener("change", e => {
    if (!pathfinder.iterative) pathfinder.reset();
    pathfinder.iterative = e.target.checked;
});

document.querySelector("#solvers").addEventListener("change", e => {
    pathfinder.mode = parseInt(e.target.value);
    pathfinder.reset();
});

document.querySelector("#btnReset").addEventListener("click", e => {
    pathfinder.resetWalls();
});

document.querySelector("#btnMaze").addEventListener("click", e => {
    pathfinder.generateMaze(parseInt(document.querySelector("#mazes").value));
});

let pathfinder;

function setup() {
    let scale = 20;
    let cols = 60;
    let rows = 30;

    pathfinder = new Pathfinder(cols, rows, scale);
    // pathfinder.init(5, 10, cols - 5, 10);
    pathfinder.init(1, 1, cols - 2, rows - 2);
}

function draw() {
    pathfinder.run();
    pathfinder.show();
}
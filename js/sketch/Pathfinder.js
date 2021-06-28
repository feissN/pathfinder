class Pathfinder {
    constructor(w, h, s) {
        this.generating = false;
        this.mode = 1;
        this.iterative = false;

        this.w = w;
        this.h = h;
        this.s = s;

        this.solved = false;

        this.board = [];
        for (let j = 0; j < this.h; j++)
            for (let i = 0; i < this.w; i++)
                this.board.push(new Node(i, j, this.s, this.s));

        this.start = null;
        this.end = null;

        //Astar
        this.openSet = [];
        this.closedSet = [];

        //Dijkstra
        this.unvisited_set = [];
        this.visited_set = [];

        //RecDivGen
        this.vertical = false;

        this.north = 0;
        this.south = 1;
        this.west = 2;
        this.east = 3;
    }

    init(sx, sy, ex, ey) {
        this.start = this.board[IX(sx, sy, this.w)];
        this.end = this.board[IX(ex, ey, this.w)];

        this.reset();
    }

    run() {
        if (this.generating) return;
        if (!this.solved)
            if (this.mode === 1) this.AstarSolve();
            else if (this.mode === 2) this.DijkstraSolve();
    }

    reset() {
        this.solved = false;

        this.openSet = [];
        this.closedSet = [];

        let unvisited_set = [];

        for (let x = 0; x < this.w; x++)
            for (let y = 0; y < this.h; y++) {
                this.board[y * this.w + x].f = Infinity;
                this.board[y * this.w + x].g = Infinity;
                this.board[y * this.w + x].h = 0;
                this.board[y * this.w + x].prev = null;
                this.board[y * this.w + x].tDist = Infinity;
                this.board[y * this.w + x].visited = false;
                this.board[y * this.w + x].c.className = "cell";
                unvisited_set.push(this.board[y * this.w + x]);
            }

        this.start.g = 0;
        this.start.f = this.heuristic(this.start, this.end);
        this.openSet.push(this.start);

        this.start.tDist = 0;
        this.unvisited_set = unvisited_set;
        this.visited_set = [];
    }

    resetWalls() {
        for (let i = 0; i < this.board.length; i++) this.board[i].wall = false;
        this.reset();
    }

    heuristic(a, b) {
        return dist(a.x * this.s, a.y * this.s, b.x * this.s, b.y * this.s);
        return abs(a.x * this.s - b.x * this.s) + abs(a.y * this.s - b.y * this.s);
        return 1;
    }

    DijkstraSolve() {
        this.reset();
        while (this.unvisited_set.length)
            if (this.board[IX(this.end.x, this.end.y, this.w)].visited || this.DijkstraLogicStep(this.unvisited_set, this.start))
                return this.solved = true;
        this.solved = true;
    }

    DijkstraLogicStep(unvisited_set, source) {
        unvisited_set.sort((a, b) => a.tDist - b.tDist);
        if (unvisited_set[0].tDist === Infinity) return true;
        source = unvisited_set.shift();
        source.visited = true;

        unvisited_set.filter(e => e === source);
        this.visited_set.push(source);

        let neighbors = source.getNeighbors(this.board, this.w, this.h);
        for (let i = 0; i < neighbors.length; i++) {
            if (!neighbors[i].wall && neighbors[i].checkDiagonalPossible(source, this.board, this.w)) {
                let alt = source.tDist + this.heuristic(source, neighbors[i]);
                if (alt < neighbors[i].tDist) {
                    neighbors[i].tDist = alt;
                    neighbors[i].prev = source;
                }
            }
        }
    }

    AstarSolve() {
        this.reset();
        while (this.openSet.length) if (this.AstarLogicStep()) break;
        this.solved = true;
    }

    AstarLogicStep() {
        let shortest = Infinity;
        for (let i = 0; i < this.openSet.length; i++)
            shortest = min(shortest, this.openSet[i].f);

        let current = this.openSet.find(e => e.f === shortest);
        if (current == this.end) return this.solved = true;

        removeFromArray(this.openSet, current);
        this.closedSet.push(current);

        let neighbors = current.getNeighbors(this.board, this.w, this.h);
        for (let i = 0; i < neighbors.length; i++) {
            let neighbor = neighbors[i];

            if (!this.closedSet.includes(neighbor) && !neighbor.wall && neighbor.checkDiagonalPossible(current, this.board, this.w)) {
                let tempG = current.g + this.heuristic(neighbor, current);

                if (tempG < neighbor.g) {
                    neighbor.prev = current;
                    neighbor.g = tempG;
                    neighbor.h = this.heuristic(neighbor, this.end);
                    neighbor.f = neighbor.g + neighbor.h;
                    if (!this.openSet.includes(neighbor)) this.openSet.push(neighbor);
                }
            }
        }
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    async show() {
        if (this.generating) {
            this.showStartEnd();
            return;
        }

        for (let x = 0; x < this.w; x++)
            for (let y = 0; y < this.h; y++)
                if (this.board[y * this.w + x].wall) this.board[y * this.w + x].c.classList.add("wall");


        if (!this.iterative) {
            if (this.mode === 1) {
                for (let i = 0; i < this.closedSet.length; i++)
                    this.closedSet[i].c.className = "cell closedSet";
            } else if (this.mode === 2) {
                for (let i = 0; i < this.visited_set.length; i++)
                    this.visited_set[i].c.className = "cell visitedSet";
            }

            let p = this.end.prev ?? null;
            while (p && p.prev != null) {
                p.c.className = "cell path";
                p = p.prev;
            }
            this.showStartEnd();
        } else {
            this.iterative = false;
            noLoop();

            if (this.mode === 1) {
                for (let i = 0; i < this.closedSet.length; i++) {
                    this.closedSet[i].c.className = "cell closedSet-anim";
                    this.showStartEnd();
                    await this.sleep(1);
                }
            } else if (this.mode === 2) {
                for (let i = 0; i < this.visited_set.length; i++) {
                    this.visited_set[i].c.className = "cell visitedSet-anim";
                    this.showStartEnd();
                    await this.sleep(1);
                }
            }

            let path = [];
            let tmp = this.end;
            while (tmp.prev) {
                path.push(tmp);
                tmp = tmp.prev;
            }
            for (let i = path.length - 1; i > 0; i--) {
                path[i].c.className = "cell path-anim";
                await this.sleep(20);
            }

            await this.sleep(path.length * 25);

            loop();
            document.querySelector("#iterative").checked = false;
        }
    }

    showStartEnd() {
        let s = this.board.find(e => e.x == this.start.x && e.y == this.start.y);
        s.c.className = "cell start";
        s.c.innerHTML = "S";

        let e = this.board.find(e => e.x == this.end.x && e.y == this.end.y);
        e.c.className = "cell end";
        e.c.innerHTML = "X";
    }

    interact(mx, my, btn, shift) {
        if (this.iterative || this.generating) return;

        this.start.c.innerHTML = "";
        this.end.c.innerHTML = "";

        if (btn === 1) this.start = this.board[IX(mx, my, this.w)];
        if (btn === 2) this.end = this.board[IX(mx, my, this.w)];
        if (btn === 4 && !shift) this.board[IX(mx, my, this.w)].wall = true;
        if (btn === 4 && shift) this.board[IX(mx, my, this.w)].wall = false;

        this.solved = false;
        this.run();
    }

    async generateMaze(e) {
        this.generating = true;

        if (e === 1) {
            this.resetWalls();
            await this.genRandPrim();
        } else if (e === 2) {
            this.resetWalls();
            await this.genRecDiv();
        }

        this.generating = false;
    }

    async genRandPrim() {
        for (let i = 0; i < this.board.length; i++) {
            this.board[i].c.classList.add("wall");
            this.board[i].wall = true;
        }
        let initialCell = this.board[IX(0, 0, this.w)];
        let free = [];
        initialCell.wall = false;
        free.push(initialCell);

        let walls = [];

        // Add the walls of the cell to the wall list.
        let wallNeighbors = initialCell.giveWallNeighbors(this.board, this.w, this.h);
        while (wallNeighbors.length) {
            walls.push(wallNeighbors.shift());
        }

        // While there are walls in the list:
        while (walls.length > 0) {
            // Pick a random wall from the list. 
            let randomWall = random(walls);

            // If only one of the two cells that the wall divides is visited, then:
            let neighborCount = randomWall.getNeighbors(this.board, this.w, this.h, false).length - 1;
            let wallCount = randomWall.giveWallNeighbors(this.board, this.w, this.h).length;
            if (neighborCount == wallCount) {
                // Make the wall a passage
                randomWall.wall = false;
                free.push(randomWall);
                // mark the unvisited cell as part of the maze.
                let wallNeighbors = randomWall.giveWallNeighbors(this.board, this.w, this.h);
                while (wallNeighbors.length) {
                    walls.push(wallNeighbors.shift());
                }
            }
            removeFromArray(walls, randomWall);
        }

        for (let i = 0; i < free.length; i++) {
            free[i].c.classList.add("passage");
            if (!(i % 10)) await this.sleep(1);
        }

        await this.sleep(100);

        this.start.wall = false;
        this.end.wall = false;
    }

    async genRecDiv() {

        await this.divide(0, 0, this.h, this.w);
    }

    async divide(y, x, height, width) {
        const isEven = num => num % 2 === 0;

        const vertical = 0;
        const horizontal = 1;
        let orientation = horizontal;
        let new_wall = 0;
        let new_hole = 0;
        let new_height = 0;
        let new_width = 0;
        let y_pair = 0;
        let x_pair = 0;
        let new_height_pair = 0;
        let new_width_pair = 0;

        if (width < height) orientation = horizontal;
        else if (width > height) orientation = vertical;
        else orientation = random(1) > 0.5 ? vertical : horizontal;


        if (horizontal === orientation) {
            if (height < 5) return;
            new_wall = parseInt(y + (random(2, height - 3) / 2));
            new_hole = parseInt(x + (random(1, width - 2) / 2 + 1));

            if (!isEven(new_wall)) new_wall++;
            if (isEven(new_hole)) new_hole--;

            for (let i = x; i < (x + width); i++) {
                this.board[new_wall * this.w + i].wall = true;
                this.board[new_wall * this.w + i].c.classList.add("wall-anim");
                await this.sleep(1);
            }

            this.board[new_wall * this.w + new_hole].wall = false;
            this.board[new_wall * this.w + new_hole].c.classList.add("passage");
            await this.sleep(1);

            new_height = new_wall - y + 1;
            new_width = width;

            y_pair = new_wall;
            x_pair = x;
            new_height_pair = y + height - new_wall;
            new_width_pair = width;
        } else {
            if (width < 5) return;

            new_wall = parseInt(x + (random(2, width - 3) / 2));
            new_hole = parseInt(y + (random(1, height - 2) / 2 + 1));

            if (!isEven(new_wall)) new_wall++;
            if (isEven(new_hole)) new_hole--;

            for (let i = y; i < (y + height); i++) {
                this.board[i * this.w + new_wall].wall = true;
                this.board[i * this.w + new_wall].c.classList.add("wall-anim");
                await this.sleep(1);
            }

            this.board[new_hole * this.w + new_wall].wall = false;
            this.board[new_hole * this.w + new_wall].c.classList.add("passage");
            await this.sleep(1);

            new_height = height;
            new_width = new_wall - x + 1;

            y_pair = y;
            x_pair = new_wall;
            new_height_pair = height;
            new_width_pair = x + width - new_wall;
        }

        await Promise.all([
            this.divide(y, x, new_height, new_width),
            this.divide(y_pair, x_pair, new_height_pair, new_width_pair)
        ]);
    }
}
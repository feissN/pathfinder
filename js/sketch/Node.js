class Node {
    constructor(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.prev = null;
        this.wall = false;

        this.w = w;
        this.h = h;

        this.c = document.createElement("div");
        this.c.classList.add("cell");
        this.c.style = `width: ${this.w}px; height: ${this.h}px; `;
        this.c.addEventListener("mousedown", e => {
            pathfinder.interact(this.x, this.y, e.buttons, e.shiftKey);
        });
        this.c.addEventListener("mouseover", e => {
            if (e.buttons) {
                pathfinder.interact(this.x, this.y, e.buttons, e.shiftKey);
            }
        });
        document.querySelector("#canvas").append(this.c);

        //Astar
        this.f = 0;
        this.g = 0;
        this.h = 0;

        // Dijkstra
        this.visited = false;
        this.tDist = Infinity;
    }

    getNeighbors(cells, cols, rows, diagonal = true) {
        let neighbors = [];
        let x = this.x;
        let y = this.y;
        if (x != cols - 1) {
            neighbors.push(cells[IX(x + 1, y, cols)]);
            if (diagonal) if (y != rows - 1) neighbors.push(cells[IX(x + 1, y + 1, cols)]);
        }
        if (y != rows - 1) {
            neighbors.push(cells[IX(x, y + 1, cols)]);
            if (diagonal) if (x != 0) neighbors.push(cells[IX(x - 1, y + 1, cols)]);
        }
        if (x != 0) {
            neighbors.push(cells[IX(x - 1, y, cols)]);
            if (diagonal) if (y != 0) neighbors.push(cells[IX(x - 1, y - 1, cols)]);
        }
        if (y != 0) {
            neighbors.push(cells[IX(x, y - 1, cols)]);
            if (diagonal) if (x != cols - 1) neighbors.push(cells[IX(x + 1, y - 1, cols)]);
        }
        return neighbors;
    }

    checkDiagonalPossible(prev, grid, cols) {
        if (prev.x < this.x && prev.y < this.y) {
            if (grid[IX(this.x - 1, this.y, cols)].wall || grid[IX(this.x, this.y - 1, cols)].wall) {
                return false;
            }
        }
        if (prev.x < this.x && prev.y > this.y) {
            if (grid[IX(this.x - 1, this.y, cols)].wall || grid[IX(this.x, this.y + 1, cols)].wall) {
                return false;
            }
        }
        if (prev.x > this.x && prev.y < this.y) {
            if (grid[IX(this.x + 1, this.y, cols)].wall || grid[IX(this.x, this.y - 1, cols)].wall) {
                return false;
            }
        }
        if (prev.x > this.x && prev.y > this.y) {
            if (grid[IX(this.x + 1, this.y, cols)].wall || grid[IX(this.x, this.y + 1, cols)].wall) {
                return false;
            }
        }
        return true;
    }

    giveWallNeighbors(cells, cols, rows) {
        let wallNeighbors = [];
        let neighbors = this.getNeighbors(cells, cols, rows, false);
        neighbors.forEach(n => {
            if (n.wall) {
                wallNeighbors.push(n);
            }
        });
        return wallNeighbors;
    }
}
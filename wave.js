

function setupWave() {
    for (let rows of d.tiles) {
        for (let tile of rows) {
            // find neighbors
            tile.neighbors = [];

            for (let row = -1; row <= 1; row++) {
                for (let col = -1; col <= 1; col++) {
                    // skip self
                    if(row == col && col == 0) continue;

                    let neighbor = getTile(row + tile.row, col + tile.col);
                    if(neighbor) {
                        tile.neighbors.push(neighbor);
                    }
                }
            }
        }
    }


    let t = getTile(7, 7);
    // t.div.style.background = "red";
    // for (const neig of t.neighbors) {
    //     neig.div.style.background = "green";
    // }

    setTile(t, halves.grass_water_side);
    console.log(t);
    renderTile(t);
}


function setTile(tile, corners) {
    tile.corners = corners;
    tile.posibilities = 0;
}

function renderTile(tile) {
    tile.div.style.background = `linear-gradient(to top, ${tileColors[tile.corners[0]]}, transparent),linear-gradient(to right, ${tileColors[tile.corners[1]]}, transparent),linear-gradient(to bottom, ${tileColors[tile.corners[2]]}, transparent),linear-gradient(to left, ${tileColors[tile.corners[3]]}, transparent)`
}
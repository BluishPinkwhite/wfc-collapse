

let lastTile;
let nextTile;

let managedTiles = [];


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

    nextTile = getTile(randomInt(config.height), randomInt(config.width));
    managedTiles.push(nextTile);
    waveStep();
}


function waveStep() {
    lastTile = nextTile;
    setTileRandom(nextTile);
}


function setTileRandom(tile) {
    if(tile.possibilities.length == 0) {
        if(managedTiles.length > 0) {
            let lowestPossible = {
                tile: managedTiles[0],
                value: managedTiles[0].possibilities.length == 0 ? Infinity : managedTiles[0].possibilities.length,
            }
            
            // find next tile (lowest possibilities)
            for (const managedTile of managedTiles) {
                if(managedTile.possibilities.length < lowestPossible.value && managedTile.possibilities.length > 0) {
                    lowestPossible.value = managedTile.possibilities.length;
                    lowestPossible.tile = managedTile;
                }
            }
        
            nextTile = lowestPossible.tile;
            nextTile.div.style.background = "rgba(200,0,0,0.6)";
        }
    }

    setTile(tile, tile.possibilities[randomInt(tile.possibilities.length)]);

    renderTile(tile);
    
        
    // remove placed tile from managed tiles
    for (let i = managedTiles.length-1; i >= 0; i--) {
        if(managedTiles[i].possibilities == 0) {
            managedTiles.splice(i, 1);
        }
    }
}


function setTile(tile, corners) {
    tile.corners = corners;
    tile.possibilities = [];

    
    for (const neighbor of tile.neighbors) {
        recalcPossibilities(neighbor);
        renderTile(neighbor);

        for (const neighbor2 of neighbor.neighbors) {
            recalcPossibilities(neighbor2);
            renderTile(neighbor2);
        }
    }
}

function renderTile(tile) {
    if(tile.corners) {
        tile.div.innerText = "";
        tile.div.style.background = `conic-gradient(${tileColors[tile.corners[1]]} 0deg, ${tileColors[tile.corners[1]]} 90deg, ${tileColors[tile.corners[2]]} 90deg, ${tileColors[tile.corners[2]]} 180deg, ${tileColors[tile.corners[3]]} 180deg, ${tileColors[tile.corners[3]]} 270deg, ${tileColors[tile.corners[0]]} 270deg)`
    }
    else {
        tile.div.innerText = tile.possibilities.length||"";
    }
}

function recalcPossibilities(tile) {
    if(managedTiles.indexOf(tile) == -1){
        managedTiles.push(tile);
    }

    if(tile.corners) {
        tile.possibilities = [];
        return;
    }
    for (const neighbor of tile.neighbors) {
        // neighbor has a tile -> can decrease possible tiles on this tile
        if(neighbor.corners) {

            // iterate through all possible tiles
            for (let i = tile.possibilities.length-1; i >= 0; i--) {
                let possibleTile = tile.possibilities[i];

                // check if they align
                let possible = false;
                
                let collOff = tile.col - neighbor.col;
                let rowOff = tile.row - neighbor.row;

                tile.div.innerText = collOff + " " + rowOff;

                if(collOff == -1) {
                    // top left
                    if(rowOff == -1 && possibleTile[2] == neighbor.corners[0]) {
                        possible = true;
                    }
                    // left
                    else if(rowOff == 0 && possibleTile[1] == neighbor.corners[0] && possibleTile[2] == neighbor.corners[3]) {
                        possible = true;
                    }
                    // bottom left
                    else if(rowOff == 1 && possibleTile[1] == neighbor.corners[3]) {
                        possible = true;
                    }
                }
                else if(collOff == 0) {
                    // top
                    if(rowOff == -1 && possibleTile[3] == neighbor.corners[0] && possibleTile[2] == neighbor.corners[1]) {
                        possible = true;
                    }
                    // bottom
                    else if(rowOff == 1 && possibleTile[0] == neighbor.corners[3] && possibleTile[1] == neighbor.corners[2]) {
                        possible = true;
                    }
                }
                else if(collOff == 1) {
                    // top right
                    if(rowOff == -1 && possibleTile[3] == neighbor.corners[1]) {
                        possible = true;
                    }
                    // right
                    else if(rowOff == 0 && possibleTile[0] == neighbor.corners[1] && possibleTile[3] == neighbor.corners[2]) {
                        possible = true;
                    }
                    // bottom right
                    else if(rowOff == 1 && possibleTile[0] == neighbor.corners[2]) {
                        possible = true;
                    }
                }
                else {
                    console.warn("something has gone wrong in neighbor possibility recalc! val:" + collOff);
                }

                if(!possible) {
                    tile.possibilities.splice(i, 1);
                }
            }
        }
    }
}
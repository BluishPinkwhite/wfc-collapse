

let lastTile;
let nextTile;

let directions = {
    north: {
        value: "north",
        opposite: "south",
        corners: [0, 1],
    },
    east: {
        value: "east",
        opposite: "west",
        corners: [1, 2],
    },
    south: {
        value: "south",
        opposite: "north",
        corners: [3, 2],
    },
    west: {
        value: "west",
        opposite: "east",
        corners: [0, 3],
    },
}


let managedTiles = [];
let recalcTiles = [];


function setupWave() {
    for (let rows of d.tiles) {
        for (let tile of rows) {
            // find neighbors
            tile.neighbors = [];

            tile.neighbors['north'] = getTile(tile.row -1, tile.col);
            tile.neighbors['east']  = getTile(tile.row, tile.col +1);
            tile.neighbors['south'] = getTile(tile.row +1, tile.col);
            tile.neighbors['west']  = getTile(tile.row, tile.col -1);
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

            // select random of the lowest tiles
            let lowestTiles = managedTiles.filter(tile => tile.possibilities.length == lowestPossible.value);
        
            nextTile = lowestTiles[randomInt(lowestTiles.length)];
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
    
    for (const [direction, neighbor] of Object.entries(tile.neighbors)) {
        if(neighbor) {
            recalcPossibilities(direction, neighbor);
        }
    }
}

function renderTile(tile) {
    if(tile.corners) {
        tile.div.innerText = "";
        tile.div.style.background = `conic-gradient(${tileColors[tile.corners[1]]} 0deg, ${tileColors[tile.corners[1]]} 90deg, ${tileColors[tile.corners[2]]} 90deg, ${tileColors[tile.corners[2]]} 180deg, ${tileColors[tile.corners[3]]} 180deg, ${tileColors[tile.corners[3]]} 270deg, ${tileColors[tile.corners[0]]} 270deg)`
    }
    else {
        tile.div.innerText = tile.possibilities.length || "";
    }
}

function recalcPossibilities(direction, tile) {
    if(!tile) {
        return;
    }

    if(tile.corners) {
        tile.possibilities = [];
        return;
    }

    if(!managedTiles.includes(tile)) {
        managedTiles.push(tile);
    }

    // neighbor has a tile set -> can decrease possible tiles on this tile
    let neighbor = tile.neighbors[directions[direction].opposite];

    if(neighbor) {
        let hasReduced = false;

        // iterate through neighbors possibilities
        let neighborLimitations = [...neighbor.corners?[neighbor.corners]:[], ...neighbor.possibilities];

        if(neighborLimitations.length > 0) {

            // iterate through all possible tiles
            for (let i = tile.possibilities.length-1; i >= 0; i--) {
                let possibleTile = tile.possibilities[i];

                // check if they align
                let possible = false;
                
                for (let j = neighborLimitations.length-1; j >= 0; j--) {
                    let limitation = neighborLimitations[j];

                    if(limitation[directions[direction].corners[0]] ==
                            possibleTile[directions[directions[direction].opposite].corners[0]]
                        &&
                        limitation[directions[direction].corners[1]] ==
                            possibleTile[directions[directions[direction].opposite].corners[1]]
                        ) {
                        possible = true;
                    }
                }

                if(!possible) {
                    hasReduced = true;
                    tile.possibilities.splice(i, 1);
                }
            }
        }

        if(hasReduced) {
            for (const [direction, neighbor] of Object.entries(tile.neighbors)) {
                if(neighbor) {
                    recalcPossibilities(direction, neighbor);
                }
            }
        }
    }

    renderTile(tile);
}

// @author Tammie Hladilů
// 19.11.2023

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

// managed tiles are tiles waiting to be collapsed (they have calculated possibilities)
let managedTiles = [];
// tiles added in order to be replayed from the back (reset and removed in backwards order)
let replayTiles = [];


function setupWave() {
    // setup all tiles
    for (let rows of d.tiles) {
        for (let tile of rows) {
            // find neighbors in directions
            tile.neighbors = [];

            tile.neighbors['north'] = getTile(tile.row -1, tile.col);
            tile.neighbors['east']  = getTile(tile.row, tile.col +1);
            tile.neighbors['south'] = getTile(tile.row +1, tile.col);
            tile.neighbors['west']  = getTile(tile.row, tile.col -1);
        }
    }

    // choose first tile randomly
    nextTile = getTile(randomInt(config.height), randomInt(config.width));
    managedTiles.push(nextTile);
    waveStep();
}


function waveStep() {
    setTileRandom(nextTile);
}


function setTileRandom(tile) {
    // if tile is set, find next
    if(tile.possibilities.length == 0) {

        // there are (managed => any) tiles left
        if(managedTiles.length > 0) {
            // set first tile as lowest -> find lower
            let lowestPossible = {
                tile: managedTiles[0],
                value: managedTiles[0].possibilities.length == 0 ? Infinity : managedTiles[0].possibilities.length,
            }
            
            // find next tile (having lowest possibilities)
            for (const managedTile of managedTiles) {
                if(managedTile.possibilities.length < lowestPossible.value && managedTile.possibilities.length > 0) {
                    lowestPossible.value = managedTile.possibilities.length;
                    lowestPossible.tile = managedTile;
                }
            }

            // get all tiles with lowest possibilities
            let lowestTiles = managedTiles.filter(tile => tile.possibilities.length == lowestPossible.value);
        
            // select random of the lowest tiles
            nextTile = lowestTiles[randomInt(lowestTiles.length)];
            // highlight it
            nextTile.div.style.background = "rgba(200,0,0,0.6)";
        }
    }

    // weighted possibility select
    let weightTotal = tile.possibilities.reduce((val, corners) => val + corners[4], 0);
    let randomWeight = randomInt(weightTotal);
    
    // find the selected possibility of the random weight
    let selectedIndex = 0;
    while(randomWeight > 0) {
        randomWeight -= tile.possibilities[selectedIndex][4];
        if(randomWeight > 0) {
            selectedIndex++;
        }
    }

    // set the tile data
    setTile(tile, tile.possibilities[selectedIndex]);
    renderTile(tile);
        
    // remove placed tile from managed tiles (all 0-possibility tiles to be sure, lmao)
    for (let i = managedTiles.length-1; i >= 0; i--) {
        if(managedTiles[i].possibilities == 0) {
            managedTiles.splice(i, 1);
        }
    }
}


function setTile(tile, corners) {
    // set tile and lock its possibilities
    tile.corners = corners;
    tile.possibilities = [];

    // add to replay
    replayTiles.push(tile);
    
    // recalc possibilities of direct neighbors (which is then recursive)
    for (const [direction, neighbor] of Object.entries(tile.neighbors)) {
        if(neighbor) {
            recalcPossibilities(direction, neighbor);
        }
    }
}

function renderTile(tile) {
    // if tile is set
    if(tile.corners) {
        tile.div.innerText = "";
        // conic gradient in this configuration makes a 4-corner solid-color square
        tile.div.style.background = `conic-gradient(${tileColors[tile.corners[1]]} 0deg, ${tileColors[tile.corners[1]]} 90deg, ${tileColors[tile.corners[2]]} 90deg, ${tileColors[tile.corners[2]]} 180deg, ${tileColors[tile.corners[3]]} 180deg, ${tileColors[tile.corners[3]]} 270deg, ${tileColors[tile.corners[0]]} 270deg)`
    }
    // if tile is waiting to be collapsed
    else {
        tile.div.innerText = tile.possibilities.length || "";
    }
}

function recalcPossibilities(direction, tile) {
    if(!tile) {
        return;
    }

    // tile is already set
    if(tile.corners) {
        tile.possibilities = [];
        return;
    }

    // if tile isn't yet managed - start to manage it
    if(!managedTiles.includes(tile)) {
        managedTiles.push(tile);
    }

    // neighbor has a tile set -> can decrease possible tiles on this tile
    let neighbor = tile.neighbors[directions[direction].opposite];

    // neighbor exists (not over edge)
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
                
                // if corners align:
                // example - this uncollapsed tile north of another tile 
                //    -> test if some own possibility cannot align with any of the other tile
                //    -> test bottom's topLeft against top's bottomLeft & bottom's topRight against top's bottomRight
                // rotated correctly in other directions

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

                // no configuration for this possibility with given possibilities of neighbors can fit -> remove it
                if(!possible) {
                    hasReduced = true;
                    tile.possibilities.splice(i, 1);
                }
            }
        }

        // if any possibility was removed -> recursively recalc own neighbors
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
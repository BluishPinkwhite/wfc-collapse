
// @author Tammie Hladilů
// 19.11.2023


// fade
let fadeAmount = 20;
let fadeToFull = true;
let fadeTiles = [];

// replay
let replayTiles = [];

let simulationState = consts.simulationState.VISUALISING;


function applyNextChange() {
    if(simulationState == consts.simulationState.VISUALISING) {

        // remove oldest available change
        let changes = workerChanges.shift();

        if(changes) {

            // iterate through all changes of wave step
            for (let change of changes) {

                // all changes from this simulation were applied -> start replay animation
                if(change.command == consts.worker.WORKER_FINISHED) {
                    // removed a finish, a new worker should start in the background
                    workerFinishes--;
                    simulationState = consts.simulationState.REPLAYING;
                    console.log("Simulation ran to the end of change batch, starting replay...");
                }

                // tile has been set
                else if(change.command == consts.changes.TILE_SET) {
                    let tile = getTile(change.coords[1], change.coords[0]);
                    tile.corners = allTiles[change.index];
                    tile.possibilities = [];

                    fadeTiles.unshift(tile);
                    replayTiles.push(tile);

                    renderTile(tile);
                    updateFading();
                }

                // possibilities of tile have changed
                else if(change.command == consts.changes.TILE_POSSIBILITIES_REDUCED) {
                    let tile = getTile(change.coords[1], change.coords[0]);

                    // remove all tracked indexes from possibilities of tile
                    for (const index of change.removedIndexes) {
                        tile.possibilities.splice(index, 1);
                    }

                    renderTile(tile);
                }
            }
        }

        else {
            console.log("No available changes to apply, retrying next tick...");
        }
    }
}

function updateFading() {
    // iterate through all fading tiles
    // lower index = younger
    // last index = oldest
    for (let i = fadeTiles.length-1; i >= 0; i--) {
        let fadeTile = fadeTiles[i];

        // set opacity 0-1
        fadeTile.div.style.opacity = fadeToFull ? 
            1 - (fadeAmount - fadeTile.fadeIndex) / fadeAmount : 
            (fadeAmount - fadeTile.fadeIndex)/ fadeAmount;

        // increase fade
        fadeTile.fadeIndex++;

        // if amount reached, reset and remove it
        if(fadeTile.fadeIndex >= fadeAmount) {
            fadeTile.div.style.opacity = 1;

            if(!fadeToFull) {
                fadeTile.div.style.background = "";
            }

            fadeTiles.splice(i, 1);
        }
    }
}

function renderTile(tile) {
    // if tile is set
    if(tile.corners) {
        tile.div.renderChance = false;
        // conic gradient in this configuration makes a 4-corner solid-color square
        tile.div.style.background = `conic-gradient(${tileColors[tile.corners[1]]} 0deg, ${tileColors[tile.corners[1]]} 90deg, ${tileColors[tile.corners[2]]} 90deg, ${tileColors[tile.corners[2]]} 180deg, ${tileColors[tile.corners[3]]} 180deg, ${tileColors[tile.corners[3]]} 270deg, ${tileColors[tile.corners[0]]} 270deg)`
    }
    // if tile is waiting to be collapsed
    else {
        tile.div.renderChance = tile.possibilities.length > 0;
    }

    if (tile.div.renderChance) {
        tile.div.style.background = interpolateColor(config.chanceColor, config.backgroundColor, tile.possibilities.length / totalTileAmount * .75);
    }
}
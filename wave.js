
// @author Tammie Hladilů
// 19.11.2023


// fade
let fadeAmount = 15;
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
                else {
                    let tile = getTile(change.coords[1], change.coords[0]);

                    // when canvas size was changed at runtime -> speed through invalid instructions
                    if(!tile) {
                        applyNextChange();
                        return;
                    }

                    if(change.command == consts.changes.TILE_SET) {
                        // set data of tile
                        tile.corners = tileSet.tiles[change.index].corners;
                        tile.absoluteIndex = change.index;
                        tile.possibilities = 0;

                        fadeTiles.unshift(tile);
                        replayTiles.push(tile);

                        renderTile(tile);
                        updateFading();
                    }

                    // possibilities of tile have changed
                    else if(change.command == consts.changes.TILE_POSSIBILITIES_REDUCED) {
                        // remove all tracked indexes from possibilities of tile
                        tile.possibilities -= change.removedIndexes;

                        renderTile(tile);
                    }
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

        // better fading -> set td chance color so div color jump is invisible
        fadeTile.div.parentElement.style.backgroundColor = !fadeToFull ? config.backgroundColor : config.chanceColor;

        // increase fade
        fadeTile.fadeIndex++;

        // if amount reached, reset and remove it
        if(fadeTile.fadeIndex >= fadeAmount) {
            fadeTile.div.style.opacity = 1;

            if(!fadeToFull) {
                fadeTile.div.style.background = "";
                fadeTile.div.parentElement.style.background = "";
            }

            fadeTiles.splice(i, 1);
        }
    }
}



// used in renderTile
const cornerToGradientPosition = [
    'top left',
    'top right',
    'bottom right',
    'bottom left',
]


function renderTile(tile) {
    // if tile is set
    if(tile.corners) {
        tile.div.renderChance = false;

        // apply rendering strategy
        let tileData = tileSet.tiles[tile.absoluteIndex];
        let renderingOffset = tileData.renderingOffset;
        
        tile.div.style.background = renderMethods[tileData.render](tile, renderingOffset);

    }
    // if tile is waiting to be collapsed
    else {
        tile.div.renderChance = tile.possibilities > 0;
    }

    if (tile.div.renderChance) {
        tile.div.style.background = interpolateColor(config.chanceColor, config.backgroundColor, tile.possibilities / tileSet.totalTileAmount * .75);
    }
}


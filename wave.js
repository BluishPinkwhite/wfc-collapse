
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
                        tile.corners = allTiles[change.index].corners;
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
        let renderingStrategy = allTiles[tile.absoluteIndex].renderingStrategy;
        let renderingOffset = allTiles[tile.absoluteIndex].renderingOffset;
        
        // full color tile
        if(renderingStrategy == consts.renderingStrategy.FULL_COLOR) {
            tile.div.style.background = color(tile, 0);
        }
        // half color tile (split in half)
        else if(renderingStrategy == consts.renderingStrategy.HALF_COLOR) {
            tile.div.style.background = `
            linear-gradient(${renderingOffset == 0 ? 0 : 270}deg,
                ${color(tile, 2)} 50%,
                ${color(tile, 0)} 50%
            )`;
        }
        // one corner tile
        else if(renderingStrategy == consts.renderingStrategy.ONE_CORNER) {
            tile.div.style.background = `
            radial-gradient(
                circle at ${cornerToGradientPosition[renderingOffset]}, 
                    ${color(tile, renderingOffset)} 0%, 
                    ${color(tile, renderingOffset)} 35%, 
                    ${color(tile, (renderingOffset+2) % 4)} 35%
            )`;
        }
        // diagonal tiles
        else if(renderingStrategy == consts.renderingStrategy.DIAGONALS) {
            tile.div.style.background = `
            radial-gradient(
                circle at ${cornerToGradientPosition[renderingOffset]}, 
                    ${color(tile, renderingOffset)} 0%, 
                    ${color(tile, renderingOffset)} 35%, 
                    transparent 35%
            ),
            radial-gradient(
                circle at ${cornerToGradientPosition[renderingOffset+2]}, 
                    ${color(tile, renderingOffset+2)} 0%, 
                    ${color(tile, renderingOffset+2)} 35%, 
                    transparent 35%
            ),
            linear-gradient(${color(tile, renderingOffset+1)} 0%, ${color(tile, renderingOffset+1)} 0%)`;
        }
        else {
            tile.div.style.background = `
            conic-gradient(
                ${color(tile, 1)} 0deg, 
                ${color(tile, 1)} 90deg, 
                ${color(tile, 2)} 90deg, 
                ${color(tile, 2)} 180deg, 
                ${color(tile, 3)} 180deg, 
                ${color(tile, 3)} 270deg, 
                ${color(tile, 0)} 270deg
            )`;
        }
    }
    // if tile is waiting to be collapsed
    else {
        tile.div.renderChance = tile.possibilities > 0;
    }

    if (tile.div.renderChance) {
        tile.div.style.background = interpolateColor(config.chanceColor, config.backgroundColor, tile.possibilities / totalTileAmount * .75);
    }
}

function color(tile, cornerIndex) {
    return tileColors[indexMap[tile.corners[cornerIndex]]];
}
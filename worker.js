

// @author Tammie Hladilů
// 26.11.2023


function workerCode() {

    let consts = {};
    let config = {};
    let allTiles = [];

    onmessage = function(ev) {
        ev = ev.data;
        // console.log("Worker received message: " + ev.command);

        consts = ev.consts;
        config = ev.config;
        allTiles = ev.allTiles;

        setupWorkerTileData();
        setupWave();
    }


    let nextTile;

    let directions = {
        0: { // north
            value: 0,
            opposite: 2,
            corners: [0, 1],
        },
        1: { // east
            value: 1,
            opposite: 3,
            corners: [1, 2],
        },
        2: { // south
            value: 2,
            opposite: 0,
            corners: [3, 2],
        },
        3: { // west
            value: 3,
            opposite: 1,
            corners: [0, 3],
        },
    }



    // managed tiles are tiles waiting to be collapsed (they have calculated possibilities)
    let managedTiles = [];
    // tiles added in order to be replayed from the back (reset and removed in backwards order)
    let replayTiles = [];
    // recording of changes each wave step
    let changes = [];

    let statistics = {
        totalSteps: 0,
        totalPossibilityRecalculations: 0,
        skippedNeighbors: 0,
        limitationChecks: 0,
        startTime: new Date().getTime(),
        endTime: -1,
        totalTime: -1,
    };

    let workerTiles = [];



    function setupWorkerTileData() {
        // add virtual child nodes to "table"
        for(row = 0; row < config.height; row++) {
            workerTiles.push([]);

            for(col = 0; col < config.width; col++) {
                // data for each tile
                workerTiles[row].push({
                    row: row,
                    col: col,

                    possibilities: [...allTiles],
                    corners: undefined,
                });
            }
        }
    }



    function setupWave() {
        // setup all tiles
        for (let rows of workerTiles) {
            for (let tile of rows) {
                // find neighbors in directions
                tile.neighbors = [];

                tile.neighbors[0] = getTile(tile.row -1, tile.col, workerTiles); // north
                tile.neighbors[1] = getTile(tile.row, tile.col +1, workerTiles); // east
                tile.neighbors[2] = getTile(tile.row +1, tile.col, workerTiles); // south
                tile.neighbors[3] = getTile(tile.row, tile.col -1, workerTiles); // west
            }
        }

        // choose first tile randomly
        nextTile = getTile(randomInt(config.height), randomInt(config.width), workerTiles);
        managedTiles.push(nextTile);


        // main simulation loop for worker
        while(managedTiles.length > 0) {
            waveStep();
        }

        // when done, inform main thread
        postMessage({
            command: consts.worker.WORKER_FINISHED,
            statistics: statistics
        });

        statistics.endTime = new Date().getTime();
        statistics.totalTime = (statistics.endTime - statistics.startTime) /1000;
        console.log(`   Worker took ${statistics.totalTime}s`);

        // stop worker
        close();
    }



    function waveStep() {
        changes = [];
        setTileRandom(nextTile);
        
        statistics.totalSteps++;

        // return this step's data to main thread
        if(changes.length > 0)
        postMessage({
            command: consts.worker.STEP_COMPLETE,
            changes: changes
        });
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
        setTile(tile, tile.possibilities[selectedIndex], selectedIndex);
            
        // remove placed tile from managed tiles (all 0-possibility tiles to be sure, lmao)
        for (let i = managedTiles.length-1; i >= 0; i--) {
            if(managedTiles[i].possibilities == 0) {
                managedTiles.splice(i, 1);
            }
        }
    }


    function setTile(tile, corners, index) {
        // set tile and lock its possibilities
        tile.corners = corners;
        tile.possibilities = [];

        // add new change - tile at coords has been set to corners
        if(corners)
        changes.push({
            command: consts.changes.TILE_SET,
            coords: [tile.col, tile.row],
            index: index
        });

        // add to replay
        replayTiles.push(tile);
        
        // recalc possibilities of direct neighbors (which is then recursive)
        for (const [direction, neighbor] of Object.entries(tile.neighbors)) {
            if(neighbor) {
                recalcPossibilities(direction, neighbor);
            }
        }
    }


    function recalcPossibilities(direction, tile) {
        if(!tile) {
            return;
        }

        // tile is already set
        if(tile.corners) {
            return;
        }
        
        statistics.totalPossibilityRecalculations++;

        // if tile isn't yet managed - start to manage it
        if(!managedTiles.includes(tile)) {
            managedTiles.push(tile);
        }

        // neighbor has a tile set -> can decrease possible tiles on this tile
        let neighbor = tile.neighbors[directions[direction].opposite];

        // tracks all possibility indexes which got removed
        let changeReductionIndexes = [];

        // neighbor exists (not over edge)
        if(neighbor) {
            let hasReduced = false;
            
            // there are non-zero and non-full possibilities - both cannot affect the result
            if(neighbor.possibilities.length != allTiles.length -1) {

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
                            
                            statistics.limitationChecks++;

                            if(limitation[directions[direction].corners[0]] ==
                                    possibleTile[directions[directions[direction].opposite].corners[0]]
                                &&
                                limitation[directions[direction].corners[1]] ==
                                    possibleTile[directions[directions[direction].opposite].corners[1]]
                                ) {
                                possible = true;
                                break;
                            }
                        }

                        // no configuration for this possibility with given possibilities of neighbors can fit -> remove it
                        if(!possible) {
                            hasReduced = true;
                            tile.possibilities.splice(i, 1);

                            // track change - possibility index removed
                            changeReductionIndexes.push(i);
                        }
                    }
                }
            }
            else {
                statistics.skippedNeighbors++;
            }

            // if any possibility was removed -> recursively recalc own neighbors
            if(hasReduced) {
                // add change - tile had reduced possibilities
                changes.push({
                    command: consts.changes.TILE_POSSIBILITIES_REDUCED,
                    coords: [tile.col, tile.row],
                    removedIndexes: changeReductionIndexes
                });

                for (const [direction, neighbor] of Object.entries(tile.neighbors)) {
                    if(neighbor) {
                        recalcPossibilities(direction, neighbor);
                    }
                }
            }
        }
    }

    
    function getTile(row, col, list) {
        // return tile on coords [row, col] or undefined
        if(list[row]) {
            if(list[row][col]) {
                return list[row][col];
            }
        }
        return undefined;
    }

    function randomInt(max) {
        return Math.floor(Math.random() * max);
    }
}
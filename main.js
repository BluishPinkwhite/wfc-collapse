
// @author Tammie Hladilů
// 19.11.2023


var consts = {
    worker: {
        START: 100,
        STEP_COMPLETE: 101,
        WORKER_FINISHED: 102,
        FORCE_STOP: 103,
    },
    changes: {
        TILE_SET: 200,
        TILE_POSSIBILITIES_REDUCED: 201,
        FINISHED: 202,
    },
    simulationState: {
        VISUALISING: 300,
        REPLAYING: 301,
    },
    renderingStrategy: {
        FULL_COLOR: 400,
        HALF_COLOR: 401,
        ONE_CORNER: 402,
        DIAGONALS: 403,
    }
}



var calculations = [0,0,0,0,0,0,0];

var config = {
    height: 30,
    width: 54,

    backgroundColor: 'rgb(127,255,212)',
    chanceColor: 'rgb(222,184,135)',

    speed: 1000./35,
    countdownMax: 100,

    repeats: 1,
}


// config = {
//     ...config,

//     speed: 1,
//     countdownMax: 5,

//     // height: 15,
//     // width: 20,

//     repeats: 5,

//     waitForClick: true,
// }


// simulation data holder
var d;

var state = "running";
var countdown = 0;
let interval;

// let statisticsInterval = setInterval(() => {
//     var f = (index) => {
//         return (calculations[index]).toLocaleString('en-US')
//     }

//     console.log(`a sec: (steps: ${f(0)}, renders: ${f(1)}, possibilities: [${f(2)} - ${f(4)}]),\n limitations: ${f(3)} <= (${f(5)} - ${f(6)})\nscore: ${Math.floor(calculations[3]/calculations[2])}`);
//     calculations = [0,0,0,0,0,0,0];
// }, 1000);


function start() {
    resetHTML();
    setupHTML();

    // stop all workers and delete their previous data
    for (const worker of activeWorkers) {
        worker.postMessage({
            command: consts.worker.FORCE_STOP
        });
    }
    workerChanges = [];
    workerFinishes = 0;

    if(!newWorkerWaiting) {
        startWorker();
    }

    restartInterval();
}

function setupHTML() {
    let table = getTable();
    
    // add child nodes to table
    for(row = 0; row < config.height; row++) {
        let tr = document.createElement("tr");
        d.tiles.push([]);

        for(col = 0; col < config.width; col++) {
            let td = document.createElement("td");
            let div = document.createElement("div");

            // set id for look up
            div.id = (row+" "+col);

            // set size - square and to fit height of screen
            let val = 100./config.height;
            div.style.width = val+"vh"; //"calc("+val+"vh - 0.8px)"; // border is 0.8px wide
            div.style.height = div.style.width;

            // getTable().style.height = "calc(100% - " + val + "vh)"; // make table smaller by one row in size

            td.appendChild(div);
            tr.appendChild(td);

            // data for each tile
            d.tiles[row].push({
                div: div,
                row: row,
                col: col,

                fadeIndex: 0,

                possibilities: totalTileAmount,
                corners: undefined,
            });
        }

        table.appendChild(tr);
    }
}

function resetHTML() {
    let table = getTable();
    d = {
        tiles: []
    }
    
    // remove all previous children
    while(table.lastChild) {
        table.removeChild(table.lastChild);
    }

    managedTiles = [];
    fadeTiles = [];
}

function restartInterval() {
    if(interval) {
        clearInterval(interval);
    }
    startInterval();
}



function startInterval() {

    // main simulation loop
    interval = setInterval(() => {

        for (let i = 0; i < config.repeats; i++) {
            // simulation is generating
            if(state == "running") {
                if(simulationState == consts.simulationState.REPLAYING) {
                    state = "waiting";
                    countdown = config.countdownMax;
                }
                else {
                    applyNextChange();
                }
            }

            // done generating, waiting for replay
            else if(state == "waiting") {
                if(countdown > 0) {
                    countdown--;
                    updateFading();
                }
                else {
                    if(!config.waitForClick) {
                        state = "replaying";
                        fadeTiles = [];
                        fadeToFull = false;
                    }
                    else {
                        updateFading();
                    }
                }
            }

            // replaying - removing from last
            else if(state == "replaying") {
                if(replayTiles.length > 0) {
                    let fadeTile = replayTiles.pop();
                    fadeTiles.unshift(fadeTile);

                    fadeTile.fadeIndex = 0;

                    updateFading();
                }
                else {
                    replayTiles = [];
                    state = "resetting";
                }
            }

            // start waiting to start again
            else if(state == "resetting") {
                state = "cooldown";
                countdown = config.countdownMax;
            }

            // wait to reset and start over
            else if(state == "cooldown") {
                if(countdown > 0) {
                    countdown--;

                    updateFading();
                }
                else {
                    fadeToFull = true;
                    
                    simulationState = consts.simulationState.VISUALISING;

                    managedTiles = [];
                    resetHTML();
                    setupHTML();

                    state = "running";
                }
            }
        }
    }, config.speed);
}


function resumePlay() {
    if(config.waitForClick) {
        setTimeout(() => {
            config.waitForClick = true;
        }, config.speed * 3 + 10);
        
        config.waitForClick = false;
    }
}

function getTable() {
    return document.getElementById("main");
}

function getNode(row, col) {
    return document.getElementById(row+" "+col)
}

function getTile(row, col, list=d.tiles) {
    // return tile on coords [row, col] or undefined
    if(list[row]) {
        if(list[row][col]) {
            return list[row][col];
        }
    }
    return undefined;
}



// extract numeric r, g, b values from `rgb(nn, nn, nn)` string
function getRgb(color) {
    let [r, g, b] = color.replace('rgb(', '')
        .replace(')', '')
        .split(',')
        .map(str => Number(str));
    return {
        r, g, b
    }
}

function interpolateColor(colorA, colorB, intval) {
    const   rgbA = getRgb(colorA),
            rgbB = getRgb(colorB);
    const colorVal = (prop) =>
        Math.round(rgbA[prop] * (1 - intval) + rgbB[prop] * intval);
    return `rgb(${colorVal('r')},${colorVal('g')},${colorVal('b')})`;
}
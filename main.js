
// @author Tammie Hladilů
// 19.11.2023


var config = {
    height: 17,
    width: 31,
}

// simulation data holder
var d;

var state = "running";
var countdown = 0;
var speed = 35;


function start() {
    resetHTML();
    setupHTML();
    setupWave();

    // main simulation loop
    setInterval(() => {
        // simulation is generating
        if(state == "running") {
            if(managedTiles.length == 0) {
                state = "waiting";
                countdown = 100;
            }
            else {
                waveStep();
            }
        }

        // done generating, waiting for replay
        else if(state == "waiting") {
            if(countdown > 0) {
                countdown--;
            }
            else {
                state = "replaying";
            }
        }

        // replaying - removing from last
        else if(state == "replaying") {
            if(replayTiles.length > 0) {
                replayTiles.pop().div.style.background = "";
            }
            else {
                state = "resetting";
            }
        }

        // start waiting to start again
        else if(state == "resetting") {
            state = "cooldown";
            countdown = 100;
        }

        // wait to reset and start over
        else if(state == "cooldown") {
            if(countdown > 0) {
                countdown--;
            }
            else {
                resetHTML();
                setupHTML();
                setupWave();
                state = "running";
            }
        }
    }, speed);
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
            div.style.width = "calc("+val+"vh - 1px)";
            div.style.height = div.style.width;

            td.appendChild(div);
            tr.appendChild(td);

            // data for each tile
            d.tiles[row].push({
                div: div,
                row: row,
                col: col,

                possibilities: [...allTiles],
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
}

function getTable() {
    return document.getElementById("main");
}

function getNode(row, col) {
    return document.getElementById(row+" "+col)
}

function getTile(row, col) {
    // return tile on coords [row, col] or undefined
    if(d.tiles[row]) {
        if(d.tiles[row][col]) {
            return d.tiles[row][col];
        }
    }
    return undefined;
}

function randomInt(max) {
    return Math.floor(Math.random() * max);
}
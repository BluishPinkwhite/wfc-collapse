
// @author Tammie Hladilů
// 19.11.2023


var config = {
    height: 16,
    width: 31,
}

// simulation data holder
var d;

var state = "running";
var countdown = 0;
var speed = 45;


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
                updateFading();
            }
            else {
                state = "replaying";
                fadeTiles = [];
                fadeToFull = false;
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

                updateFading();
            }
            else {
                fadeToFull = true;

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

                fadeIndex: 0,

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


function interpolateColor(color1, color2, percent) {
    // Convert the hex colors to RGB values
    const r1 = parseInt(color1.substring(1, 3), 16);
    const g1 = parseInt(color1.substring(3, 5), 16);
    const b1 = parseInt(color1.substring(5, 7), 16);
  
    const r2 = parseInt(color2.substring(1, 3), 16);
    const g2 = parseInt(color2.substring(3, 5), 16);
    const b2 = parseInt(color2.substring(5, 7), 16);
  
    // Interpolate the RGB values
    const r = Math.round(r1 + (r2 - r1) * percent);
    const g = Math.round(g1 + (g2 - g1) * percent);
    const b = Math.round(b1 + (b2 - b1) * percent);
  
    // Convert the interpolated RGB values back to a hex color
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }



var config = {
    height: 14,
    width: 25,
}

var d;


function start() {
    resetHTML();
    setupHTML();
    setupWave();

    setInterval(() => {
        if(managedTiles.length <= 1) {
            resetHTML();
            setupHTML();
            setupWave();
        }
        else {
            waveStep();
        }
    }, 25);
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

            div.id = (row+" "+col);

            let val = 100./config.height;
            div.style.width = "calc("+val+"vh - 1px)";
            div.style.height = div.style.width;

            td.appendChild(div);
            tr.appendChild(td);

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
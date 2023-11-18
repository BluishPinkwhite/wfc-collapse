

let size = 14;

var config = {
    height: size,
    width: size * 2 + 3,
}

var d;


function start() {
    resetHTML();
    setupHTML();
    setupWave();
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
            let img = document.createElement("img");

            div.id = (row+" "+col);

            let val = 100./config.height;
            img.style.width = val+"vh";
            img.style.height = val+"vh";
            // img.style.paddingBottom = "calc(" + val + "vh - "+val+"px)";

            div.appendChild(img);
            td.appendChild(div);
            tr.appendChild(td);

            d.tiles[row].push({
                div: div,
                row: row,
                col: col,

                posibilities: totalTileAmount,
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
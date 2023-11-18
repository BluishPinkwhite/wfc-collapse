

let size = 14;

var config = {
    height: size,
    width: size * 2 + 3,
}


function setupHTML() {
    let table = getTable();
    
    // add child nodes to table
    for(row = 0; row < config.height; row++) {
        let tr = document.createElement("tr");

        for(col = 0; col < config.width; col++) {
            let td = document.createElement("td");
            let val = 100./config.height;
            td.style.width = val+"vh";
            // td.style.maxHeight = td.style.width;
            td.style.paddingBottom = "calc(" + val + "vh - "+val+"px)";

            let div = document.createElement("div");
            div.id = (row+" "+col);
            div.innerText = div.id;

            td.appendChild(div);
            tr.appendChild(td);
        }

        table.appendChild(tr);
    }
}

function resetHTML() {
    let table = getTable();
    
    // remove all previous children
    while(table.children) {
        table.removeChild(table.lastChild);
    }
}

function getTable() {
    return document.getElementById("main");
}

function getNode(row, col) {
    return document.getElementById(row+" "+col)
}
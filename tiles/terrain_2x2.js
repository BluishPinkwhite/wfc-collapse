
// @author Tammie Hladilů
// 19.11.2023


// data: TopLeft, TopRight, BottomRight, BottomLeft, Weight


// BEHAVIOR from setup:
// grass - full generation within water and forest
// water - full generation within grass
// forest - full generation within grass
// field - no 3/1 corners - rectangles of any size
// flower - only 1/3 corners - only 4-inside-corner squares
// rock - only diagonal and 1/3 corner - same as flower but repeating on itself
// path - no full - tree branch structure


// 4 -> [0,0,0,0]
const fulls = [
    [4500, full,
        'grass', 'grass',
        'grass', 'grass'],
    [600, full,
        'forest', 'forest', 
        'forest', 'forest'],
    [450, full,
        'field', 'field', 
        'field', 'field'],
    [650, full,
        'water', 'water', 
        'water', 'water'],
]


// 2x2 -> [0,0,1,1]
const halves = [
    ...dupe([250, half,
        'water', 'water', 
        'grass', 'grass']),
    ...dupe([120, half,
        'forest', 'forest', 
        'grass', 'grass']),
    ...dupe([250, half,
        'field', 'field', 
        'grass', 'grass']),
    ...dupe([300, half,
        'path', 'path', 
        'grass', 'grass']),
]


// 1x3 -> [0,0,0,1]
const corners = [
    ...dupe([180, corner,
        'water', 'water', 
        'water', 'grass']),
    ...dupe([140, corner,
        'water', 'grass', 
        'grass', 'grass']),

    ...dupe([120, corner,
        'forest', 'forest', 
        'forest', 'grass']),
    ...dupe([120, corner,
        'forest', 'forest', 
        'forest', 'flower']),
    ...dupe([220, corner,
        'forest', 'grass', 
        'grass', 'grass']),

    ...dupe([120, corner,
        'path', 'grass', 
        'grass', 'grass']),
    ...dupe([110, corner,
        'path', 'path', 
        'path', 'grass']),
    
    ...dupe([130, corner,
        'field', 'grass', 
        'grass', 'grass']),

    ...dupe([160, corner,
        'rock', 'grass', 
        'grass', 'grass']),
    ...dupe([250, corner,
        'flower', 'grass', 
        'grass', 'grass']),
    
    ...dupe([70, corner,
        'water', 'water', 
        'water', 'dark_water']),

    ...dupe([40, corner,
        'field', 'field', 
        'field', 'dark_field']),
]


// 1x2x1 -> [0,1,2,1]
const diagonals = [
    ...dupe([45, diagonal,
        'forest', 'grass', 
        'rock', 'grass']),
    ...dupe([45, diagonal,
        'forest', 'grass', 
        'water', 'grass']),
]


/////////////////////////

const tileColors = {
    grass: "#22DA44",
    water: "#12ABEB",
    dark_water: "#0188DE",
    rock: "#ABAABA",
    flower: "#DE6554",
    forest: "#239932",
    field: "#DEED44",
    dark_field: "#FF9812",
    path: "#BB9865",
}



///////////////////////// RENDERING METHODS

function full(tile, renderingOffset) {
    return color(tile, 0);
}

function half(tile, renderingOffset) {
    return `
    linear-gradient(${renderingOffset == 0 ? 0 : 270}deg,
        ${color(tile, 2)} 50%,
        ${color(tile, 0)} 50%
    )`;
}

function corner(tile, renderingOffset) {
    return `
    radial-gradient(
        circle at ${cornerToGradientPosition[renderingOffset]}, 
            ${color(tile, renderingOffset)} 0%, 
            ${color(tile, renderingOffset)} 35%, 
            ${color(tile, (renderingOffset+2) % 4)} 35%
    )`;
}

function diagonal(tile, renderingOffset) {
    return `
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


///////////////////////// PROCESSING

function getRenderingOffsets() {
    
    for (let i = 0; i < tileSet.tiles.length; i++) {
        let tileData = tileSet.tiles[i];

        if(tileData.render == renderMap[full.name]) {
            // nothing
        }


        else if(tileData.render == renderMap[half.name]) {
            // decide whether it is horizontal or vertical
            if (tileData.corners[0] == tileData.corners[1]) {
                tileData.renderingOffset = 0; // horizontal
            }
            else {
                tileData.renderingOffset = 1; // vertical
            }
        }


        else if(tileData.render == renderMap[corner.name]) {
            // find index of other-type corner
            let firstType = {type: tileData.corners[0], amount: 1};
            let otherType = {type: tileData.corners[1], index: 1};
            
            for (let i = 1; i < tileData.corners.length; i++) {
                const corner = tileData.corners[i];
                
                // single corner chosen at first
                if(corner == firstType.type) {
                    firstType.amount++;
                }
                // other corner is chosen
                else {
                    otherType.type = corner;
                    otherType.index = i;
                }
            }

            if(firstType.amount == 1) {
                tileData.renderingOffset = 0;
            }
            else {
                tileData.renderingOffset = otherType.index;
            }
        }


        else if(tileData.render == renderMap[diagonal.name]) {
            // match non-rounded corners
            if(tileData.corners[0] == tileData.corners[2]) {
                tileData.renderingOffset = 1;
            }
            else {
                tileData.renderingOffset = 0;
            }
        }
    }
}

///////////////////////// INITIALISATION

tileSet = new TileSet(
    2, 
    [...fulls, ...halves, ...corners, ...diagonals], 
    tileColors);

tileSet.process(getRenderingOffsets);

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
    ['grass', 'grass', 'grass', 'grass', 4500],
    ['forest', 'forest', 'forest', 'forest', 600],
    ['field', 'field', 'field', 'field', 450],
    ['water', 'water', 'water', 'water', 650],
]


// 2x2 -> [0,0,1,1]
const halves = [
    ...dupe(['water', 'water', 'grass', 'grass', 250]),
    ...dupe(['forest', 'forest', 'grass', 'grass', 120]),
    ...dupe(['field', 'field', 'grass', 'grass', 250]),
    ...dupe(['path', 'path', 'grass', 'grass', 300]),
]


// 1x3 -> [0,0,0,1]
const corners = [
    ...dupe(['water', 'water', 'water', 'grass', 180]),
    ...dupe(['water', 'grass', 'grass', 'grass', 140]),

    ...dupe(['forest', 'forest', 'forest', 'grass', 120]),
    ...dupe(['forest', 'forest', 'forest', 'flower', 120]),
    ...dupe(['forest', 'grass', 'grass', 'grass', 220]),

    ...dupe(['path', 'grass', 'grass', 'grass', 120]),
    ...dupe(['path', 'path', 'path', 'grass', 110]),
    
    ...dupe(['field', 'grass', 'grass', 'grass', 130]),

    ...dupe(['rock', 'grass', 'grass', 'grass', 160]),
    ...dupe(['flower', 'grass', 'grass', 'grass', 250]),
    
    ...dupe(['water', 'water', 'water', 'dark_water', 70]),

    ...dupe(['field', 'field', 'field', 'dark_field', 40]),
]


// 1x2x1 -> [0,1,2,1]
const diagonals = [
    // ...dupe(['rock', 'grass', 'water', 'grass', 30]),
    ...dupe(['forest', 'grass', 'rock', 'grass', 45]),
    ...dupe(['forest', 'grass', 'water', 'grass', 45]),
]


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


///////////////////////


let allTiles = [
    ...corners,
    ...halves,
    ...fulls,
    ...diagonals,
];
const totalTileAmount = allTiles.length;



// adds rotated tiles
function dupe(c) {
    return [
        [c[0], c[1], c[2], c[3], c[4]],
        [c[1], c[2], c[3], c[0], c[4]],
        [c[2], c[3], c[0], c[1], c[4]],
        [c[3], c[0], c[1], c[2], c[4]]
    ]
}


const totalWeights = allTiles.reduce((val, corners) => val + corners[4], 0);


// index tiles -> store their absolute 'allTiles' index in them
// refactor tileData to objects
let currIndex = 0;
let indexMap = [];
let tileTypeIndex = 0;

for (let i = 0; i < allTiles.length; i++) {
    let tileData = allTiles.shift();

    // get original array it came from
    if (fulls.includes(tileData)) {
        arrayName = 'fulls';
    }
    else if (halves.includes(tileData)) {
        arrayName = 'halves';
    }
    else if (corners.includes(tileData)) {
        arrayName = 'corners';
    }
    else if (diagonals.includes(tileData)) {
        arrayName = 'diagonals';
    }


    // refactor data to object
    tileData = {
        corners: [tileData[0], tileData[1], tileData[2], tileData[3]],
        weight: tileData[4],
        absoluteIndex: currIndex
    };
    currIndex++;

    // replace corners with indexes
    for (let cornerIndex = 0; cornerIndex < 4; cornerIndex++) {
        const corner = tileData.corners[cornerIndex];
        
        if(!indexMap[corner]) {
            indexMap[corner] = tileTypeIndex;
            indexMap[tileTypeIndex] = corner;
            tileTypeIndex++;
        }

        tileData.corners[cornerIndex] = indexMap[corner];
    }

    // get rendering strategy
    if(arrayName == 'fulls') {
        tileData.renderingStrategy = consts.renderingStrategy.FULL_COLOR;
    }
    else if(arrayName == 'halves') {
        tileData.renderingStrategy = consts.renderingStrategy.HALF_COLOR;

        // decide whether it is horizontal or vertical
        if (tileData.corners[0] == tileData.corners[1]) {
            tileData.renderingOffset = 0; // horizontal
        }
        else {
            tileData.renderingOffset = 1; // vertical
        }
    }
    // 1x3 corners
    else if(arrayName == 'corners') {
        tileData.renderingStrategy = consts.renderingStrategy.ONE_CORNER;

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
    // 1x2x1 diagonals
    else if(arrayName == 'diagonals') {
        tileData.renderingStrategy = consts.renderingStrategy.DIAGONALS;

        if(tileData.corners[0] == tileData.corners[2]) {
            tileData.renderingOffset = 1;
        }
        else {
            tileData.renderingOffset = 0;
        }
    }

    allTiles.push(tileData);
}


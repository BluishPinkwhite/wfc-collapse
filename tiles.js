
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


const fulls = [
    ['grass', 'grass', 'grass', 'grass', 1800],
    ['forest', 'forest', 'forest', 'forest', 600],
    ['field', 'field', 'field', 'field', 450],
    ['water', 'water', 'water', 'water', 650],
]
const fullsAmount = Object.keys(fulls).length;


const halves = [
    ...dupe(['water', 'water', 'grass', 'grass', 250]),
    ...dupe(['forest', 'forest', 'grass', 'grass', 250]),
    ...dupe(['field', 'field', 'grass', 'grass', 250]),
    ...dupe(['path', 'path', 'grass', 'grass', 300]),
]
const halvesAmount = halves.length;


const corners = [
    ...dupe(['water', 'water', 'water', 'grass', 180]),
    ...dupe(['water', 'grass', 'grass', 'grass', 140]),

    ...dupe(['forest', 'forest', 'forest', 'grass', 220]),
    ...dupe(['forest', 'grass', 'grass', 'grass', 220]),

    ...dupe(['path', 'grass', 'grass', 'grass', 120]),
    ...dupe(['path', 'path', 'path', 'grass', 110]),
    
    ...dupe(['field', 'grass', 'grass', 'grass', 130]),

    ...dupe(['rock', 'grass', 'grass', 'grass', 160]),
    ...dupe(['flower', 'grass', 'grass', 'grass', 250]),
]
const cornersAmount = corners.length;


const diagonals = [
    ...dupe(['rock', 'grass', 'water', 'grass', 30]),
    ...dupe(['forest', 'grass', 'rock', 'grass', 45]),
    ...dupe(['forest', 'grass', 'water', 'grass', 45]),
]
const diagonalsAmount = diagonals.length;



const totalTileAmount = fullsAmount + halvesAmount + cornersAmount + diagonalsAmount;

const allTiles = [
    ...corners,
    ...halves,
    ...fulls,
    ...diagonals
];


const tileColors = {
    grass: "#22DA44",
    water: "#12ABEB",
    rock: "#ABAABA",
    flower: "#DE6554",
    forest: "#239932",
    field: "#DEED44",
    path: "#BB9865",
}



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

// first - main
// second - secondary
// last - specifier

// grass - full generation within water and forest
// water - full generation withing grass
// forest - full generation withing grass
// field - no 3/1 corners - rectangles of any size
// flower - only 1/3 corners - only 4-inside-corner squares
// rock - only diagonal and 1/3 corner - same as flower but repeating


const fulls = [
    ['grass', 'grass', 'grass', 'grass'],
    ['forest', 'forest', 'forest', 'forest'],
    ['field', 'field', 'field', 'field'],
    ['water', 'water', 'water', 'water'],
]
const fullsAmount = Object.keys(fulls).length;


const halves = [
    ...dupe(['water', 'water', 'grass', 'grass']),
    ...dupe(['forest', 'forest', 'grass', 'grass']),
    ...dupe(['field', 'field', 'grass', 'grass']),
    ...dupe(['rock', 'grass', 'rock', 'grass']),
]
const halvesAmount = halves.length;


const corners = [
    ...dupe(['water', 'water', 'water', 'grass']),
    ...dupe(['water', 'grass', 'grass', 'grass']),

    ...dupe(['forest', 'forest', 'forest', 'grass']),
    ...dupe(['forest', 'grass', 'grass', 'grass']),
    
    ...dupe(['field', 'grass', 'grass', 'grass']),

    ...dupe(['rock', 'grass', 'grass', 'grass']),
    ...dupe(['flower', 'grass', 'grass', 'grass']),
]
const cornersAmount = corners.length;

const totalTileAmount = fullsAmount + halvesAmount + cornersAmount;

const allTiles = [
    ...corners,
    ...halves,
    ...fulls
];


const tileColors = {
    grass: "#22DA44",
    water: "#12ABEB",
    rock: "#ABAABA",
    flower: "#DE6554",
    forest: "#239932",
    field: "#DEED44",
}



function dupe(c) {
    return [
        [c[0], c[1], c[2], c[3]],
        [c[1], c[2], c[3], c[0]],
        [c[2], c[3], c[0], c[1]],
        [c[3], c[0], c[1], c[2]]
    ]
}
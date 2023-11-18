
// first - main
// second - secondary
// last - specifier


const fulls = [
    ['grass', 'grass', 'grass', 'grass'],
    ['water', 'water', 'water', 'water'],
]
const fullsAmount = Object.keys(fulls).length;


const halves = [
    ...dupe(['water', 'water', 'grass', 'grass']),
]
const halvesAmount = halves.length;


const tiles = [
    ...dupe(['water', 'water', 'water', 'grass']),
    ...dupe(['water', 'grass', 'grass', 'grass']),
]
const tilesAmount = tiles.length;

const totalTileAmount = fullsAmount + halvesAmount + tilesAmount;

const allTiles = [
    ...tiles,
    ...halves,
    ...fulls
];


const tileColors = {
    grass: "#22DA44",
    water: "#1223AD",
}



function dupe(c) {
    return [
        [c[0], c[1], c[2], c[3]],
        [c[1], c[2], c[3], c[0]],
        [c[2], c[3], c[0], c[1]],
        [c[3], c[0], c[1], c[2]]
    ]
}
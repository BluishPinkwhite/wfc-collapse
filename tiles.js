
// first - main
// second - secondary
// last - specifier


const fulls = {
    grass:         ['grass', 'grass', 'grass', 'grass'],
    water:         ['water', 'water', 'water', 'water'],
}
const fullsAmount = Object.keys(fulls).length;


const halves = {
    grass_water_side:   ['water', 'water', 'grass', 'grass'],
}
const halvesAmount = Object.keys(halves).length * 2;


const tiles = {
    grass_most_water_corner: ['water', 'water', 'water', 'grass'],
    water_most_grass_corner: ['water', 'grass', 'grass', 'grass'],
}
const tilesAmount = Object.keys(tiles).length * 4;

const totalTileAmount = fullsAmount + halvesAmount + tilesAmount;




const tileColors = {
    grass: "#22DA44",
    water: "#1223AD",
}
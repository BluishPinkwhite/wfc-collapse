
// @author Tammie Hladilů
// 12.12.2023



class TileSet {
    tileSize = -1;
    tiles;
    tileColors;
    totalTileAmount = -1;
    renderingFunctions = [];

    constructor(tileSize, tiles, tileColors, renderingFunctions) {
        this.tileSize = tileSize;
        this.tiles = tiles;
        this.tileColors = tileColors;
        this.renderingFunctions = renderingFunctions;

        this.totalTileAmount = tiles.length;
    }

    process(tileSetProcessedCallback = ()=>{}) {
        processTileSet();
        tileSetProcessedCallback();
    }
}


let tileSet;


// adds rotated tiles
function dupe(c) {
    return [
        [c[0], c[1], c[2], c[3], c[4], c[5]],
        [c[0], c[1], c[3], c[4], c[5], c[2]],
        [c[0], c[1], c[4], c[5], c[2], c[3]],
        [c[0], c[1], c[5], c[2], c[3], c[4]]
    ]
}


function color(tile, cornerIndex) {
    return tileColors[indexMap[tile.corners[cornerIndex]]];
}


let indexMap = [];
let renderMap = [];
let renderMethods = [];

function processTileSet() {
    // index tiles -> store their absolute 'tileSet.tiles' index in them
    // refactor tileData to objects
    let currIndex = 0;
    let tileTypeIndex = 0;
    let renderTypeIndex = 0;

    for (let i = 0; i < tileSet.tiles.length; i++) {
        let tileData = tileSet.tiles.shift();

        // refactor data to object
        tileData = {
            corners: [tileData[2], tileData[3], tileData[4], tileData[5]],
            weight: tileData[0],
            render: tileData[1],
            absoluteIndex: currIndex
        };
        currIndex++;

        // replace corners with indexes
        for (let cornerIndex = 0; cornerIndex < tileData.corners.length; cornerIndex++) {
            const corner = tileData.corners[cornerIndex];
            
            if(!indexMap[corner]) {
                indexMap[corner] = tileTypeIndex;
                indexMap[tileTypeIndex] = corner;
                tileTypeIndex++;
            }

            tileData.corners[cornerIndex] = indexMap[corner];
        }

        // replace rendering methods with indexes
        const renderingMethod = tileData.render;
            
        if(!Object.keys(renderMap).includes(renderingMethod.name)) {
            renderMethods.push(renderingMethod);
            renderMap[renderingMethod.name] = renderTypeIndex;
            renderTypeIndex++;
        }
        tileData.render = renderMap[renderingMethod.name];

        tileSet.tiles.push(tileData);
    }
}

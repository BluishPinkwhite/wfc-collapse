# Web-Based Wave Function Collapse Visualizer

This project is a web-based wave function collapse visualizer written in JavaScript. It utilizes a modifiable grid-based tile set defined in the file *tiles.js.* Constraints are handled as corner connections, where each tile consists of four corners of set tile types such as grass, water, and forest.

## Background

The simulation is handled using wave function collapse. At the start, all tiles can become all possible tiles from the tileset. Each simulation step a tile with the lowest number of possibilities is selected and collapsed - one of its possibilities is selected randomly based on their weights. All neighbors' possibilities of the tile are then recalculated - when a tile cannot "fit" next to any of neighbors possible tiles, it is discarded. This process is recursive for all neighbors of tiles which lost some possibilities.

## Wallpaper Engine

As this project is web-based, it can be used inside Wallpaper Engine. Various parameters of the visualizer can be configured in the wallpaper settings.

**To add wallpaper:**
1. Open Wallpaper Engine.
2. Click on the '+' icon and select "Add Wallpaper."
2. Choose "Web" and enter the URL of the *page.html* file.

**To update wallpaper using local file changes:**
1. Select this wallpaper.
2. Click "Open in Editor", on the right.
3. In the "Edit" tab, choose "Open in Explorer" to find the wallpaper save location.
4. Update project files.
5. In the "View" tab, click "Restart Preview" to view your changes in action.
5. In the "File" tab, click "Save" and "Apply Wallpaper" when you are done with your changes.

## Configuration

Inside *main.js*, you'll find the main JavaScript *config* object, which includes:

- **height** and **width**: the canvas tile size
- **speed**: cooldown between steps (in milliseconds)
- **backgroundColor** and **chanceColor**: CSS RGB format colors for uncollapsed tiles
- **countdownMax**: how many steps to wait after finishing and starting one simulation cycle
- **repeats**: how many substeps to do in one step

### Modifying

You can change the configuration during runtime in a browser using the JavaScript console. Some changes take effect only after calling the "start()" function.

**Example command to speed up the visualizer:**
```javascript
config.speed = 10;
start();
```
*Note:* Can be entered as one console command.

## Inner Workings

The project is split into two parts: the visualizer and simulation. The visualizer (render thread) consumes render instructions produced by simulation threads. Each time all instructions from one simulation are consumed, another simulation thread is started. Simulation threads are implemented using local web workers.

## Tileset Configuration

Inside *tiles.js*, you can find all tile definitions and can modify, replace, or create new ones. The "dupe()" function is called on rotatable tiles to get all four possible rotations of that tile. 

Tile type names get replaced by indexes (*string -> int*) for faster runtime comparison (saving about 50ms out of 250ms). Each tile's data is an array where (by index):

1. Top left corner type (for example: *"grass"*)
2. Top right corner type
3. Bottom right corner type
4. Bottom left corner type
5. Weight of picking this tile type at random (larger number = higher chance)

#### Tile type colors
You can change colors of tile types in *tiles.js* in the *tileColors* object.
With the format:
```javascript
(tile type) : (hex color)
grass: "#22DA44",
water: "#12ABEB"
```

#### Tile type warning
You need to create valid configurations of tile sets because this implementation of wave function collapse does not include backtracting. Otherwise some tiles might end up without possibilites and become "dead". Although the simulation should never deadlock by this.

## Created By

**Tammie Hladilů**
started this project out of frustration during an exhausting night while preparing for a college essay on November 19th, 2023.

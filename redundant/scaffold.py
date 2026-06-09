#!/usr/bin/env python3
"""
Bibliomon - Phaser 3 Project Scaffold Generator
Run this script to create the full folder structure and placeholder files.
"""

import os

# Base directory (change if needed)
BASE_DIR = "bibliomon"

# Define the folder structure
folders = ["js/scenes", "js/data", "assets/images", "assets/audio"]

# Define files with their placeholder content
files = {
    "index.html": """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bibliomon - MMU Library RPG</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div id="game-container"></div>
    <script src="https://cdn.jsdelivr.net/npm/phaser@3.60.0/dist/phaser.min.js"></script>
    <script type="module" src="js/main.js"></script>
</body>
</html>
""",
    "style.css": """/* Minimal styling - the game canvas is handled by Phaser */
body {
    margin: 0;
    background: #000;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    overflow: hidden;
}
""",
    "js/main.js": """// Phaser game configuration and scene list
const config = {
    type: Phaser.AUTO,
    width: 640,
    height: 480,
    parent: 'game-container',
    pixelArt: true,
    backgroundColor: '#1a1a1a',
    scene: [BootScene, OverworldScene, BattleScene, MenuScene]
};

const game = new Phaser.Game(config);

// Global game state (will be populated as we go)
window.gameState = {
    currentMap: 'ground',
    playerPos: { x: 0, y: 0 },
    backpack: [],
    libraryAccount: [],
    items: [],
    // ... add as needed
};
""",
    "js/scenes/BootScene.js": """// BootScene: loads assets and then starts the OverworldScene
class BootScene extends Phaser.Scene {
    constructor() {
        super('Boot');
    }

    preload() {
        // Load spritesheets, tilemaps, audio
        // Example: this.load.image('tiles', 'assets/images/tileset.png');
        // For now, we'll use generated placeholders
    }

    create() {
        this.scene.start('Overworld');
    }
}
""",
    "js/scenes/OverworldScene.js": """// OverworldScene: handles map rendering, player movement, encounters, puzzles
class OverworldScene extends Phaser.Scene {
    constructor() {
        super('Overworld');
    }

    create() {
        // Build tilemap from our map data (from js/data/maps.js)
        // Set up player sprite, keyboard controls, camera
        // Overlap checks for encounters and triggers
    }

    update(time, delta) {
        // Movement handling, spin-tile logic, encounter checks
    }
}
""",
    "js/scenes/BattleScene.js": """// BattleScene: turn-based combat system (ported from our HTML engine)
class BattleScene extends Phaser.Scene {
    constructor() {
        super('Battle');
    }

    create() {
        // Display enemy and player books, HP bars, command menu
        // Use our existing battle state machine and damage formulas
    }
}
""",
    "js/scenes/MenuScene.js": """// MenuScene: pause menu, Library Account management, item inventory
class MenuScene extends Phaser.Scene {
    constructor() {
        super('Menu');
    }

    create() {
        // Pause overlay, navigable menus
        // This will be launched as an overlay scene from OverworldScene
    }
}
""",
    "js/data/moves.js": """// Move definitions (from our HTML Phase 5 code)
const MOVES = {
    close_reading:   { name:"Close Reading", type:"arts_humanities", category:"physical", power:40, accuracy:1.0, effect:null },
    deconstruction:  { name:"Deconstruction", type:"arts_humanities", category:"special", power:50, accuracy:0.9, effect:"lowerSpDef" },
    // ... (paste the full MOVES object here)
};
""",
    "js/data/books.js": """// Book definitions, base stats, evolution chains
const ALL_BOOKS = {
    norton_anthology_base: {
        id:"norton_anthology_base", name:"The Norton Anthology", type:"arts_humanities",
        baseStats:{hp:45,atk:45,def:40,spAtk:50,spDef:50,spd:40},
        moves:[ {moveId:"close_reading",learnLevel:1},{moveId:"rhetoric",learnLevel:5},{moveId:"deconstruction",learnLevel:10},{moveId:"citation",learnLevel:15} ],
        catchRate:100
    },
    // ... (paste full ALL_BOOKS from our design doc)
};
""",
    "js/data/maps.js": """// Map arrays for each floor (from our HTML code)
const GROUND_MAP = [
    "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW",
    "W......................................W",
    "W..WWWWWWWWW...WWWWWWWWWWWWWWWWWWW..B.E..W",
    // ... (paste the full 30 rows)
];
""",
    "js/data/trainers.js": """// Trainer data for each floor and gym
const GROUND_TRAINERS = [
    { id:"t1", name:"Fresher Fiona", dialogue:"I've been studying all week! Let's see if you prepared.", books:[{id:"norton_anthology_base",level:5},{id:"ways_of_seeing_base",level:5}] },
    // ... (paste our trainer array)
];
""",
    "assets/images/placeholder.txt": "Place images here (spritesheets, tilesets). Replace with AI-generated pixel art.",
    "assets/audio/placeholder.txt": "Place audio files here (WAV/MP3). Replace with generated sound effects.",
    "README.md": """# Bibliomon - MMU Library RPG

## Setup
1. Open this folder in VS Code (or any editor).
2. Ensure you have Python 3 installed.
3. Run `python scaffold.py` to generate the project if you haven't already.
4. Open `index.html` with a live server (e.g., VS Code Live Server extension) to run the game.

## Project Structure
- `index.html` - entry point
- `style.css` - basic styling
- `js/main.js` - Phaser configuration and game initialization
- `js/scenes/` - game scenes (Boot, Overworld, Battle, Menu)
- `js/data/` - game data (moves, books, maps, trainers)
- `assets/images/` - spritesheets and tilemaps
- `assets/audio/` - sound effects and music

## Development Notes
- All game logic from the original HTML prototype is being ported here.
- Placeholder code is included; fill in the actual implementations.
- Use the Phaser 3 documentation: https://photonstorm.github.io/phaser3-docs/
""",
}


def create_project():
    # Create base directory
    os.makedirs(BASE_DIR, exist_ok=True)

    # Create subdirectories
    for folder in folders:
        path = os.path.join(BASE_DIR, folder)
        os.makedirs(path, exist_ok=True)

    # Write files
    for file_path, content in files.items():
        full_path = os.path.join(BASE_DIR, file_path)
        with open(full_path, "w", encoding="utf-8") as f:
            f.write(content)

    print(f"✅ Project scaffold created at '{BASE_DIR}/'")
    print("Next steps:")
    print("1. Open the folder in VS Code.")
    print(
        "2. Fill in the placeholder files with the code from our original HTML prototype."
    )
    print("3. Generate pixel art assets using AI and place them in assets/images/.")
    print("4. Launch index.html with Live Server to test.")


if __name__ == "__main__":
    create_project()

# Bibliomon - MMU Library RPG

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

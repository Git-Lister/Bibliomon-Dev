# Bibliomon-Dev

A Library RPG built with Phaser 3 – "Gotta Click 'n' Collect 'em all!"

## About

Explore a faithfully gamified version of MMU's John Dalton Library. Capture sentient books, battle students for study rooms, and become the ultimate scholar.

## Quick Start

```bash
# Clone the repo
git clone https://github.com/Git-Lister/Bibliomon-Dev.git
cd Bibliomon-Dev

# Run the Python scaffold (generates initial data)
python bibliomon/scaffold.py

# Serve the game (Python 3)
cd bibliomon
python -m http.server 8000
Then open http://localhost:8000 in your browser.

Project Structure
text
bibliomon/
├── index.html          # Entry point
├── css/               # Styles
├── js/
│   ├── scenes/        # Phaser 3 scenes
│   ├── data/          # Game data (books, moves, items, etc.)
│   ├── state/         # Game state management
│   └── engine/        # Core game logic
├── assets/            # Images, tilemaps, audio
└── scaffold.py        # Data generation tool
Current Status
Playable vertical slice of the Ground Floor. Features:

Overworld exploration with collision

Wild book encounters (bookshelves = tall grass)

Trainer battles (students outside study rooms)

Turn-based combat with 4 subject types

Save/Load via localStorage

Library Account (PC system) for managing your book collection

License
MIT
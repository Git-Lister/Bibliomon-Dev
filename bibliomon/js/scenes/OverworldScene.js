// ── Shop definitions (global so openShop can see them) ──────────────────────
const SHOPS = {
    vending: {
        name: 'Vending Machine',
        items: [
            { itemId: 'potion', price: 10 },
            { itemId: 'awakening', price: 15 },
            { itemId: 'antidote', price: 15 }
        ]
    },
    cafe: {
        name: 'Library Café',
        items: [
            { itemId: 'super_potion', price: 25 },
            { itemId: 'bookmark_item', price: 20 }
        ]
    }
};

class OverworldScene extends Phaser.Scene {
    constructor() {
        super('Overworld');
    }

    create() {
        this.cameras.main.setBackgroundColor('#1a1a1a');
        this.gameState = window.gameState;


        // Check for saved game and show load prompt if found
const hasSave = localStorage.getItem('bibliomon_save');
if (hasSave) {
    this.scene.launch('Dialogue', {
        text: 'Saved data found. Continue from where you left off?',
        choices: ['Yes', 'No'],
        choiceCallback: (choice) => {
            if (choice === 'yes') {
                window.loadGameData();
                // Restart scene with loaded data
                this.scene.restart();
            } else {
                // Start fresh – wipe save
                localStorage.removeItem('bibliomon_save');
                this.scene.restart();
            }
        }
    });
    this.scene.pause();
    return;   // skip the rest of create() until choice is made
}

        // Starter book
        if (this.gameState.backpack.length === 0) {
            this.gameState.backpack.push(createBookInstance('norton_anthology_base', 5));
        }

        // Entrance scanner
        const p = this.gameState.player;
        if (p.tileX === undefined || p.tileY === undefined || (p.tileX === 0 && p.tileY === 0)) {
            const groundMap = GROUND_MAP;
            const row = 29;
            let firstDot = -1, lastDot = -1;
            for (let c = 0; c < groundMap[row].length; c++) {
                if (groundMap[row][c] === '.') {
                    if (firstDot === -1) firstDot = c;
                    lastDot = c;
                }
            }
            if (firstDot !== -1) {
                p.tileX = Math.floor((firstDot + lastDot) / 2);
                p.tileY = row;
            }
        }

        // Trainer map
        if (!this.gameState.trainerMap || Object.keys(this.gameState.trainerMap).length === 0) {
            this.gameState.trainerMap = {};
            for (let r = 0; r < GROUND_MAP.length; r++) {
                for (let c = 0; c < GROUND_MAP[r].length; c++) {
                    if (GROUND_MAP[r][c] === 'T') {
                        const tIdx = Object.keys(this.gameState.trainerMap).length;
                        if (tIdx < GROUND_TRAINERS.length) {
                            this.gameState.trainerMap[`${c},${r}`] = GROUND_TRAINERS[tIdx];
                        }
                    }
                }
            }
        }

        this.buildMap();
        this.createPlayer();
        this.setupInput();

        this.debugText = this.add.text(10, 10, '', {
            fontFamily: 'monospace', fontSize: '10px', fill: '#0f0'
        }).setScrollFactor(0).setDepth(100);
    }

    getTileAt(col, row) {
        const map = this.gameState.currentMap === 'ground' ? GROUND_MAP : FLOOR1_MAP;
        if (col < 0 || col >= 40 || row < 0 || row >= 30) return 'W';
        const line = map[row];
        if (line[col] === 'P' && col + 1 < line.length && '>v<^'.includes(line[col + 1])) {
            return 'P' + line[col + 1];
        }
        return line[col];
    }

    buildMap() {
        const mapData = this.gameState.currentMap === 'ground' ? GROUND_MAP : FLOOR1_MAP;
        if (this.allTiles) this.allTiles.clear(true, true);
        this.allTiles = this.add.group();

        const tileIndexMap = window.tileIndexMap;
        for (let r = 0; r < mapData.length; r++) {
            for (let c = 0; c < mapData[r].length; c++) {
                let tileChar = mapData[r][c];
                if (tileChar === '.') continue;
                if (tileChar.startsWith('P') && tileChar.length === 2) {
                    tileChar = tileChar;
                } else if (tileChar === 'P') {
                    continue;
                }
                const tileIndex = tileIndexMap[tileChar];
                if (tileIndex === undefined) continue;
                const sprite = this.add.sprite(c * 16 + 8, r * 16 + 8, 'tileset', tileIndex);
                sprite.setOrigin(0.5);
                this.allTiles.add(sprite);
            }
        }
    }

    createPlayer() {
        const startCol = this.gameState.player.tileX || 19;
        const startRow = this.gameState.player.tileY || 29;
        this.player = this.add.sprite(startCol * 16 + 8, startRow * 16 + 8, 'player_walk', 0);
        this.player.setOrigin(0.5);
        this.player.setDepth(2);
        this.player.anims.play('walk_down');
        this.player.anims.pause();
        this.cameras.main.startFollow(this.player, true, 1, 1);
        this.cameras.main.setBounds(0, 0, 40 * 16, 30 * 16);
        this.cameras.main.setRoundPixels(true);
    }

    setupInput() {
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = {
            up:    this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
            down:  this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
            left:  this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
            right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
        };
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
        this.escKey   = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    }

openShop(shopId) {
    const shop = SHOPS[shopId];
    if (!shop) return;

    const scene = this;   // capture the scene for use inside the callback

    const itemList = shop.items.map(i => {
        const item = ITEM_DATA[i.itemId];
        return `${item.name}  £${i.price}`;
    });

    scene.scene.launch('Dialogue', {
        text: `Welcome to the ${shop.name}! What would you like?`,
        choices: [...itemList, 'Cancel'],
        choiceCallback: (choice) => {
            if (choice === 'cancel') return;

            const idx = itemList.findIndex(t => t.toLowerCase() === choice);
            if (idx >= 0) {
                const selected = shop.items[idx];
                if (scene.gameState.credits >= selected.price) {
                    let slot = scene.gameState.items.find(i => i.itemId === selected.itemId);
                    if (!slot) {
                        slot = { itemId: selected.itemId, qty: 0 };
                        scene.gameState.items.push(slot);
                    }
                    if (slot.qty >= 20) {
                        scene.time.delayedCall(100, () => {
                            scene.showMessage('Inventory full for that item.');
                        });
                        return;
                    }
                    scene.gameState.credits -= selected.price;
                    slot.qty++;
                    saveGameData();
                    scene.time.delayedCall(100, () => {
                        scene.showMessage(`Purchased ${ITEM_DATA[selected.itemId].name}!`);
                    });
                } else {
                    scene.time.delayedCall(100, () => {
                        scene.showMessage('Not enough Rise‑Points.');
                    });
                }
            }
        }
    });
    scene.scene.pause();
}

    attemptMove(dx, dy) {
        const p = this.gameState.player;
        if (p.isMoving) return;

        if (dx !== 0) p.facing = dx > 0 ? 'right' : 'left';
        if (dy !== 0) p.facing = dy > 0 ? 'down' : 'up';

        const nextCol = p.tileX + dx;
        const nextRow = p.tileY + dy;
        const tile = this.getTileAt(nextCol, nextRow);

        if (tile === 'W' || tile === 'H' || tile === 'Z' || tile === 'R' || tile === 'O') return;
        if (tile === 'R') {
        if (this.gameState.player.facing !== 'up') {
            this.showMessage('The reception desk is staffed from the front.');
            return;
        }
        if (this.gameState.cardValidated) {
            this.showMessage('Your Library Card is already valid. Welcome!');
            return;
        }
        this.scene.launch('Dialogue', {
            text: '"Good morning! May I see your Library Card?"',
            choices: ['Yes', 'Not yet'],
            choiceCallback: (choice) => {
                if (choice === 'yes') {
                    this.gameState.cardValidated = true;
                    saveGameData();
                    this.showMessage('Your Library Card has been validated. The gates are now open.');
                } else {
                    this.showMessage('Please come back when you have your card.');
                }
            }
        });
        this.scene.pause();
        return;
    }
        if (tile === 'B' && !this.gameState.puzzleSolved) {
            this.showMessage('The barrier is locked. Solve the puzzle first.');
            return;
        }
        if (tile.startsWith('P')) {
            this.startSpinTile(nextCol, nextRow, tile);
            return;
        }
        if (tile === 'E') {
            this.handleStairs();
            return;
        }
        if (tile === 'Y' && !this.gameState.cardValidated) {
            this.showMessage('The security gate is locked. Validate your card at Reception first.');
            return;
        }

        this.player.anims.play(`walk_${this.gameState.player.facing}`);
        p.isMoving = true;
        this.tweens.add({
            targets: this.player,
            x: nextCol * 16 + 8,
            y: nextRow * 16 + 8,
            duration: 120,
            ease: 'Linear',
            onComplete: () => {
                p.tileX = nextCol;
                p.tileY = nextRow;
                p.isMoving = false;
                this.player.anims.pause();
                this.checkTileAfterMove(nextCol, nextRow, tile);
            }
        });
    }

    checkTileAfterMove(col, row, tile) {
        if (this.gameState.mode !== 'walk' || this.gameState.inputLocked) return;
        if (tile === 'S') {
            if (Math.random() < 0.10) {
                const roll = Math.random();
                let bid = 'thermo_base', lvl = 2;
                if (roll < 0.30) { bid = 'thermo_base'; lvl = Math.random() < 0.5 ? 2 : 3; }
                else if (roll < 0.55) { bid = 'company_law_base'; lvl = 3; }
                else if (roll < 0.75) { bid = 'norton_anthology_base'; lvl = Math.random() < 0.5 ? 3 : 4; }
                else if (roll < 0.90) { bid = 'human_body_base'; lvl = 4; }
                else { bid = 'econ_dummies_base'; lvl = 4; }
                const opponent = createBookInstance(bid, lvl);
                this.gameState.mode = 'battle';
                this.gameState.battle = { type: 'wild', opponent: opponent, trainer: null };
                this.scene.launch('Battle', { battleType: 'wild', opponent: opponent });
                this.scene.pause();
            }
        }
        if (tile === 'T' && this.gameState.currentMap === 'ground') {
            const trainer = this.gameState.trainerMap?.[`${col},${row}`];
            if (trainer && !this.gameState.defeatedTrainers.includes(trainer.id)) {
                this.gameState.mode = 'battle';
                const opponent = createBookInstance(trainer.books[0].id, trainer.books[0].level);
                this.gameState.battle = { type: 'trainer', opponent: opponent, trainer: trainer, trainerBookIndex: 0 };
                this.scene.launch('Battle', { battleType: 'trainer', opponent: opponent, trainer: trainer });
                this.scene.pause();
            }
        }
    }

    handleStairs() {
        if (this.gameState.currentMap === 'ground' && this.gameState.puzzleSolved) {
            this.gameState.currentMap = 'floor1';
            this.gameState.player.tileX = 37;
            this.gameState.player.tileY = 3;
            this.scene.restart();
        } else if (this.gameState.currentMap === 'floor1') {
            this.gameState.currentMap = 'ground';
            this.gameState.player.tileX = 35;
            this.gameState.player.tileY = 3;
            this.scene.restart();
        } else {
            this.showMessage('Solve the puzzle first.');
        }
    }

    startSpinTile(col, row, tile) {
        this.gameState.inputLocked = true;
        this.gameState.player.tileX = col;
        this.gameState.player.tileY = row;
        let currentCol = col, currentRow = row, currentTile = tile;
        const executeStep = () => {
            const dir = this.getSpinDirection(currentTile);
            if (!dir) { this.gameState.inputLocked = false; return; }
            const nextCol = currentCol + dir.x;
            const nextRow = currentRow + dir.y;
            const nextTile = this.getTileAt(nextCol, nextRow);
            if (nextTile === 'W' || (nextTile === 'B' && !this.gameState.puzzleSolved)) {
                this.gameState.inputLocked = false;
                return;
            }
            this.tweens.add({
                targets: this.player,
                x: nextCol * 16 + 8,
                y: nextRow * 16 + 8,
                duration: 120,
                ease: 'Linear',
                onComplete: () => {
                    this.gameState.player.tileX = nextCol;
                    this.gameState.player.tileY = nextRow;
                    if (nextTile === 'X') {
                        this.gameState.puzzleSolved = true;
                        this.gameState.inputLocked = false;
                        this.showMessage('The directional study carrels align! A lock clicks open nearby.');
                        saveGameData();
                    } else if (nextTile.startsWith('P')) {
                        currentCol = nextCol;
                        currentRow = nextRow;
                        currentTile = nextTile;
                        executeStep();
                    } else {
                        this.gameState.inputLocked = false;
                    }
                }
            });
        };
        executeStep();
    }

    getSpinDirection(tile) {
        switch (tile) {
            case 'P>': return { x: 1, y: 0 };
            case 'P<': return { x: -1, y: 0 };
            case 'P^': return { x: 0, y: -1 };
            case 'Pv': return { x: 0, y: 1 };
            default: return null;
        }
    }

    handleInteraction() {
        const p = this.gameState.player;
        let tx = p.tileX, ty = p.tileY;
        switch (p.facing) {
            case 'up': ty--; break;
            case 'down': ty++; break;
            case 'left': tx--; break;
            case 'right': tx++; break;
        }

        // ── Hidden item check (before any tile logic) ──
        const hidden = this.gameState.hiddenItems.find(h => h.x === tx && h.y === ty && h.qty > 0);
        if (hidden) {
            hidden.qty--;
            let slot = this.gameState.items.find(i => i.itemId === hidden.itemId);
            if (!slot) { slot = { itemId: hidden.itemId, qty: 0 }; this.gameState.items.push(slot); }
            if (slot.qty >= 20) {
                this.showMessage('Inventory full for that item.');
            } else {
                slot.qty++;
                saveGameData();
                this.showMessage(`Found a hidden ${ITEM_DATA[hidden.itemId].name}!`);
            }
            return;
        }

        const tile = this.getTileAt(tx, ty);

        if (tile === 'H') {
            this.scene.launch('Dialogue', {
                text: '"Hello! Welcome to the Library. Would you like me to check your books?"',
                choices: ['Yes', 'No'],
                choiceCallback: (choice) => {
                    if (choice === 'yes') {
                        this.gameState.backpack.forEach(b => b.currentHP = b.maxHP);
                        this.time.delayedCall(400, () => {
                            this.scene.launch('Dialogue', {
                                text: 'All books have been restored. Opening your Library Account…',
                                callback: () => {
                                    this.scene.launch('Menu', { mode: 'account' });
                                    this.scene.pause();
                                }
                            });
                            this.scene.pause();
                        });
                    } else {
                        this.scene.launch('Dialogue', {
                            text: 'Come back anytime!',
                            callback: () => {}
                        });
                        this.scene.pause();
                    }
                }
            });
            this.scene.pause();
            return;
        }

        if (tile === 'Z') {
            this.showMessage('"I\'m a Librarian, not a student – my training days are behind me!"');
            return;
        }

        if (tile === 'K') {
            this.gameState.backpack.forEach(b => b.currentHP = b.maxHP);
            saveGameData();
            this.showMessage('Kitchenette break! Party healed and game saved.');
        } else if (tile === 'V') {
            if (this.gameState.player.facing !== 'up') {
                this.showMessage('The vending machine only works from the front.');
                return;
            }
            this.openShop('vending');
        } else if (tile === 'C') {
            if (this.gameState.player.facing !== 'up') {
                this.showMessage('The café counter is staffed from the front.');
                return;
            }
            this.openShop('cafe');
        } else if (tile === 'L') {
            this.showMessage('Opening Library Account…', () => {
                this.scene.launch('Menu', { mode: 'account' });
                this.scene.pause();
            });
        } else if (tile === 'G') {
            if (this.gameState.gym1Defeated) {
                this.showMessage('You have already conquered the Special Collections Gym.');
            } else {
                this.startGymChallenge();
            }
        }
    }

    showMessage(text, callback = null) {
        this.gameState.mode = 'text';
        this.scene.launch('Dialogue', {
            text: text,
            callback: () => {
                this.gameState.mode = 'walk';
                if (callback) callback();
            }
        });
        this.scene.pause();
    }

    startGymChallenge() {
        this.showMessage('Prepare to face the Archivists!', () => {});
    }

    update(time, delta) {
        const p = this.gameState.player;
        if (this.gameState.mode !== 'walk' || this.gameState.inputLocked || p.isMoving) return;

        let dx = 0, dy = 0;
        if (this.cursors.up.isDown    || this.wasd.up.isDown)    dy = -1;
        else if (this.cursors.down.isDown  || this.wasd.down.isDown)  dy = 1;
        else if (this.cursors.left.isDown  || this.wasd.left.isDown)  dx = -1;
        else if (this.cursors.right.isDown || this.wasd.right.isDown) dx = 1;

        if (dx !== 0 || dy !== 0) {
            this.attemptMove(dx, dy);
        }

        if (Phaser.Input.Keyboard.JustDown(this.spaceKey) || Phaser.Input.Keyboard.JustDown(this.enterKey)) {
            this.handleInteraction();
        }
        if (Phaser.Input.Keyboard.JustDown(this.escKey)) {
            this.scene.launch('Menu', { mode: 'pause' });
            this.scene.pause();
        }

        if (this.debugText) {
            this.debugText.setText(`Tile: (${p.tileX},${p.tileY}) ${this.getTileAt(p.tileX, p.tileY)}`);
        }
    }
}
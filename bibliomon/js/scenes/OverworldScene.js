// js/scenes/OverworldScene.js

// ── Shop definitions ──────────────────────────────────────────────────────
const SHOPS = {
    vending: { name: 'Vending Machine', items: [ { itemId: 'potion', price: 10 }, { itemId: 'awakening', price: 15 }, { itemId: 'antidote', price: 15 } ] },
    cafe: { name: 'Library Café', items: [ { itemId: 'super_potion', price: 25 }, { itemId: 'bookmark_item', price: 20 } ] }
};
const TILE_SIZE = 32;

// ── Note: EventQueue is loaded from js/engine/EventQueue.js ─────────────

class OverworldScene extends Phaser.Scene {
    constructor() {
        super('Overworld');
        this.libraryAccountUI = null;  // Will be created in create()
    }

    create() {
        console.log('OverworldScene.create() called'); // DEBUG
        this.cameras.main.setBackgroundColor('#1a1a1a');
        this.gameState = window.gameState;

        // ── Create Library Account UI ──────────────────────────────────
        // IMPORTANT: This creates the UI manager but doesn't show it
        this.libraryAccountUI = new LibraryAccountUI(this);
        console.log('LibraryAccountUI created'); // DEBUG

        // ── Entrance scanner ─────────────────────────────────────────────
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

        // ── Trainer map ──────────────────────────────────────────────────
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

    // ═══════════════════════════════════════════════════════════════════════
    //  Tile & Map Helpers
    // ═══════════════════════════════════════════════════════════════════════
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
                const sprite = this.add.sprite(c * TILE_SIZE + TILE_SIZE / 2, r * TILE_SIZE + TILE_SIZE / 2, 'tileset', tileIndex);
                sprite.setOrigin(0.5);
                this.allTiles.add(sprite);
            }
        }
    }

    refreshGates() {
        if (this.allTiles) {
            this.allTiles.clear(true, true);
        }
        this.buildMap();
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  Player & Input
    // ═══════════════════════════════════════════════════════════════════════
    createPlayer() {
        const startCol = this.gameState.player.tileX || 19;
        const startRow = this.gameState.player.tileY || 29;
        this.player = this.add.sprite(startCol * TILE_SIZE + TILE_SIZE / 2, startRow * TILE_SIZE + TILE_SIZE / 2, 'player_walk', 0);
        this.player.setOrigin(0.5);
        this.player.setDepth(2);
        this.player.anims.play('walk_down');
        this.player.anims.pause();
        this.cameras.main.startFollow(this.player, true, 1, 1);
        this.cameras.main.setBounds(0, 0, 40 * TILE_SIZE, 30 * TILE_SIZE);
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

    // ═══════════════════════════════════════════════════════════════════════
    //  Shop
    // ═══════════════════════════════════════════════════════════════════════
    openShop(shopId) {
        const shop = SHOPS[shopId];
        if (!shop) return;
        const scene = this;
        const itemList = shop.items.map(i => {
            const item = ITEM_DATA[i.itemId];
            return `${item.name}  £${i.price}`;
        });
        scene.scene.launch('Dialogue', {
            text: `Welcome to the ${shop.name}! What would you like?`,
            choices: [...itemList, 'Cancel'],
            choiceCallback: (choice) => {
                if (choice === 'Cancel') return;
                const idx = itemList.findIndex(t => t.toLowerCase() === choice.toLowerCase());
                if (idx >= 0) {
                    const selected = shop.items[idx];
                    if (scene.gameState.credits >= selected.price) {
                        let slot = scene.gameState.items.find(i => i.itemId === selected.itemId);
                        if (!slot) { slot = { itemId: selected.itemId, qty: 0 }; scene.gameState.items.push(slot); }
                        if (slot.qty >= 20) {
                            scene.time.delayedCall(100, () => scene.showMessage('Inventory full for that item.'));
                            return;
                        }
                        scene.gameState.credits -= selected.price;
                        slot.qty++;
                        saveGameData();
                        scene.time.delayedCall(100, () => scene.showMessage(`Purchased ${ITEM_DATA[selected.itemId].name}!`));
                    } else {
                        scene.time.delayedCall(100, () => scene.showMessage('Not enough Rise‑Points.'));
                    }
                }
            }
        });
        if (scene.scene.isActive('Overworld')) scene.scene.pause();
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  Movement & Encounter Triggers
    // ═══════════════════════════════════════════════════════════════════════
    attemptMove(dx, dy) {
        const p = this.gameState.player;
        if (p.isMoving) return;
        if (dx !== 0) p.facing = dx > 0 ? 'right' : 'left';
        if (dy !== 0) p.facing = dy > 0 ? 'down' : 'up';

        const nextCol = p.tileX + dx;
        const nextRow = p.tileY + dy;
        const tile = this.getTileAt(nextCol, nextRow);

        // Solid tiles
        if (tile === 'W' || tile === 'H' || tile === 'Z' ||
            tile === 'R' || tile === 'O' || tile === 'V' || tile === 'C') return;

        // Entry gate (I) – only allow entering from the left
        if (tile === 'I' || tile === 'Y') {
            if (!this.gameState.cardValidated) {
                this.showMessage('The security gate is locked. Validate your card at Reception first.');
                return;
            }
        }

        // Exit gate (Y) – only allow leaving from the right
        if (tile === 'Y') {
            if (!this.gameState.cardValidated) {
                this.showMessage('The security gate is locked. Validate your card at Reception first.');
                return;
            }
            if (p.tileX <= nextCol) return;
        }

        // ── Other special tiles ──────────────────────────────────────────
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

        // ── Normal walk ──────────────────────────────────────────────────
        this.performMove(dx, dy, nextCol, nextRow, tile);
    }

    performMove(dx, dy, nextCol, nextRow, tile) {
        const p = this.gameState.player;
        this.player.anims.play(`walk_${this.gameState.player.facing}`);
        p.isMoving = true;
        this.tweens.add({
            targets: this.player,
            x: nextCol * TILE_SIZE + TILE_SIZE / 2, y: nextRow * TILE_SIZE + TILE_SIZE / 2,
            duration: 120, ease: 'Linear',
            onComplete: () => {
                p.tileX = nextCol; p.tileY = nextRow;
                p.isMoving = false;
                this.player.anims.pause();
                this.checkTileAfterMove(nextCol, nextRow, tile);
            }
        });
    }

    checkTileAfterMove(col, row, tile) {
        if (this.gameState.mode !== 'walk' || this.gameState.inputLocked) return;

        // Wild encounters (only on bookshelf tiles)
        if (tile === 'S') {
            if (Math.random() < 0.10) {
                const roll = Math.random();
                let bid = 'thermo_base', lvl = 2;

                if (roll < 0.25) { bid = 'thermo_base'; lvl = Math.random() < 0.5 ? 2 : 3; }
                else if (roll < 0.50) { bid = 'algorithms_base'; lvl = Math.random() < 0.5 ? 2 : 3; }
                else if (roll < 0.60) { bid = 'norton_anthology_base'; lvl = Math.random() < 0.5 ? 3 : 4; }
                else if (roll < 0.70) { bid = 'ways_of_seeing_base'; lvl = Math.random() < 0.5 ? 3 : 4; }
                else if (roll < 0.80) { bid = 'company_law_base'; lvl = 3; }
                else if (roll < 0.90) { bid = 'econ_dummies_base'; lvl = 4; }
                else if (roll < 0.95) { bid = 'human_body_base'; lvl = 4; }
                else { bid = 'becoming_nurse_base'; lvl = 4; }

                const opponent = createBookInstance(bid, lvl);
                this.gameState.mode = 'battle';
                this.gameState.battle = { type: 'wild', opponent, trainer: null };
                this.scene.launch('Battle', { battleType: 'wild', opponent });
                this.scene.pause();
            }
        }

        // Trainer battles
        if (tile === 'T' && this.gameState.currentMap === 'ground') {
            const trainer = this.gameState.trainerMap?.[`${col},${row}`];
            if (trainer && !this.gameState.defeatedTrainers.includes(trainer.id)) {
                this.gameState.mode = 'battle';
                const opponent = createBookInstance(trainer.books[0].id, trainer.books[0].level);
                this.gameState.battle = { type: 'trainer', opponent, trainer, trainerBookIndex: 0 };
                this.scene.launch('Battle', { battleType: 'trainer', opponent, trainer });
                this.scene.pause();
            }
        }

        // ── Intro trigger (first step into the library proper) ───────────
        const introTiles = [{x:1, y:22}, {x:2, y:22}];
        const trigger = introTiles.find(t => t.x === col && t.y === row);
        if (trigger && !this.gameState.introCompleted &&
            this.gameState.cardValidated && this.gameState.backpack.length === 0) {
            this.startIntroSequence();
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  Stairs
    // ═══════════════════════════════════════════════════════════════════════
    handleStairs() {
        if (this.gameState.currentMap === 'ground' && this.gameState.puzzleSolved) {
            this.gameState.currentMap = 'floor1';
            this.gameState.player.tileX = 37; this.gameState.player.tileY = 3;
            this.scene.restart();
        } else if (this.gameState.currentMap === 'floor1') {
            this.gameState.currentMap = 'ground';
            this.gameState.player.tileX = 35; this.gameState.player.tileY = 3;
            this.scene.restart();
        } else {
            this.showMessage('Solve the puzzle first.');
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  Spin‑tile Puzzle
    // ═══════════════════════════════════════════════════════════════════════
    startSpinTile(col, row, tile) {
        this.gameState.inputLocked = true;
        this.gameState.player.tileX = col; this.gameState.player.tileY = row;
        let currentCol = col, currentRow = row, currentTile = tile;

        const moveNext = () => {
            const dir = this.getSpinDirection(currentTile);
            if (!dir) { this.gameState.inputLocked = false; return; }
            const nextCol = currentCol + dir.x, nextRow = currentRow + dir.y;
            const nextTile = this.getTileAt(nextCol, nextRow);
            if (nextTile === 'W' || (nextTile === 'B' && !this.gameState.puzzleSolved)) {
                this.gameState.inputLocked = false; return;
            }
            this.tweens.add({
                targets: this.player,
                x: nextCol * TILE_SIZE + TILE_SIZE / 2, y: nextRow * TILE_SIZE + TILE_SIZE / 2,
                duration: 120, ease: 'Linear',
                onComplete: () => {
                    this.gameState.player.tileX = nextCol;
                    this.gameState.player.tileY = nextRow;
                    if (nextTile === 'X') {
                        this.gameState.puzzleSolved = true;
                        this.gameState.inputLocked = false;
                        this.showMessage('The directional study carrels align! A lock clicks open nearby.');
                        saveGameData();
                        return;
                    }
                    if (nextTile.startsWith('P')) {
                        currentCol = nextCol; currentRow = nextRow; currentTile = nextTile;
                        moveNext();
                    } else {
                        this.gameState.inputLocked = false;
                    }
                }
            });
        };
        moveNext();
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

    // ═══════════════════════════════════════════════════════════════════════
    //  Tile Interactions (Space/Enter)
    // ═══════════════════════════════════════════════════════════════════════
    handleInteraction() {
        const p = this.gameState.player;
        let tx = p.tileX, ty = p.tileY;
        switch (p.facing) {
            case 'up': ty--; break;
            case 'down': ty++; break;
            case 'left': tx--; break;
            case 'right': tx++; break;
        }

        // Hidden items
        const hidden = this.gameState.hiddenItems.find(h => h.x === tx && h.y === ty && h.qty > 0);
        if (hidden) {
            hidden.qty--;
            let slot = this.gameState.items.find(i => i.itemId === hidden.itemId);
            if (!slot) { slot = { itemId: hidden.itemId, qty: 0 }; this.gameState.items.push(slot); }
            if (slot.qty >= 20) { this.showMessage('Inventory full for that item.'); }
            else { slot.qty++; saveGameData(); this.showMessage(`Found a hidden ${ITEM_DATA[hidden.itemId].name}!`); }
            return;
        }

        const tile = this.getTileAt(tx, ty);

        // ─── RECEPTION DESK ───
        if (tile === 'R') {
            const scene = this;
            if (scene.gameState.player.facing !== 'left') {
                scene.showMessage('The reception desk is staffed from the front.');
                return;
            }
            if (scene.gameState.cardValidated) {
                scene.showMessage('Your Library Card is already valid. Welcome!');
                return;
            }
            scene.scene.launch('Dialogue', {
                text: '"Good morning! May I see your Library Card?"',
                choices: ['Yes', 'Not yet'],
                choiceCallback: (choice) => {
                    if (choice.toLowerCase() === 'yes') {
                        scene.time.delayedCall(150, () => {
                            scene.gameState.cardValidated = true;
                            saveGameData();
                            scene.refreshGates();
                            scene.showMessage('Card validated! You may now enter the library.');
                        });
                    } else {
                        scene.time.delayedCall(100, () => {
                            scene.scene.launch('Dialogue', {
                                text: 'Please come back when you have your card.',
                                callback: () => {}
                            });
                            if (scene.scene.isActive('Overworld')) scene.scene.pause();
                        });
                    }
                }
            });
            if (scene.scene.isActive('Overworld')) scene.scene.pause();
            return;
        }

    // ─── HELP DESK (with Library Account) ───
    if (tile === 'H') {
        this.scene.launch('Dialogue', {
            text: '"Hello! Welcome to the Library. Would you like me to check your books?"',
            choices: ['Yes', 'No'],
            choiceCallback: (choice) => {
                if (choice.toLowerCase() === 'yes') {
                    // Heal books
                    this.gameState.backpack.forEach(b => b.currentHP = b.maxHP);
                    this.time.delayedCall(400, () => {
                        this.scene.launch('Dialogue', {
                            text: 'All books have been restored. Opening your Library Account…',
                            callback: () => {
                                // Show the Library Account UI
                                if (this.libraryAccountUI) {
                                    this.libraryAccountUI.show();
                                    this.scene.pause();
                                } else {
                                    // Fallback: use menu
                                    this.scene.launch('Menu', { mode: 'account' });
                                    this.scene.pause();
                                }
                            }
                        });
                        this.scene.pause();
                    });
                } else {
                    this.scene.launch('Dialogue', {
                        text: 'Come back anytime!',
                        callback: () => {}
                    });
                    if (this.scene.isActive('Overworld')) this.scene.pause();
                }
            }
        });
        if (this.scene.isActive('Overworld')) this.scene.pause();
        return;
    }

    // ─── OPAC TERMINAL (Library Account) ───
    if (tile === 'L') {
        this.showMessage('Opening Library Account…', () => {
            if (this.libraryAccountUI) {
                this.libraryAccountUI.show();
                this.scene.pause();
            } else {
                this.scene.launch('Menu', { mode: 'account' });
                this.scene.pause();
            }
        });
        return;
    }

        // Staff
        if (tile === 'Z') { this.showMessage('"I\'m a Librarian, not a student – my training days are behind me!"'); return; }

        // Kitchenette
        if (tile === 'K') {
            this.gameState.backpack.forEach(b => b.currentHP = b.maxHP);
            saveGameData();
            this.showMessage('Kitchenette break! Party healed and game saved.');
        }
        // Vending machine
        else if (tile === 'V') {
            if (this.gameState.player.facing !== 'up') { this.showMessage('The vending machine only works from the front.'); return; }
            this.openShop('vending');
        }
        // Café
        else if (tile === 'C') {
            if (this.gameState.player.facing !== 'up') { this.showMessage('The café counter is staffed from the front.'); return; }
            this.openShop('cafe');
        }
        // OPAC terminal
        else if (tile === 'L') {
            this.showMessage('Opening Library Account…', () => { this.scene.launch('Menu', { mode: 'account' }); this.scene.pause(); });
        }
        // Gym
        else if (tile === 'G') {
            if (this.gameState.gym1Defeated) this.showMessage('You have already conquered the Special Collections Gym.');
            else this.startGymChallenge();
        }
    }

    showMessage(text, callback = null) {
        this.gameState.mode = 'text';
        this.scene.launch('Dialogue', {
            text, callback: () => { this.gameState.mode = 'walk'; if (callback) callback(); }
        });
        if (this.scene.isActive('Overworld')) this.scene.pause();
    }

    // ── Name Entry – FIXED: uses 'step' instead of 'prompt' ──────────────
    enterName(callback, step = 'player') {
        this.gameState.mode = 'naming';
        this.gameState.inputLocked = true;
        this.scene.launch('NameEntry', {
            step: step,        // 'player' or 'rival' – NameEntryScene uses this
            callback: (name) => {
                this.gameState.mode = 'walk';
                this.gameState.inputLocked = false;
                callback(name);
            }
        });
        if (this.scene.isActive('Overworld')) this.scene.pause();
    }

    // ═══════════════════════════════════════════════════════════════════════════
    //  Intro Sequence – using EventQueue (from engine/EventQueue.js)
    // ═══════════════════════════════════════════════════════════════════════════
    startIntroSequence() {
        this.gameState.inputLocked = true;
        const scene = this;

        // Sam starts at (8,22) – far right, walks left to (3,22)
        const samStart = { x: 8, y: 22 };
        this.samSprite = this.add.sprite(
            samStart.x * TILE_SIZE + TILE_SIZE/2,
            samStart.y * TILE_SIZE + TILE_SIZE/2,
            'sam'
        );
        this.samSprite.setOrigin(0.5).setDepth(2);

        // Path: 8->7->6->5->4->3
        const path = [
            {x:7, y:22}, {x:6, y:22}, {x:5, y:22},
            {x:4, y:22}, {x:3, y:22}
        ];

        const eq = new EventQueue(this);

        eq
        .moveNpc(this.samSprite, path)
        .message('"Wait! Stop right there!"')
        .message('"Don\'t peruse those shelves! It\'s unsafe! Wild Bibliomon live in tall stacks! Let me show you how to handle them."')
        .message('"But first, what was your name again?"')
        .run(() => {
            eq.pause();
            scene.enterName((name) => {
                scene.gameState.playerName = name;
                eq.resume();
            }, 'player');  // step: 'player'
        })
        .message(`"Ah yes, ${scene.gameState.playerName || 'you'}. And what should I call your fellow student?"`)
        .run(() => {
            eq.pause();
            scene.enterName((rivalName) => {
                scene.gameState.rivalName = rivalName;
                saveGameData();
                eq.resume();
            }, 'rival');   // step: 'rival'
        })
        .message('A wild Bibliomon appeared!')
        .message('Sam used a Library Card!')
        .message('Gotcha! Artificial Intelligence: A Modern Approach was caught!')
        .run(() => {
            if (scene.samSprite) {
                scene.samSprite.destroy();
                scene.samSprite = null;
            }
            scene.gameState.player.tileX = 11;
            scene.gameState.player.tileY = 26;
            scene.gameState.player.facing = 'left';
            scene.player.setPosition(11 * TILE_SIZE + TILE_SIZE/2, 26 * TILE_SIZE + TILE_SIZE/2);
        })
        .wait(400)
        .run(() => {
            const bookId = 'ai_modern_approach_base';
            scene.gameState.backpack.push(createBookInstance(bookId, 5));
            scene.showMessage(`You received ${ALL_BOOKS[bookId].name}!`);
        })
        .wait(1200)
        .run(() => {
            scene.rivalSprite = scene.add.sprite(
                14 * TILE_SIZE + TILE_SIZE/2,
                26 * TILE_SIZE + TILE_SIZE/2,
                'rival'
            );
            scene.rivalSprite.setOrigin(0.5).setDepth(2);
        })
        .moveNpc(scene.rivalSprite, [{x:13,y:26}, {x:12,y:26}, {x:11,y:26}])
        .message(`"Hey! I already have a special Bibliomon. I don\'t need those old things!"`, ['Who are you?'])
        .message(`"I\'m a fellow student, ${scene.gameState.rivalName || 'Friend'}! And this is my partner – The Creative Spark: Human Ingenuity!"`)
        .message('"A machine may learn, but true creativity is human. See you in the stacks!"')
        .run(() => {
            const rivalBook = createBookInstance('rival_special_base', 5);
            const rivalName = scene.gameState.rivalName || 'Friend';

            scene.gameState.gymState = { phase: 'rival_intro' };
            scene.gameState.mode = 'battle';
            scene.gameState.battle = {
                type: 'trainer',
                opponent: rivalBook,
                trainer: {
                    id: 'rival_intro',
                    name: rivalName,
                    dialogue: `"I'm ${rivalName}! Let's test our new Bibliomon right now!"`,
                    books: [{ id: 'rival_special_base', level: 5 }]
                },
                trainerBookIndex: 0
            };
            scene.scene.launch('Battle', { battleType: 'trainer', opponent: rivalBook, trainer: scene.gameState.battle.trainer });
            scene.scene.pause();

            if (scene.rivalSprite) {
                scene.rivalSprite.destroy();
                scene.rivalSprite = null;
            }
            eq.done = true;
        });

        eq.start(() => {
            // The intro continues after the rival battle – handled by onRivalBattleEnd
        });
    }

    onRivalBattleEnd() {
        this.showMessage('Sam: "Good luck, both of you! The Library is now open. Go forth and research!"', () => {
            this.gameState.introCompleted = true;
            saveGameData();
            this.gameState.mode = 'walk';
            this.gameState.inputLocked = false;
            this.gameState.gymState = null;
        });
    }

    moveAlongPath(sprite, path, index, onDone) {
        if (index >= path.length) { if (onDone) onDone(); return; }
        this.tweens.add({
            targets: sprite,
            x: path[index].x * TILE_SIZE + TILE_SIZE / 2, y: path[index].y * TILE_SIZE + TILE_SIZE / 2,
            duration: 100, ease: 'Linear',
            onComplete: () => { this.moveAlongPath(sprite, path, index + 1, onDone); }
        });
    }

    // ── Helper – launch Dialogue without double‑pausing ─────────────────
    launchDialogue(text, callback, choices = null) {
        this.scene.launch('Dialogue', {
            text, choices,
            choiceCallback: choices ? () => { if (callback) callback(); } : null,
            callback: choices ? null : (callback || null)
        });
        if (this.scene.isActive('Overworld')) this.scene.pause();
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  Gym Challenge (Floor 1)
    // ═══════════════════════════════════════════════════════════════════════
    startGymChallenge() {
        if (this.gameState.gym1Defeated) { this.showMessage('You have already conquered the Special Collections Gym.'); return; }
        this.gameState.gymState = { phase: 'intro', trainerIndex: 0 };
        this.showMessage('Welcome to the Special Collections Gym!', () => this.startNextGymBattle());
    }

    startNextGymBattle() {
        const gs = this.gameState.gymState;
        const scene = this;
        let trainerData = null;
        if (gs.phase === 'intro' || gs.phase === 'trainer1') {
            trainerData = GYM1_TRAINERS[0]; gs.phase = 'trainer1'; gs.trainerIndex = 0;
        } else if (gs.phase === 'trainer2') {
            trainerData = GYM1_TRAINERS[1]; gs.trainerIndex = 1;
        } else if (gs.phase === 'leader') {
            trainerData = GYM1_LEADER;
        } else { return; }

        scene.scene.launch('Dialogue', {
            text: trainerData.dialogue,
            callback: () => {
                const opponent = createBookInstance(trainerData.books[0].id, trainerData.books[0].level);
                scene.gameState.mode = 'battle';
                scene.gameState.battle = { type: 'trainer', opponent, trainer: trainerData, trainerBookIndex: 0 };
                scene.scene.launch('Battle', { battleType: 'trainer', opponent, trainer: trainerData });
                scene.scene.pause();
            }
        });
        if (scene.scene.isActive('Overworld')) scene.scene.pause();
    }

    onGymBattleEnd() {
        const gs = this.gameState.gymState;
        if (!gs) return;
        if (gs.phase === 'trainer1') { gs.phase = 'trainer2'; this.startNextGymBattle(); }
        else if (gs.phase === 'trainer2') { gs.phase = 'leader'; this.startNextGymBattle(); }
        else if (gs.phase === 'leader') {
            this.gameState.gym1Defeated = true;
            this.gameState.badges.push('archive_badge');
            this.gameState.gymState = null;
            saveGameData();
            this.showMessage('Head Archivist Miriam: "Impressive research. You have earned the Archive Badge!"');
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  Main Loop
    // ═══════════════════════════════════════════════════════════════════════
    update(time, delta) {
        const p = this.gameState.player;
        if (this.gameState.mode !== 'walk' || this.gameState.inputLocked || p.isMoving) return;

        let dx = 0, dy = 0;
        if (this.cursors.up.isDown    || this.wasd.up.isDown)    dy = -1;
        else if (this.cursors.down.isDown  || this.wasd.down.isDown)  dy = 1;
        else if (this.cursors.left.isDown  || this.wasd.left.isDown)  dx = -1;
        else if (this.cursors.right.isDown || this.wasd.right.isDown) dx = 1;

        if (dx !== 0 || dy !== 0) this.attemptMove(dx, dy);

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
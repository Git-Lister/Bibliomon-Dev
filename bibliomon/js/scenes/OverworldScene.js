class OverworldScene extends Phaser.Scene {
    constructor() {
        super('Overworld');
    }

    create() {
        this.cameras.main.setBackgroundColor('#1a1a1a');
        this.gameState = window.gameState;
        this.buildMap();
        this.createPlayer();
        this.setupInput();

        // Simple save stub – replace with real implementation later
        window.saveGameData = () => {
            console.log('Game saved (stub)');
        };
    }

    buildMap() {
        const mapData = this.gameState.currentMap === 'ground' ? GROUND_MAP : FLOOR1_MAP;

        // Destroy old tiles if scene restarts
        if (this.allTiles) this.allTiles.clear(true, true);
        this.allTiles = this.add.group();

        for (let r = 0; r < mapData.length; r++) {
            for (let c = 0; c < mapData[r].length; c++) {
                const tile = mapData[r][c];
                if (tile === '.') continue; // floor is the background colour

                let texKey = tile;
                if (tile.startsWith('P')) texKey = tile; // P>, P<, etc.

                // Only add image if the texture exists
                if (this.textures.exists(texKey)) {
                    const img = this.add.image(c * 16 + 8, r * 16 + 8, texKey);
                    img.setOrigin(0.5);
                    this.allTiles.add(img);
                }
            }
        }

        // Add interactive zones for trainers and bookshelves
        this.trainers = this.add.group();
        this.bookshelves = this.add.group();

        for (let r = 0; r < mapData.length; r++) {
            for (let c = 0; c < mapData[r].length; c++) {
                const tile = mapData[r][c];

                if (tile === 'S') {
                    const zone = this.add.zone(c * 16 + 8, r * 16 + 8, 16, 16);
                    this.physics.add.existing(zone, false);
                    zone.body.setSize(16, 16);
                    zone.body.setImmovable(true);
                    this.bookshelves.add(zone);
                }

                if (tile === 'T' && this.gameState.currentMap === 'ground') {
                    const trainer = this.gameState.trainerMap?.[`${c},${r}`];
                    if (trainer && !this.gameState.defeatedTrainers.includes(trainer.id)) {
                        const zone = this.add.zone(c * 16 + 8, r * 16 + 8, 16, 16);
                        this.physics.add.existing(zone, false);
                        zone.body.setSize(16, 16);
                        zone.body.setImmovable(true);
                        zone.trainerData = trainer;
                        this.trainers.add(zone);
                    }
                }
            }
        }

        // Barrier collision (if puzzle not solved)
        if (this.gameState.currentMap === 'ground' && !this.gameState.puzzleSolved) {
            for (let r = 0; r < mapData.length; r++) {
                for (let c = 0; c < mapData[r].length; c++) {
                    if (mapData[r][c] === 'B') {
                        this.barrier = this.add.zone(c * 16 + 8, r * 16 + 8, 16, 16);
                        this.physics.add.existing(this.barrier, false);
                        this.barrier.body.setSize(16, 16);
                        this.barrier.body.setImmovable(true);
                    }
                }
            }
        } else {
            this.barrier = null;
        }
    }

    createPlayer() {
        const startX = this.gameState.playerPos.x * 16 + 8 || 20 * 16 + 8;
        const startY = this.gameState.playerPos.y * 16 + 8 || 29 * 16 + 8;

        this.player = this.physics.add.sprite(startX, startY, 'player');
        this.player.setOrigin(0.5);
        this.player.setCollideWorldBounds(true);
        this.player.body.setSize(12, 12);
        this.player.setDepth(2);

        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
        this.cameras.main.setBounds(0, 0, 40 * 16, 30 * 16);

        if (this.barrier) {
            this.physics.add.collider(this.player, this.barrier);
        }
        this.physics.add.overlap(this.player, this.bookshelves, this.onBookshelfStep, null, this);
        this.physics.add.overlap(this.player, this.trainers, this.onTrainerStep, null, this);
    }

    setupInput() {
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = {
            up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
            down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
            left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
            right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
        };
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
        this.escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
        this.lastMoveTime = 0;
        this.moveDelay = 140;
    }

    getTileAt(col, row) {
        const map = this.gameState.currentMap === 'ground' ? GROUND_MAP : FLOOR1_MAP;
        if (col < 0 || col >= 40 || row < 0 || row >= 30) return 'W';
        const line = map[row];
        if (line[col] === 'P' && col + 1 < line.length && '>v<^'.includes(line[col+1])) {
            return 'P' + line[col+1];
        }
        return line[col];
    }

    onBookshelfStep(player, zone) {
        if (this.gameState.mode !== 'walk' || this.gameState.inputLocked) return;
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

    onTrainerStep(player, zone) {
        if (this.gameState.mode !== 'walk' || this.gameState.inputLocked) return;
        const trainer = zone.trainerData;
        if (!trainer || this.gameState.defeatedTrainers.includes(trainer.id)) return;
        this.gameState.mode = 'battle';
        const opponent = createBookInstance(trainer.books[0].id, trainer.books[0].level);
        this.gameState.battle = { type: 'trainer', opponent: opponent, trainer: trainer, trainerBookIndex: 0 };
        this.scene.launch('Battle', { battleType: 'trainer', opponent: opponent, trainer: trainer });
        this.scene.pause();
    }

    startSpinTile(col, row, tile) {
        this.gameState.inputLocked = true;
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
                onComplete: () => {
                    this.gameState.playerPos.x = nextCol;
                    this.gameState.playerPos.y = nextRow;
                    if (nextTile === 'X') {
                        this.gameState.puzzleSolved = true;
                        this.gameState.inputLocked = false;
                        this.showMessage('The directional study carrels align! A lock clicks open nearby.');
                        window.saveGameData();
                        if (this.barrier) this.barrier.destroy();
                        // Re-draw barrier tile? For now, just remove collision.
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
        switch(tile) {
            case 'P>': return {x:1,y:0};
            case 'P<': return {x:-1,y:0};
            case 'P^': return {x:0,y:-1};
            case 'Pv': return {x:0,y:1};
            default: return null;
        }
    }

    handleInteraction() {
        if (this.gameState.mode !== 'walk') return;
        const col = Math.round((this.player.x - 8) / 16);
        const row = Math.round((this.player.y - 8) / 16);
        let tx = col, ty = row;
        switch(this.gameState.facing) {
            case 'up': ty--; break;
            case 'down': ty++; break;
            case 'left': tx--; break;
            case 'right': tx++; break;
        }
        const tile = this.getTileAt(tx, ty);
        if (tile === 'H') {
            this.gameState.backpack.forEach(b => b.currentHP = b.maxHP);
            this.showMessage('All books restored. Opening Library Account...');
            this.scene.launch('Menu', { mode: 'account' });
            this.scene.pause();
        } else if (tile === 'K') {
            this.gameState.backpack.forEach(b => b.currentHP = b.maxHP);
            window.saveGameData();
            this.showMessage('Kitchenette break! Party healed and game saved.');
        } else if (tile === 'V') {
            let slot = this.gameState.items.find(i => i.itemId === 'potion');
            if (!slot) { slot = { itemId:'potion', qty:0 }; this.gameState.items.push(slot); }
            if (slot.qty < 20) { slot.qty++; this.showMessage('Obtained a Potion!'); }
            else { this.showMessage('Inventory full for Potions.'); }
        } else if (tile === 'C') {
            let slot = this.gameState.items.find(i => i.itemId === 'super_potion');
            if (!slot) { slot = { itemId:'super_potion', qty:0 }; this.gameState.items.push(slot); }
            if (slot.qty < 20) { slot.qty++; this.showMessage('Obtained a Super Potion!'); }
            else { this.showMessage('Inventory full for Super Potions.'); }
        } else if (tile === 'L') {
            this.showMessage('Opening Library Account...');
            this.scene.launch('Menu', { mode: 'account' });
            this.scene.pause();
        } else if (tile === 'G') {
            if (this.gameState.gym1Defeated) {
                this.showMessage('You already conquered the Special Collections Gym.');
            } else {
                this.startGymChallenge();
            }
        }
    }

    showMessage(text) {
        this.gameState.overworldMessage = text;
        this.gameState.mode = 'text';
        console.log(text);
    }

    startGymChallenge() {
        console.log('Gym challenge started.');
    }

    update(time, delta) {
        if (this.gameState.mode !== 'walk' || this.gameState.inputLocked) {
            this.player.setVelocity(0);
            return;
        }

        const left = this.cursors.left.isDown || this.wasd.left.isDown;
        const right = this.cursors.right.isDown || this.wasd.right.isDown;
        const up = this.cursors.up.isDown || this.wasd.up.isDown;
        const down = this.cursors.down.isDown || this.wasd.down.isDown;

        if (time - this.lastMoveTime > this.moveDelay) {
            let dx = 0, dy = 0;
            if (up) { dy = -1; this.gameState.facing = 'up'; }
            else if (down) { dy = 1; this.gameState.facing = 'down'; }
            else if (left) { dx = -1; this.gameState.facing = 'left'; }
            else if (right) { dx = 1; this.gameState.facing = 'right'; }

            if (dx !== 0 || dy !== 0) {
                const col = Math.round((this.player.x - 8) / 16) + dx;
                const row = Math.round((this.player.y - 8) / 16) + dy;
                const tile = this.getTileAt(col, row);

                if (tile === 'W') return;
                if (tile === 'B' && !this.gameState.puzzleSolved) {
                    this.showMessage('The barrier is locked. Solve the puzzle first.');
                    return;
                }
                if (tile.startsWith('P')) {
                    this.startSpinTile(col, row, tile);
                    this.lastMoveTime = time;
                    return;
                }
                if (tile === 'E') {
                    if (this.gameState.currentMap === 'ground' && this.gameState.puzzleSolved) {
                        this.gameState.currentMap = 'floor1';
                        this.gameState.playerPos = { x: 37, y: 3 };
                        this.scene.restart();
                    } else if (this.gameState.currentMap === 'floor1') {
                        this.gameState.currentMap = 'ground';
                        this.gameState.playerPos = { x: 35, y: 3 };
                        this.scene.restart();
                    } else {
                        this.showMessage('Solve the puzzle first.');
                    }
                    return;
                }

                this.tweens.add({
                    targets: this.player,
                    x: col * 16 + 8,
                    y: row * 16 + 8,
                    duration: 100,
                    onComplete: () => {
                        this.gameState.playerPos.x = col;
                        this.gameState.playerPos.y = row;
                    }
                });
                this.lastMoveTime = time;
            }
        }

        if (Phaser.Input.Keyboard.JustDown(this.spaceKey) || Phaser.Input.Keyboard.JustDown(this.enterKey)) {
            this.handleInteraction();
        }
        if (Phaser.Input.Keyboard.JustDown(this.escKey)) {
            this.scene.launch('Menu', { mode: 'pause' });
            this.scene.pause();
        }
    }
}
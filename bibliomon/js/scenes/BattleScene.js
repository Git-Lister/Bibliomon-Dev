class BattleScene extends Phaser.Scene {
    constructor() {
        super('Battle');
    }

    init(data) {
        this.battleType = data.battleType;
        this.opponent = data.opponent;
        this.trainer = data.trainer;
    }

    create() {
        this.gameState = window.gameState;
        // Build battle state
        const b = {
            type: this.battleType,
            opponent: this.opponent,
            trainer: this.trainer || null,
            trainerBookIndex: 0,
            playerBook: this.gameState.backpack[this.gameState.activeBookIndex],
            playerStages: { atk:0, def:0, spAtk:0, spDef:0, spd:0 },
            opponentStages: { atk:0, def:0, spAtk:0, spDef:0, spd:0 },
            playerConfused: false, playerConfusedTurns: 0,
            opponentConfused: false, opponentConfusedTurns: 0,
            playerOverdue: false, opponentOverdue: false,
            menuMode: 'main', selectionIdx: 0, log: [], currentMsg: '',
            participants: new Set([this.gameState.backpack[this.gameState.activeBookIndex].id]),
            battleOver: false, processingFaint: false
        };
        this.gameState.battle = b;
        this.gameState.mode = 'battle';

        // Flash
        this.cameras.main.flash(300, 255, 255, 255);

        // Draw UI
        this.createUI();

        // Start dialogue
        if (this.battleType === 'wild') {
            queueMsg(`A wild [${b.opponent.name}] appeared!`);
        } else {
            queueMsg(`Trainer ${b.trainer.name} wants to battle!`);
            queueMsg(`"${b.trainer.dialogue}"`);
        }
        advanceLog();
        this.updateUI();

        // Input
        this.input.keyboard.on('keydown', this.handleInput, this);
    }

    createUI() {
        // Background
        this.add.rectangle(320, 240, 640, 480, 0x000000);

        // Opponent area (top right)
        this.opponentSprite = this.add.image(420, 100, `book_front_${this.opponent.type}`).setOrigin(0.5);
        this.opponentName = this.add.text(300, 40, this.opponent.name, { fontFamily: 'monospace', fontSize: '14px', fill: '#fff' });
        this.opponentLevel = this.add.text(300, 60, `Lv.${this.opponent.level}`, { fontFamily: 'monospace', fontSize: '12px', fill: '#aaa' });
        this.opponentHpBarBg = this.add.rectangle(420, 140, 100, 6, 0x666666).setOrigin(0.5);
        this.opponentHpBar = this.add.rectangle(420, 140, 100, 6, 0x22cc22).setOrigin(0.5);

        // Player area (bottom left)
        this.playerSprite = this.add.image(160, 340, 'book_back').setOrigin(0.5);
        this.playerName = this.add.text(40, 260, this.gameState.battle.playerBook.name, { fontFamily: 'monospace', fontSize: '14px', fill: '#fff' });
        this.playerLevel = this.add.text(40, 280, `Lv.${this.gameState.battle.playerBook.level}`, { fontFamily: 'monospace', fontSize: '12px', fill: '#aaa' });
        this.playerHpBarBg = this.add.rectangle(160, 370, 100, 6, 0x666666).setOrigin(0.5);
        this.playerHpBar = this.add.rectangle(160, 370, 100, 6, 0x22cc22).setOrigin(0.5);
        this.playerHpText = this.add.text(40, 390, `HP: ${this.gameState.battle.playerBook.currentHP}/${this.gameState.battle.playerBook.maxHP}`, { fontFamily: 'monospace', fontSize: '11px', fill: '#fff' });

        // Message box (bottom)
        this.msgBoxBg = this.add.rectangle(320, 430, 600, 80, 0x111111).setOrigin(0.5).setStrokeStyle(2, 0xffffff);
        this.msgText = this.add.text(40, 400, '', { fontFamily: 'monospace', fontSize: '12px', fill: '#fff', wordWrap: { width: 560 } });

        // Command menu (right side of player area) – 5 items vertical list
        this.menuItems = ['FIGHT', 'BORROW', 'ITEM', 'RETURN', 'FLEE'];
        this.menuTexts = [];
        for (let i = 0; i < this.menuItems.length; i++) {
            const t = this.add.text(500, 260 + i * 20, this.menuItems[i], { fontFamily: 'monospace', fontSize: '12px', fill: '#fff' });
            this.menuTexts.push(t);
        }
        this.menuCursor = this.add.text(480, 260, '▶', { fontFamily: 'monospace', fontSize: '12px', fill: '#ff0' });

        // Sub-menu groups (hidden initially)
        this.subMenuGroup = this.add.group();
        this.mode = 'main'; // 'main', 'moves', 'items', 'switch', 'message'
        this.subSelection = 0;
    }

    updateUI() {
        const b = this.gameState.battle;
        // Update HP bars
        let oppPct = Math.max(0, b.opponent.currentHP / b.opponent.maxHP);
        this.opponentHpBar.setScale(oppPct, 1);
        this.opponentHpBar.setFillStyle(oppPct > 0.5 ? 0x22cc22 : oppPct > 0.2 ? 0xcccc22 : 0xcc2222);

        let playerPct = Math.max(0, b.playerBook.currentHP / b.playerBook.maxHP);
        this.playerHpBar.setScale(playerPct, 1);
        this.playerHpBar.setFillStyle(playerPct > 0.5 ? 0x22cc22 : playerPct > 0.2 ? 0xcccc22 : 0xcc2222);
        this.playerHpText.setText(`HP: ${b.playerBook.currentHP}/${b.playerBook.maxHP}`);

        // Show current message
        this.msgText.setText(b.currentMsg || '');

        // Show/hide menus based on mode
        this.menuTexts.forEach(t => t.setVisible(this.mode === 'main'));
        this.menuCursor.setVisible(this.mode === 'main');
        this.subMenuGroup.clear(true, true);

        if (this.mode === 'main') {
            this.menuCursor.setY(260 + b.selectionIdx * 20);
        } else if (this.mode === 'moves') {
            const moves = b.playerBook.moves;
            for (let i = 0; i < moves.length; i++) {
                const mv = MOVES[moves[i]];
                const txt = this.add.text(400, 260 + i * 20, `${mv.name} (${mv.type})`, { fontFamily: 'monospace', fontSize: '11px', fill: '#fff' });
                this.subMenuGroup.add(txt);
            }
            // cursor for moves
            const cursor = this.add.text(380, 260 + this.subSelection * 20, '▶', { fontFamily: 'monospace', fontSize: '11px', fill: '#ff0' });
            this.subMenuGroup.add(cursor);
        } else if (this.mode === 'items') {
            const items = getUsableItemsList();
            if (items.length === 0) {
                this.subMenuGroup.add(this.add.text(400, 260, 'No items', { fontFamily: 'monospace', fontSize: '11px', fill: '#888' }));
            } else {
                for (let i = 0; i < items.length; i++) {
                    const txt = this.add.text(400, 260 + i * 20, `${items[i].itemId} x${items[i].qty}`, { fontFamily: 'monospace', fontSize: '11px', fill: '#fff' });
                    this.subMenuGroup.add(txt);
                }
                const cursor = this.add.text(380, 260 + this.subSelection * 20, '▶', { fontFamily: 'monospace', fontSize: '11px', fill: '#ff0' });
                this.subMenuGroup.add(cursor);
            }
        } else if (this.mode === 'switch') {
            const party = this.gameState.backpack;
            for (let i = 0; i < party.length; i++) {
                const bk = party[i];
                const txt = this.add.text(400, 260 + i * 18, `${bk.name} Lv.${bk.level} HP:${bk.currentHP}/${bk.maxHP}`, { fontFamily: 'monospace', fontSize: '10px', fill: bk.currentHP > 0 ? '#fff' : '#888' });
                this.subMenuGroup.add(txt);
            }
            const cursor = this.add.text(380, 260 + this.subSelection * 18, '▶', { fontFamily: 'monospace', fontSize: '10px', fill: '#ff0' });
            this.subMenuGroup.add(cursor);
        }
    }

    handleInput(event) {
        const b = this.gameState.battle;
        if (b.battleOver) return;

        if (b.menuMode === 'message') {
            if (event.code === 'Enter' || event.code === 'Space') {
                advanceLog();
                this.updateUI();
                // If blackout, warp
                if (b.battleOver && b.playerBook.currentHP <= 0 && this.gameState.backpack.every(bk => bk.currentHP <= 0)) {
                    this.time.delayedCall(500, () => this.blackoutWarp());
                } else if (b.battleOver) {
                    this.time.delayedCall(300, () => this.returnToOverworld());
                }
            }
            return;
        }

        if (this.mode === 'main') {
            if (event.code === 'ArrowUp') b.selectionIdx = (b.selectionIdx - 1 + 5) % 5;
            else if (event.code === 'ArrowDown') b.selectionIdx = (b.selectionIdx + 1) % 5;
            else if (event.code === 'Enter' || event.code === 'Space') {
                switch (b.selectionIdx) {
                    case 0: this.mode = 'moves'; this.subSelection = 0; break;
                    case 1: handleBorrowAttempt(); break;
                    case 2: this.mode = 'items'; this.subSelection = 0; break;
                    case 3: this.mode = 'switch'; this.subSelection = 0; break;
                    case 4: handleEscapeAttempt(); break;
                }
            }
        } else if (this.mode === 'moves') {
            const moves = b.playerBook.moves;
            if (event.code === 'ArrowUp') this.subSelection = (this.subSelection - 1 + moves.length) % moves.length;
            else if (event.code === 'ArrowDown') this.subSelection = (this.subSelection + 1) % moves.length;
            else if (event.code === 'Enter' || event.code === 'Space') {
                executeBattleTurn(moves[this.subSelection]);
                this.mode = 'message';
            } else if (event.code === 'Escape') {
                this.mode = 'main';
            }
        } else if (this.mode === 'items') {
            const items = getUsableItemsList();
            if (items.length === 0) {
                if (event.code === 'Escape') this.mode = 'main';
                return;
            }
            if (event.code === 'ArrowUp') this.subSelection = (this.subSelection - 1 + items.length) % items.length;
            else if (event.code === 'ArrowDown') this.subSelection = (this.subSelection + 1) % items.length;
            else if (event.code === 'Enter' || event.code === 'Space') {
                handleBattleItemUse(this.subSelection);
                this.mode = 'message';
            } else if (event.code === 'Escape') {
                this.mode = 'main';
            }
        } else if (this.mode === 'switch') {
            const party = this.gameState.backpack;
            if (event.code === 'ArrowUp') this.subSelection = (this.subSelection - 1 + party.length) % party.length;
            else if (event.code === 'ArrowDown') this.subSelection = (this.subSelection + 1) % party.length;
            else if (event.code === 'Enter' || event.code === 'Space') {
                if (this.subSelection !== this.gameState.activeBookIndex && party[this.subSelection].currentHP > 0) {
                    processDirectSwap(this.subSelection);
                    this.mode = 'message';
                }
            } else if (event.code === 'Escape') {
                this.mode = 'main';
            }
        }
        this.updateUI();
    }

    returnToOverworld() {
        this.gameState.mode = 'walk';
        this.scene.stop();
        this.scene.resume('Overworld');
    }

    blackoutWarp() {
        // Find Help Desk on ground floor
        let hCol = 3, hRow = 24;
        for (let r = 0; r < GROUND_MAP.length; r++) {
            for (let c = 0; c < GROUND_MAP[r].length; c++) {
                if (GROUND_MAP[r][c] === 'H') { hCol = c; hRow = r; break; }
            }
        }
        this.gameState.backpack.forEach(b => { b.currentHP = b.maxHP; });
        this.gameState.player.tileX = hCol;
        this.gameState.player.tileY = hRow;
        this.gameState.currentMap = 'ground';
        this.gameState.mode = 'walk';
        this.scene.stop();
        this.scene.start('Overworld'); // restart overworld with new position
    }

    // We need to include handleBattleItemUse here since it's called from input
    // but it's defined in battleLogic? Actually we'll place it in battleLogic too, but it references gameState.battle, so it's fine.
    // We'll just paste it here as a method that delegates to the global function.
    handleBattleItemUse(idx) {
        // defined globally in battleLogic
        window.handleBattleItemUse(idx);
    }
}
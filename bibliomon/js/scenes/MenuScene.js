class MenuScene extends Phaser.Scene {
    constructor() {
        super('Menu');
    }

    init(data) {
        this.menuMode = data.mode;           // 'pause' or 'account'
        this.gameState = window.gameState;
    }

    create() {
        // Dim the overworld background
        this.add.rectangle(320, 240, 640, 480, 0x000000, 0.85).setOrigin(0.5);

        // Outer double‑line border
        const outer = this.add.graphics();
        outer.lineStyle(2, 0xffffff, 1);
        outer.strokeRect(20, 20, 600, 440);
        const inner = this.add.graphics();
        inner.lineStyle(1, 0x888888, 1);
        inner.strokeRect(24, 24, 592, 432);

        // Title text
        this.titleText = this.add.text(320, 40, '', {
            fontFamily: 'monospace', fontSize: '18px', fill: '#ffcc00'
        }).setOrigin(0.5);

        // Container for menu items (will be populated differently depending on mode)
        this.menuItems = [];
        this.selectedIndex = 0;

        // For account mode: which column is active and its selection
        this.column = 'backpack';    // 'backpack' or 'storage'
        this.backpackIndex = 0;
        this.storageIndex = 0;

        this.cursors = this.input.keyboard.createCursorKeys();
        this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
        this.escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

        this.buildUI();
    }

    // ── Build the correct UI based on menuMode ──────────────────────────
    buildUI() {
        this.menuItems.forEach(item => item.destroy());
        this.menuItems = [];

        if (this.menuMode === 'pause') {
            this.titleText.setText('PAUSE');
            const options = ['Backpack', 'Items', 'Save Game', 'Close'];
            options.forEach((opt, i) => {
                const txt = this.add.text(100, 100 + i * 50, opt, {
                    fontFamily: 'monospace', fontSize: '16px', fill: '#ffffff'
                });
                this.menuItems.push(txt);
            });
            this.updatePauseCursor();
        } else if (this.menuMode === 'account') {
            this.titleText.setText('LIBRARY ACCOUNT');
            this.drawAccountScreen();
        }
    }

    // ── Pause menu cursor movement ──────────────────────────────────────
    updatePauseCursor() {
        this.menuItems.forEach((item, i) => {
            if (i === this.selectedIndex) {
                item.setText('▶ ' + item.text.replace('▶ ', ''));
                item.setColor('#ffcc00');
            } else {
                item.setText('  ' + item.text.replace('▶ ', '').replace('  ', ''));
                item.setColor('#ffffff');
            }
        });
    }

    // ── Draw the two‑column Library Account screen ─────────────────────
    drawAccountScreen() {
        // Column headers
        this.add.text(80, 80, 'ACTIVE BACKPACK (Max 6)', {
            fontFamily: 'monospace', fontSize: '12px', fill: '#ffcc00'
        });
        this.add.text(400, 80, 'LONG‑TERM STORAGE', {
            fontFamily: 'monospace', fontSize: '12px', fill: '#ffcc00'
        });

        // Divider line
        const divider = this.add.graphics();
        divider.lineStyle(1, 0x555555, 1);
        divider.moveTo(350, 70);
        divider.lineTo(350, 420);
        divider.strokePath();

        this.drawAccountLists();
    }

    drawAccountLists() {
        // Remove old account items
        if (this.accountItems) {
            this.accountItems.forEach(item => item.destroy());
        }
        this.accountItems = [];

        const backpack = this.gameState.backpack;
        const storage = this.gameState.libraryAccount;

        // Draw backpack column
        backpack.forEach((book, i) => {
            const y = 110 + i * 24;
            const prefix = (this.column === 'backpack' && this.backpackIndex === i) ? '▶ ' : '  ';
            const txt = this.add.text(60, y,
                `${prefix}${book.name} Lv.${book.level} HP:${book.currentHP}/${book.maxHP}`,
                { fontFamily: 'monospace', fontSize: '10px', fill: '#ffffff' }
            );
            this.accountItems.push(txt);
        });

        // Draw storage column
        storage.forEach((book, i) => {
            const y = 110 + i * 24;
            const prefix = (this.column === 'storage' && this.storageIndex === i) ? '▶ ' : '  ';
            const txt = this.add.text(370, y,
                `${prefix}${book.name} Lv.${book.level}`,
                { fontFamily: 'monospace', fontSize: '10px', fill: '#aaaaaa' }
            );
            this.accountItems.push(txt);
        });

        // Instructions at the bottom
        this.add.text(60, 430, '← → : Switch column    ↑ ↓ : Select    ENTER : Transfer    ESC : Close', {
            fontFamily: 'monospace', fontSize: '10px', fill: '#888888'
        });
    }

    // ── Input handling ──────────────────────────────────────────────────
    update() {
        // ── Sub‑menus (Backpack view, Items view) ──────────────────────────
        if (this.menuMode === 'backpack_view' || this.menuMode === 'items_view') {
            if (Phaser.Input.Keyboard.JustDown(this.escKey)) {
                // Return to the main pause menu
                this.menuMode = 'pause';
                this.buildUI();
            }
            return;
        }

        // ── Pause menu ──────────────────────────────────────────────────────
        if (this.menuMode === 'pause') {
            if (Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
                this.selectedIndex = (this.selectedIndex - 1 + this.menuItems.length) % this.menuItems.length;
                this.updatePauseCursor();
            } else if (Phaser.Input.Keyboard.JustDown(this.cursors.down)) {
                this.selectedIndex = (this.selectedIndex + 1) % this.menuItems.length;
                this.updatePauseCursor();
            } else if (Phaser.Input.Keyboard.JustDown(this.enterKey)) {
                this.handlePauseSelection();
            } else if (Phaser.Input.Keyboard.JustDown(this.escKey)) {
                this.closeMenu();
            }
            return;
        }

        // Account menu input
        if (this.menuMode === 'account') {
            if (Phaser.Input.Keyboard.JustDown(this.escKey)) {
                this.closeMenu();
                return;
            }

            if (Phaser.Input.Keyboard.JustDown(this.cursors.left)) {
                this.column = 'backpack';
                this.drawAccountLists();
            } else if (Phaser.Input.Keyboard.JustDown(this.cursors.right)) {
                this.column = 'storage';
                this.drawAccountLists();
            }

            if (Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
                if (this.column === 'backpack') {
                    this.backpackIndex = Math.max(0, this.backpackIndex - 1);
                } else {
                    this.storageIndex = Math.max(0, this.storageIndex - 1);
                }
                this.drawAccountLists();
            } else if (Phaser.Input.Keyboard.JustDown(this.cursors.down)) {
                if (this.column === 'backpack') {
                    this.backpackIndex = Math.min(this.gameState.backpack.length - 1, this.backpackIndex + 1);
                } else {
                    this.storageIndex = Math.min(this.gameState.libraryAccount.length - 1, this.storageIndex + 1);
                }
                this.drawAccountLists();
            }

            if (Phaser.Input.Keyboard.JustDown(this.enterKey)) {
                this.handleAccountTransfer();
            }
        }
    }

    handlePauseSelection() {
        switch (this.selectedIndex) {
            case 0: // Backpack
                this.showBackpack();
                break;
            case 1: // Items
                this.showItems();
                break;
            case 2: // Save
                window.saveGameData();
                this.closeMenu();
                break;
            case 3: // Close
                this.closeMenu();
                break;
        }
    }

    showBackpack() {
        this.menuMode = 'backpack_view';
        this.menuItems.forEach(item => item.destroy());
        this.menuItems = [];
        this.titleText.setText('BACKPACK');
        const books = this.gameState.backpack;
        if (books.length === 0) {
            this.menuItems.push(this.add.text(60, 100, 'No books in backpack.', {
                fontFamily: 'monospace', fontSize: '12px', fill: '#888888'
            }));
        } else {
            books.forEach((book, i) => {
                const y = 100 + i * 60;
                const txt = this.add.text(60, y,
                    `${book.name}  Lv.${book.level}  HP:${book.currentHP}/${book.maxHP}  Type:${book.type}`,
                    { fontFamily: 'monospace', fontSize: '11px', fill: '#ffffff' }
                );
                this.menuItems.push(txt);
                const movesStr = book.moves.map(m => MOVES[m]?.name || m).join(' / ');
                const movesTxt = this.add.text(60, y + 16, `Moves: ${movesStr}`, {
                    fontFamily: 'monospace', fontSize: '10px', fill: '#aaaaaa'
                });
                this.menuItems.push(movesTxt);
            });
        }
        this.menuItems.push(this.add.text(60, 440, 'Press ESC to return', {
            fontFamily: 'monospace', fontSize: '10px', fill: '#888888'
        }));
    }

    showItems() {
        this.menuMode = 'items_view';
        this.menuItems.forEach(item => item.destroy());
        this.menuItems = [];
        this.titleText.setText('ITEMS');
        const items = this.gameState.items;
        if (items.length === 0) {
            this.menuItems.push(this.add.text(60, 100, 'No items.', {
                fontFamily: 'monospace', fontSize: '12px', fill: '#888888'
            }));
        } else {
            items.forEach((item, i) => {
                const txt = this.add.text(60, 100 + i * 30,
                    `${item.itemId.replace(/_/g, ' ')}   x${item.qty}`,
                    { fontFamily: 'monospace', fontSize: '12px', fill: '#ffffff' }
                );
                this.menuItems.push(txt);
            });
        }
        this.menuItems.push(this.add.text(60, 440, 'Press ESC to return', {
            fontFamily: 'monospace', fontSize: '10px', fill: '#888888'
        }));
    }

    handleAccountTransfer() {
        if (this.column === 'backpack') {
            // Return a book from backpack to storage
            if (this.gameState.backpack.length <= 1) return; // must keep at least one
            const book = this.gameState.backpack.splice(this.backpackIndex, 1)[0];
            this.gameState.libraryAccount.push(book);
            this.backpackIndex = Math.max(0, this.backpackIndex - 1);
            this.drawAccountLists();
        } else {
            // Check out a book from storage to backpack
            if (this.gameState.libraryAccount.length === 0) return;
            if (this.gameState.backpack.length >= 6) return;
            const book = this.gameState.libraryAccount.splice(this.storageIndex, 1)[0];
            this.gameState.backpack.push(book);
            this.storageIndex = Math.max(0, this.storageIndex - 1);
            this.drawAccountLists();
        }
    }

    closeMenu() {
        this.scene.resume('Overworld');
        this.scene.stop();
    }
}
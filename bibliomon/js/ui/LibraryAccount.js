// js/ui/LibraryAccountUI.js
// Handles the Library Account (PC) system – check out / return books

class LibraryAccountUI {
    constructor(scene) {
        this.scene = scene;
        this.visible = false;
        this.container = null;
        this.selectedIndex = 0;
        this.selectedZone = 'backpack'; // 'backpack' or 'account'
        this.onClose = null;
    }

    show(onClose = null) {
        this.onClose = onClose;
        this.visible = true;
        this.selectedIndex = 0;
        this.selectedZone = 'backpack';
        this.buildUI();
        this.scene.gameState.mode = 'account';
        this.scene.inputLocked = true;
    }

    buildUI() {
        const W = this.scene.cameras.main.width;
        const H = this.scene.cameras.main.height;

        // Container
        this.container = this.scene.add.container(0, 0);
        this.container.setDepth(200);

        // Dark overlay
        const overlay = this.scene.add.graphics();
        overlay.fillStyle(0x000000, 0.8);
        overlay.fillRect(0, 0, W, H);
        this.container.add(overlay);

        // Panel
        const panel = this.scene.add.graphics();
        panel.fillStyle(0x2a2a2a, 1);
        panel.fillRoundedRect(40, 40, W - 80, H - 80, 12);
        this.container.add(panel);

        // Title
        const title = this.scene.add.text(60, 60, '📚 Library Account', {
            fontSize: '24px', fill: '#ffd700', fontStyle: 'bold', fontFamily: 'monospace'
        });
        this.container.add(title);

        // Close button
        const closeBtn = this.scene.add.text(W - 100, 60, '✕ Close', {
            fontSize: '18px', fill: '#ff6b6b', fontFamily: 'monospace'
        }).setInteractive({ useHandCursor: true });
        closeBtn.on('pointerdown', () => this.hide());
        this.container.add(closeBtn);

        // Instructions
        const instr = this.scene.add.text(60, 100, 'Select a book, then use Check Out or Return', {
            fontSize: '12px', fill: '#aaa', fontFamily: 'monospace'
        });
        this.container.add(instr);

        // Backpack section
        const bpLabel = this.scene.add.text(60, 140, 'Backpack (max 6):', {
            fontSize: '16px', fill: '#4fc3f7', fontFamily: 'monospace'
        });
        this.container.add(bpLabel);
        this.backpackList = this.scene.add.container(60, 170);
        this.container.add(this.backpackList);

        // Account section
        const accLabel = this.scene.add.text(60, 140 + (this.scene.gameState.backpack.length * 30) + 60, 'Library Account:', {
            fontSize: '16px', fill: '#81c784', fontFamily: 'monospace'
        });
        this.container.add(accLabel);
        this.accountList = this.scene.add.container(60, 170 + (this.scene.gameState.backpack.length * 30) + 90);
        this.container.add(this.accountList);

        // Buttons: Check Out, Return
        const btnY = H - 100;
        const checkoutBtn = this.scene.add.text(60, btnY, '[Check Out]', {
            fontSize: '18px', fill: '#4fc3f7', fontFamily: 'monospace'
        }).setInteractive({ useHandCursor: true });
        checkoutBtn.on('pointerdown', () => this.checkOut());
        this.container.add(checkoutBtn);

        const returnBtn = this.scene.add.text(200, btnY, '[Return]', {
            fontSize: '18px', fill: '#ffb74d', fontFamily: 'monospace'
        }).setInteractive({ useHandCursor: true });
        returnBtn.on('pointerdown', () => this.returnBook());
        this.container.add(returnBtn);

        // Render lists
        this.renderLists();
    }

    renderLists() {
        const state = this.scene.gameState;
        const backpack = state.backpack || [];
        const account = state.libraryAccount || [];

        // Clear old list items
        this.backpackList.removeAll(true);
        this.accountList.removeAll(true);

        // Render backpack
        backpack.forEach((book, index) => {
            const text = this.scene.add.text(0, index * 28, `${book.name} (Lv.${book.level})`, {
                fontSize: '14px', fill: index === this.selectedIndex && this.selectedZone === 'backpack' ? '#ffd700' : '#fff',
                fontFamily: 'monospace'
            });
            this.backpackList.add(text);
        });
        if (backpack.length === 0) {
            const text = this.scene.add.text(0, 0, '(empty)', { fontSize: '14px', fill: '#666', fontFamily: 'monospace' });
            this.backpackList.add(text);
        }

        // Render account
        account.forEach((book, index) => {
            const text = this.scene.add.text(0, index * 28, `${book.name} (Lv.${book.level})`, {
                fontSize: '14px', fill: index === this.selectedIndex && this.selectedZone === 'account' ? '#ffd700' : '#fff',
                fontFamily: 'monospace'
            });
            this.accountList.add(text);
        });
        if (account.length === 0) {
            const text = this.scene.add.text(0, 0, '(empty)', { fontSize: '14px', fill: '#666', fontFamily: 'monospace' });
            this.accountList.add(text);
        }
    }

    checkOut() {
        const state = this.scene.gameState;
        const account = state.libraryAccount || [];
        if (state.backpack.length >= 6) {
            this.showMessage('Your backpack is full!');
            return;
        }
        if (this.selectedZone !== 'account') {
            this.showMessage('Select a book from the Library Account.');
            return;
        }
        if (account.length === 0) {
            this.showMessage('No books in your Library Account.');
            return;
        }
        const book = account[this.selectedIndex];
        if (!book) return;
        // Remove from account, add to backpack
        account.splice(this.selectedIndex, 1);
        state.backpack.push(book);
        this.renderLists();
        this.showMessage(`Checked out ${book.name}!`);
    }

    returnBook() {
        const state = this.scene.gameState;
        const backpack = state.backpack || [];
        if (this.selectedZone !== 'backpack') {
            this.showMessage('Select a book from your Backpack.');
            return;
        }
        if (backpack.length === 0) {
            this.showMessage('No books in your Backpack.');
            return;
        }
        const book = backpack[this.selectedIndex];
        if (!book) return;
        // Remove from backpack, add to account
        backpack.splice(this.selectedIndex, 1);
        state.libraryAccount.push(book);
        this.renderLists();
        this.showMessage(`Returned ${book.name}!`);
    }

    showMessage(text) {
        const msg = this.scene.add.text(this.scene.cameras.main.centerX, this.scene.cameras.main.centerY, text, {
            fontSize: '18px', fill: '#ffd700', fontFamily: 'monospace', align: 'center'
        }).setOrigin(0.5).setDepth(300);
        this.scene.time.delayedCall(1500, () => msg.destroy());
    }

    hide() {
        this.visible = false;
        if (this.container) {
            this.container.destroy();
            this.container = null;
        }
        this.scene.gameState.mode = 'walk';
        this.scene.inputLocked = false;
        if (this.onClose) this.onClose();
        this.scene.scene.resume('Overworld');
    }

    updateSelection(zone, index) {
        this.selectedZone = zone;
        this.selectedIndex = index;
        this.renderLists();
    }
}
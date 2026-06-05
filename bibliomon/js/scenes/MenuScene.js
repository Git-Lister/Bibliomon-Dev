class MenuScene extends Phaser.Scene {
    constructor() {
        super('Menu');
    }

    init(data) {
        this.mode = data.mode; // 'pause' or 'account'
    }

    create() {
        this.gameState = window.gameState;
        this.createUI();
    }

    createUI() {
        if (this.mode === 'pause') {
            // Pause menu overlay
            this.add.rectangle(320, 240, 400, 300, 0x000000, 0.9).setOrigin(0.5);
            this.add.text(320, 180, 'PAUSE', { fontFamily: 'monospace', fontSize: '20px', fill: '#fff' }).setOrigin(0.5);
            // items handled via keyboard
        } else if (this.mode === 'account') {
            // Library account interface
            this.add.rectangle(320, 240, 600, 400, 0x111111, 0.95).setOrigin(0.5);
            this.add.text(320, 50, 'LIBRARY ACCOUNT', { fontFamily: 'monospace', fontSize: '18px', fill: '#ffcc00' }).setOrigin(0.5);
            // Display backpack and storage
        }
    }
}
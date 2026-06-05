class MenuScene extends Phaser.Scene {
    constructor() {
        super('Menu');
    }

    init(data) {
        this.menuMode = data.mode; // 'pause' or 'account'
    }

    create() {
        this.gameState = window.gameState;
        this.createUI();

        // Close on Escape
        this.input.keyboard.on('keydown-ESC', () => {
            this.closeMenu();
        });

        // Also allow P to close pause menu
        this.input.keyboard.on('keydown-P', () => {
            if (this.menuMode === 'pause') this.closeMenu();
        });
    }

    createUI() {
        // Dim background
        this.add.rectangle(320, 240, 640, 480, 0x000000, 0.8).setOrigin(0.5);

        if (this.menuMode === 'pause') {
            this.add.text(320, 180, 'PAUSE', {
                fontFamily: 'monospace',
                fontSize: '24px',
                fill: '#ffffff'
            }).setOrigin(0.5);
            this.add.text(320, 260, 'Press ESC to resume', {
                fontFamily: 'monospace',
                fontSize: '14px',
                fill: '#aaaaaa'
            }).setOrigin(0.5);
        } else if (this.menuMode === 'account') {
            this.add.text(320, 50, 'LIBRARY ACCOUNT', {
                fontFamily: 'monospace',
                fontSize: '18px',
                fill: '#ffcc00'
            }).setOrigin(0.5);
            this.add.text(320, 100, 'Backpack / Storage management', {
                fontFamily: 'monospace',
                fontSize: '12px',
                fill: '#ffffff'
            }).setOrigin(0.5);
            this.add.text(320, 400, 'Press ESC to close', {
                fontFamily: 'monospace',
                fontSize: '12px',
                fill: '#aaaaaa'
            }).setOrigin(0.5);
        }
    }

    closeMenu() {
        // Resume the OverworldScene and stop this one
        this.scene.resume('Overworld');
        this.scene.stop();
    }
}
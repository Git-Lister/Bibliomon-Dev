class TitleScene extends Phaser.Scene {
    constructor() {
        super('Title');
    }

    create() {
        this.cameras.main.setBackgroundColor('#1a1a1a');
        this.add.text(320, 150, 'BIBLIOMON', { fontFamily: 'monospace', fontSize: '32px', fill: '#ffcc00' }).setOrigin(0.5);
        this.add.text(320, 220, 'MMU Library Edition', { fontFamily: 'monospace', fontSize: '14px', fill: '#aaaaaa' }).setOrigin(0.5);

        const hasSave = localStorage.getItem('bibliomon_save');
        if (hasSave) {
            this.add.text(320, 320, 'Press 1 to CONTINUE', { fontFamily: 'monospace', fontSize: '14px', fill: '#ffffff' }).setOrigin(0.5);
            this.add.text(320, 360, 'Press 2 for NEW GAME', { fontFamily: 'monospace', fontSize: '14px', fill: '#ffffff' }).setOrigin(0.5);

            this.input.keyboard.on('keydown-ONE', () => {
                window.loadGameData();
                this.scene.start('Overworld');
            });
            this.input.keyboard.on('keydown-TWO', () => {
                localStorage.removeItem('bibliomon_save');
                // Reset state for fresh start
                window.gameState.cardValidated = false;
                window.gameState.introCompleted = false;
                window.gameState.backpack = [];
                window.gameState.playerName = '';
                window.gameState.rivalName = '';
                window.gameState.player.tileX = 19;
                window.gameState.player.tileY = 29;
                this.scene.start('Overworld');
            });
        } else {
            this.add.text(320, 340, 'Press ENTER to start', { fontFamily: 'monospace', fontSize: '14px', fill: '#ffffff' }).setOrigin(0.5);
            this.input.keyboard.on('keydown-ENTER', () => {
                this.scene.start('Overworld');
            });
        }
    }
}
class BootScene extends Phaser.Scene {
    constructor() {
        super('Boot');
    }

    preload() {
        // Generate textures programmatically (no external files needed)
        this.createTileTextures();
    }

    createTileTextures() {
        const tileSize = 16;

        // Wall
        this.createRectTexture('W', tileSize, tileSize, '#27272a', '#18181b');
        // Floor
        this.createRectTexture('.', tileSize, tileSize, '#fafaf9');
        // Help Desk
        this.createRectTexture('H', tileSize, tileSize, '#1e3a8a');
        // Kitchenette
        this.createRectTexture('K', tileSize, tileSize, '#065f46');
        // Bookshelf
        this.createRectTexture('S', tileSize, tileSize, '#7c2d12');
        // Study door
        this.createRectTexture('D', tileSize, tileSize, '#78350f');
        // Trainer
        this.createRectTexture('T', tileSize, tileSize, '#fafaf9');
        // Vending
        this.createRectTexture('V', tileSize, tileSize, '#6b21a8');
        // Cafe
        this.createRectTexture('C', tileSize, tileSize, '#9a3412');
        // Staircase
        this.createRectTexture('E', tileSize, tileSize, '#71717a');
        // Terminal
        this.createRectTexture('L', tileSize, tileSize, '#d4a574');
        // Barrier (locked)
        this.createRectTexture('B', tileSize, tileSize, '#7f1d1d');
        // Goal
        this.createRectTexture('X', tileSize, tileSize, '#fafaf9');
        // Gym
        this.createRectTexture('G', tileSize, tileSize, '#4a1e1e');
        // Spin tiles (will draw arrows dynamically, but base)
        this.createRectTexture('P>', tileSize, tileSize, '#0ea5e9');
        this.createRectTexture('P<', tileSize, tileSize, '#0ea5e9');
        this.createRectTexture('P^', tileSize, tileSize, '#0ea5e9');
        this.createRectTexture('Pv', tileSize, tileSize, '#0ea5e9');

        // Player sprite (simple blue circle with cap)
        const playerGraphics = this.add.graphics();
        playerGraphics.fillStyle(0x2563eb);
        playerGraphics.fillCircle(8, 10, 5.5);
        playerGraphics.fillStyle(0xfed7aa);
        playerGraphics.fillCircle(8, 6, 3.5);
        playerGraphics.generateTexture('player', 16, 16);
        playerGraphics.destroy();
    }

    createRectTexture(key, w, h, fillColor, strokeColor = null) {
        const gfx = this.add.graphics();
        gfx.fillStyle(Phaser.Display.Color.HexStringToColor(fillColor).color);
        gfx.fillRect(0, 0, w, h);
        if (strokeColor) {
            gfx.lineStyle(1, Phaser.Display.Color.HexStringToColor(strokeColor).color, 1);
            gfx.strokeRect(0, 0, w, h);
        }
        gfx.generateTexture(key, w, h);
        gfx.destroy();
    }

    create() {
        this.scene.start('Overworld');
    }
}
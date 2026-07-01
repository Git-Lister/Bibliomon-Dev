// js/main.js

const config = {
    type: Phaser.AUTO,
    width: 640,
    height: 480,
    parent: 'game-container',
    pixelArt: true,
    backgroundColor: '#1a1a1a',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: [BootScene, TitleScene, OverworldScene, BattleScene, MenuScene, DialogueScene]
};

// --- Save / Load using the new state instance ---
window.saveGameData = function() {
    if (window.gameStateInstance) {
        return window.gameStateInstance.save();
    }
    console.warn('GameState instance not available');
    return false;
};

window.loadGameData = function() {
    if (window.gameStateInstance) {
        // The instance already loaded from storage; just update the data reference
        window.gameState = window.gameStateInstance.getState();
        return true;
    }
    return false;
};

// Auto-save on page unload
window.addEventListener('beforeunload', () => {
    if (window.gameStateInstance) {
        window.gameStateInstance.save();
    }
});

// Launch the game
const game = new Phaser.Game(config);
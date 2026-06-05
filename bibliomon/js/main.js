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
            gravity: { y: 0 },       // top-down RPG – no gravity needed
            debug: false              // set to true if you need to see hitboxes
        }
    },
    scene: [BootScene, OverworldScene, BattleScene, MenuScene]
};

window.saveGameData = function() {
    const state = window.gameState;
    const data = {
        currentMap: state.currentMap,
        playerPos: state.playerPos,
        backpack: state.backpack,
        libraryAccount: state.libraryAccount,
        items: state.items,
        defeatedTrainers: state.defeatedTrainers,
        puzzleSolved: state.puzzleSolved,
        gym1Defeated: state.gym1Defeated,
        badges: state.badges
    };
    localStorage.setItem('bibliomon_save', JSON.stringify(data));
    console.log('Game saved.');
};

const game = new Phaser.Game(config);

// Global state
window.gameState = {
    mode: 'walk',           // 'walk', 'battle', 'menu', 'text', 'account', 'load_prompt'
    currentMap: 'ground',
    playerPos: { x: 0, y: 0 },
    facing: 'down',
    backpack: [],
    libraryAccount: [],
    items: [
        { itemId: 'potion', qty: 3 },
        { itemId: 'super_potion', qty: 1 },
        { itemId: 'awakening', qty: 1 },
        { itemId: 'antidote', qty: 1 },
        { itemId: 'bookmark_item', qty: 1 }
    ],
    activeBookIndex: 0,
    battle: null,
    defeatedTrainers: [],
    puzzleSolved: false,
    inputLocked: false,
    gym1Defeated: false,
    badges: [],
    gymState: null,
    overworldMessage: '',
    pauseSelection: 0,
    pauseSubMode: 'main',
    loadSelection: 0,
    accountSelectZone: 'backpack',
    accountSelectedIndex: 0,
    startTime: Date.now(),
    savedPlayTime: 0
};
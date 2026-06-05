const config = {
    type: Phaser.AUTO,
    width: 640,
    height: 480,
    parent: 'game-container',
    pixelArt: true,
    backgroundColor: '#1a1a1a',
    scene: [BootScene, OverworldScene, BattleScene, MenuScene]
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
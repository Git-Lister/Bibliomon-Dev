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
    scene: [BootScene, OverworldScene, BattleScene, MenuScene, DialogueScene]
};

window.saveGameData = function() {
    const state = window.gameState;
    const data = {
        currentMap: state.currentMap,
        player: {
            tileX: state.player.tileX,
            tileY: state.player.tileY,
            facing: state.player.facing
        },
        backpack: state.backpack,
        trainerMap: {},
        introCompleted: false,
        introCompleted: state.introCompleted,
        cardValidated: state.cardValidated,
        libraryAccount: state.libraryAccount,
        items: state.items,
        credits: state.credits,
        hiddenItems: state.hiddenItems,
        collectedItems: state.collectedItems,
        defeatedTrainers: state.defeatedTrainers,
        puzzleSolved: state.puzzleSolved,
        gym1Defeated: state.gym1Defeated,
        badges: state.badges
    };
    localStorage.setItem('bibliomon_save', JSON.stringify(data));
    console.log('Game saved.');
};

window.loadGameData = function() {
    const raw = localStorage.getItem('bibliomon_save');
    if (!raw) return false;
    try {
        const saved = JSON.parse(raw);
        const state = window.gameState;
        state.currentMap = saved.currentMap || 'ground';
        state.player.tileX = saved.player?.tileX || 19;
        state.player.tileY = saved.player?.tileY || 29;
        state.player.facing = saved.player?.facing || 'down';
        state.backpack = saved.backpack || [];
        introCompleted: false,
        state.introCompleted = saved.introCompleted || false;
        state.cardValidated = saved.cardValidated || false;
        state.libraryAccount = saved.libraryAccount || [];
        state.items = saved.items || [];
        state.credits = saved.credits || 100;
        state.hiddenItems = saved.hiddenItems || [];
        state.collectedItems = saved.collectedItems || [];
        state.defeatedTrainers = saved.defeatedTrainers || [];
        state.puzzleSolved = saved.puzzleSolved || false;
        state.gym1Defeated = saved.gym1Defeated || false;
        state.badges = saved.badges || [];
        return true;
    } catch (e) {
        console.error('Save load error:', e);
        return false;
    }
};

const game = new Phaser.Game(config);

// Global game state
window.gameState = {
    mode: 'walk',
    currentMap: 'ground',
    player: {
        tileX: 19,
        tileY: 29,
        facing: 'down',
        isMoving: false,
        moveTween: null
    },
    backpack: [],
    credits: 100, 
    collectedItems: [],
    hasLoadedSave: false,
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
    introCompleted: false,
    cardValidated: false,
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
    savedPlayTime: 0,
    trainerMap: {},
hiddenItems: [
    { x: 30, y: 24, itemId: 'potion', qty: 1 },    // near ornament at row24 col30
    { x: 3,  y: 26, itemId: 'antidote', qty: 1 },   // near ornament at row26 col3
    { x: 28, y: 11, itemId: 'awakening', qty: 1 }   // near ornament at row11 col28
]
};
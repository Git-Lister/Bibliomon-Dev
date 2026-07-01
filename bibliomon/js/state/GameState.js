// js/state/GameState.js
// Plain script – no modules

class GameState {
    constructor() {
        this._data = null;
        this._listeners = [];
    }

    init() {
        this._data = {
            player: {
                tileX: 19,
                tileY: 29,
                facing: 'down',
                isMoving: false,
                moveTween: null
            },
            backpack: [],
            libraryAccount: [],
            items: [
                { itemId: 'potion', qty: 3 },
                { itemId: 'super_potion', qty: 1 },
                { itemId: 'awakening', qty: 1 },
                { itemId: 'antidote', qty: 1 },
                { itemId: 'bookmark_item', qty: 1 }
            ],
            credits: 100,
            badges: [],
            defeatedTrainers: [],
            puzzleSolved: false,
            gym1Defeated: false,
            cardValidated: false,
            introCompleted: false,
            mode: 'walk',
            inputLocked: false,
            currentMap: 'ground',
            collectedItems: [],
            hiddenItems: [
                { x: 30, y: 24, itemId: 'potion', qty: 1 },
                { x: 3,  y: 26, itemId: 'antidote', qty: 1 },
                { x: 28, y: 11, itemId: 'awakening', qty: 1 }
            ],
            battle: null,
            gymState: null,
            pauseSelection: 0,
            pauseSubMode: 'main',
            loadSelection: 0,
            accountSelectZone: 'backpack',
            accountSelectedIndex: 0,
            startTime: Date.now(),
            savedPlayTime: 0,
            trainerMap: {},
            playerName: '',
            rivalName: '',
            overworldMessage: '',
            activeBookIndex: 0,
        };
        return this;
    }

    // Deep merge for loading
    load(saveData) {
        if (!saveData) return this;
        this._data = this._deepMerge(this._data, saveData);
        return this;
    }

    _deepMerge(target, source) {
        const result = { ...target };
        for (const key in source) {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                result[key] = this._deepMerge(target[key] || {}, source[key]);
            } else {
                result[key] = source[key];
            }
        }
        return result;
    }

    getState() { return this._data; }

    get(path) {
        return path.split('.').reduce((obj, key) => obj && obj[key], this._data);
    }

    set(path, value) {
        const keys = path.split('.');
        const lastKey = keys.pop();
        const target = keys.reduce((obj, key) => {
            if (!obj[key]) obj[key] = {};
            return obj[key];
        }, this._data);
        const old = target[lastKey];
        target[lastKey] = value;
        this._listeners.forEach(fn => fn(path, value, old));
        return this;
    }

    onChange(fn) {
        this._listeners.push(fn);
        return () => this._listeners = this._listeners.filter(f => f !== fn);
    }

    save() {
        try {
            localStorage.setItem('bibliomon_save', JSON.stringify(this._data));
            return true;
        } catch (e) {
            console.error('Save failed:', e);
            return false;
        }
    }

    static loadFromStorage() {
        try {
            const raw = localStorage.getItem('bibliomon_save');
            if (raw) {
                const data = JSON.parse(raw);
                return new GameState().init().load(data);
            }
        } catch (e) {
            console.error('Load failed:', e);
        }
        return new GameState().init();
    }
}

// --- Singleton ---
const gameStateInstance = GameState.loadFromStorage();
const gameStateData = gameStateInstance.getState();

// Expose globally
window.gameState = gameStateData;
window.gameStateInstance = gameStateInstance;

console.log('GameState initialised.');
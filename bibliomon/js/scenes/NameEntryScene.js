// js/scenes/NameEntryScene.js
// DOM-based name entry – works even if Phaser rendering is broken

class NameEntryScene extends Phaser.Scene {
    constructor() {
        super('NameEntry');
        this.callback = null;
        this.inputElement = null;
        this.overlay = null;
        this.step = 'player';
    }

    create(data) {
        console.log('NameEntryScene.create() called with:', data); // DEBUG

        this.callback = data.callback || null;
        this.step = data.step || 'player';

        // Determine prompt text
        let promptText = 'Enter your name:';
        if (this.step === 'rival') {
            promptText = 'Enter your rival\'s name:';
        } else if (this.step === 'player') {
            promptText = 'Enter your name:';
        }

        // Create DOM overlay
        this.overlay = document.createElement('div');
        this.overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.85);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 9999;
            font-family: 'Courier New', monospace;
        `;

        // Label
        const label = document.createElement('div');
        label.textContent = promptText;
        label.style.cssText = `
            color: #ffffff;
            font-size: 24px;
            margin-bottom: 20px;
            text-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
        `;
        this.overlay.appendChild(label);

        // Input field
        this.inputElement = document.createElement('input');
        this.inputElement.type = 'text';
        this.inputElement.style.cssText = `
            padding: 12px 20px;
            font-size: 20px;
            width: 320px;
            max-width: 80vw;
            border: 2px solid #ffd700;
            background: #1a1a1a;
            color: #ffd700;
            font-family: 'Courier New', monospace;
            text-align: center;
            border-radius: 4px;
            outline: none;
        `;
        this.inputElement.autofocus = true;
        this.inputElement.maxLength = 12;
        this.overlay.appendChild(this.inputElement);

        // Enter button
        const enterBtn = document.createElement('button');
        enterBtn.textContent = '✓ ENTER';
        enterBtn.style.cssText = `
            margin-top: 20px;
            padding: 10px 40px;
            font-size: 18px;
            background: #ffd700;
            color: #000000;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-family: 'Courier New', monospace;
            font-weight: bold;
            transition: background 0.2s;
        `;
        enterBtn.onmouseover = () => { enterBtn.style.background = '#ffed4a'; };
        enterBtn.onmouseout = () => { enterBtn.style.background = '#ffd700'; };
        this.overlay.appendChild(enterBtn);

        // Append to body
        document.body.appendChild(this.overlay);

        // Focus the input
        setTimeout(() => {
            if (this.inputElement) {
                this.inputElement.focus();
            }
        }, 100);

        // --- Event handlers ---
        const finish = () => {
            const name = this.inputElement.value.trim() || (this.step === 'rival' ? 'Rival' : 'Player');
            console.log('NameEntryScene finishing with name:', name); // DEBUG

            // Clean up DOM
            if (this.overlay && this.overlay.parentNode) {
                document.body.removeChild(this.overlay);
            }
            this.overlay = null;
            this.inputElement = null;

            // Call the callback
            if (this.callback) {
                this.callback(name);
            }

            // Resume Overworld
            const overworld = this.scene.get('Overworld');
            if (overworld) {
                overworld.scene.resume();
            }

            // Stop this scene
            this.scene.stop();
        };

        // Keyboard: Enter key
        this.inputElement.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                finish();
            }
        });

        // Button click
        enterBtn.addEventListener('click', () => {
            finish();
        });

        // Click outside the input – keep focus
        document.addEventListener('click', () => {
            if (this.inputElement) {
                this.inputElement.focus();
            }
        });

        // Store for cleanup
        this._finish = finish;
    }

    // Cleanup if scene is stopped unexpectedly
    shutdown() {
        if (this.overlay && this.overlay.parentNode) {
            document.body.removeChild(this.overlay);
        }
        this.overlay = null;
        this.inputElement = null;
    }
}
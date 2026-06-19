class NameEntryScene extends Phaser.Scene {
    constructor() {
        super('NameEntry');
    }

    init(data) {
        this.step = data.step || 'player';      // 'player' or 'rival'
        this.callback = data.callback || null;   // called with the entered name
        this.name = '';
    }

    create() {
        this.cameras.main.setBackgroundColor('#1a1a1a');

        this.prompt = this.add.text(320, 200, '', {
            fontFamily: 'monospace', fontSize: '14px', fill: '#ffffff',
            wordWrap: { width: 500 }, align: 'center'
        }).setOrigin(0.5);

        this.nameDisplay = this.add.text(320, 260, '', {
            fontFamily: 'monospace', fontSize: '18px', fill: '#ffcc00',
            align: 'center'
        }).setOrigin(0.5);

        this.instruction = this.add.text(320, 320, 'Press ENTER when done, BACKSPACE to erase.', {
            fontFamily: 'monospace', fontSize: '10px', fill: '#888888'
        }).setOrigin(0.5);

        this.updatePrompt();

        // Capture every printable key – NO addKey calls for WASD here
        this.input.keyboard.on('keydown', (event) => {
            if (event.key === 'Enter') {
                if (this.name.length > 0) {
                    this.confirmName();
                }
            } else if (event.key === 'Backspace') {
                this.name = this.name.slice(0, -1);
            } else if (event.key.length === 1 && this.name.length < 12) {
                this.name += event.key;
            }
            this.nameDisplay.setText(this.name);
        });
    }

    updatePrompt() {
        if (this.step === 'player') {
            this.prompt.setText('Welcome to the Library!\nWhat\'s your name?');
        } else {
            this.prompt.setText('What\'s your rival\'s name?');
        }
    }

    confirmName() {
        const cb = this.callback;
        const name = this.name;
        this.scene.stop();                       // cleanly remove this scene
        setTimeout(() => { if (cb) cb(name); }, 0);  // let Phaser finish cleanup
    }
}
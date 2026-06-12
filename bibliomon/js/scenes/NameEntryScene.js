class NameEntryScene extends Phaser.Scene {
    constructor() {
        super('NameEntry');
    }

    init(data) {
        this.step = 'player';   // 'player' or 'rival'
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

        this.input.keyboard.on('keydown', (event) => {
            if (event.key === 'Enter') {
                if (this.name.length > 0) {
                    this.confirmName();
                }
            } else if (event.key === 'Backspace') {
                this.name = this.name.slice(0, -1);
            } else if (event.key.length === 1 && this.name.length < 12) {
                // Accept only printable characters
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
        if (this.step === 'player') {
            window.gameState.playerName = this.name;
            this.step = 'rival';
            this.name = '';
            this.nameDisplay.setText('');
            this.updatePrompt();
        } else {
            window.gameState.rivalName = this.name;
            // Done – go to the overworld
            this.scene.start('Overworld');
        }
    }
}
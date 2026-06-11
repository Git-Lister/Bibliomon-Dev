class DialogueScene extends Phaser.Scene {
    constructor() {
        super('Dialogue');
    }

    init(data) {
        this.text       = data.text || '';
        this.callback   = data.callback || null;   // normal finish callback
        this.choices    = data.choices || null;     // e.g. ['Yes', 'No']
        this.choiceCallback = data.choiceCallback || null;   // called with 'yes'/'no'
        this.charIndex  = 0;
        this.charDelay  = 40;
        this.nextLine   = false;
        this.selected   = 0;
        this.choiceTexts = [];
    }

    create() {
        this.bg = this.add.rectangle(320, 240, 640, 480, 0x000000, 0.3).setOrigin(0.5);

        const boxX = 20;
        const boxW = 600;
        const lineH = 20;            // height of one choice line
        const baseH = 90;            // space for the message text + padding
        const choicesCount = this.choices ? this.choices.length : 0;
        const choicesH = choicesCount * lineH;
        const boxH = baseH + choicesH + 20;
        const boxY = 480 - boxH - 10;   // always at the bottom

        // Outer border (white)
        const outer = this.add.graphics();
        outer.lineStyle(2, 0xffffff, 1);
        outer.strokeRect(boxX, boxY, boxW, boxH);

        // Inner border
        const inner = this.add.graphics();
        inner.lineStyle(1, 0x888888, 1);
        inner.strokeRect(boxX + 4, boxY + 4, boxW - 8, boxH - 8);

        // Fill
        const fill = this.add.graphics();
        fill.fillStyle(0x000000, 0.9);
        fill.fillRect(boxX + 5, boxY + 5, boxW - 10, boxH - 10);

        // Main dialogue text
        this.dialogueText = this.add.text(boxX + 12, boxY + 12, '', {
            fontFamily: 'monospace', fontSize: '12px', fill: '#ffffff',
            wordWrap: { width: boxW - 24 }
        });

        this.cursor = this.add.text(boxX + boxW - 20, boxY + boxH - 20, '▼', {
            fontFamily: 'monospace', fontSize: '12px', fill: '#ffffff'
        }).setVisible(false);

        // Choice texts (if any)
        if (this.choices) {
            this.choiceTexts = this.choices.map((c, i) => {
                const txt = this.add.text(boxX + 20, boxY + 50 + i * lineH,
                    (i === 0 ? '▶ ' : '  ') + c,
                    { fontFamily: 'monospace', fontSize: '12px', fill: '#ffffff' });
                txt.setVisible(false);
                return txt;
            });
        }

        this.typeNextChar();

        // Input handling (unchanged – keep your existing keyboard events)
        this.input.keyboard.on('keydown-SPACE', () => this.onConfirm());
        this.input.keyboard.on('keydown-ENTER', () => this.onConfirm());
        this.input.keyboard.on('keydown-ESC',  () => this.onConfirm());
        this.input.keyboard.on('keydown-UP',   () => this.changeChoice(-1));
        this.input.keyboard.on('keydown-DOWN', () => this.changeChoice(1));
        this.input.on('pointerdown', () => this.onConfirm());
    }

    typeNextChar() {
        if (this.charIndex < this.text.length) {
            this.dialogueText.setText(this.text.substring(0, this.charIndex + 1));
            this.charIndex++;
            this.time.delayedCall(this.charDelay, () => this.typeNextChar());
        } else {
            this.cursor.setVisible(true);
            this.tweens.add({
                targets: this.cursor, alpha: 0, duration: 300, yoyo: true, repeat: -1
            });
            this.nextLine = true;
            // Show choices if they exist
            if (this.choices) {
                this.choiceTexts.forEach(t => t.setVisible(true));
            }
        }
    }

    changeChoice(delta) {
        if (!this.choices || !this.nextLine) return;
        this.selected = (this.selected + delta + this.choices.length) % this.choices.length;
        this.choiceTexts.forEach((t, i) => {
            t.setText((i === this.selected ? '▶ ' : '  ') + this.choices[i]);
        });
    }

    onConfirm() {
        if (!this.nextLine) {
            // Skip typewriter
            this.dialogueText.setText(this.text);
            this.charIndex = this.text.length;
            this.cursor.setVisible(true);
            this.nextLine = true;
            if (this.choices) this.choiceTexts.forEach(t => t.setVisible(true));
            return;
        }

        // If a choice menu is active, execute the selected choice
        if (this.choices && this.choiceCallback) {
            const choice = this.choices[this.selected].toLowerCase();
            this.scene.resume('Overworld');
            this.scene.stop();
            setTimeout(() => this.choiceCallback(choice), 0);
            return;
        }

        // No choices – just close
        this.scene.resume('Overworld');
        this.scene.stop();
        if (this.callback) {
            setTimeout(() => this.callback(), 0);
        }
    }
}
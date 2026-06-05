class DialogueScene extends Phaser.Scene {
    constructor() {
        super('Dialogue');
    }

    init(data) {
        this.text      = data.text || '';
        this.callback  = data.callback || null;  // function to call after dialogue closes
        this.charIndex = 0;
        this.charDelay = 40;   // ms between characters
        this.nextLine  = false;
    }

    create() {
        // Dim background slightly (optional)
        this.bg = this.add.rectangle(320, 240, 640, 480, 0x000000, 0.3).setOrigin(0.5);

        // Dialogueue box area (bottom portion)
        const boxX = 20;
        const boxY = 330;
        const boxW = 600;
        const boxH = 130;

        // Outer border (white)
        const outer = this.add.graphics();
        outer.lineStyle(2, 0xffffff, 1);
        outer.strokeRect(boxX, boxY, boxW, boxH);

        // Inner border (darker)
        const inner = this.add.graphics();
        inner.lineStyle(1, 0x888888, 1);
        inner.strokeRect(boxX + 4, boxY + 4, boxW - 8, boxH - 8);

        // Fill background
        const fill = this.add.graphics();
        fill.fillStyle(0x000000, 0.9);
        fill.fillRect(boxX + 5, boxY + 5, boxW - 10, boxH - 10);

        // Text object
        this.dialogueText = this.add.text(boxX + 12, boxY + 12, '', {
            fontFamily: 'monospace',
            fontSize: '12px',
            fill: '#ffffff',
            wordWrap: { width: boxW - 24 }
        });

        // Triangle cursor (hidden until text fully drawn)
        this.cursor = this.add.text(boxX + boxW - 20, boxY + boxH - 20, '▼', {
            fontFamily: 'monospace',
            fontSize: '12px',
            fill: '#ffffff'
        }).setVisible(false);

        // Start typewriter
        this.typeNextChar();

        // Input to advance or close
        this.input.keyboard.on('keydown-SPACE', () => this.onConfirm());
        this.input.keyboard.on('keydown-ENTER', () => this.onConfirm());
        this.input.keyboard.on('keydown-ESC', () => this.onConfirm());
        // Also allow click/tap
        this.input.on('pointerdown', () => this.onConfirm());
    }

    typeNextChar() {
        if (this.charIndex < this.text.length) {
            this.dialogueText.setText(this.text.substring(0, this.charIndex + 1));
            this.charIndex++;
            this.time.delayedCall(this.charDelay, () => this.typeNextChar());
        } else {
            // Text finished – show cursor and blink it
            this.cursor.setVisible(true);
            this.tweens.add({
                targets: this.cursor,
                alpha: 0,
                duration: 300,
                yoyo: true,
                repeat: -1
            });
            this.nextLine = true;
        }
    }

    onConfirm() {
        if (!this.nextLine) {
            // Skip animation – show full text instantly
            this.dialogueText.setText(this.text);
            this.charIndex = this.text.length;
            this.cursor.setVisible(true);
            this.nextLine = true;
            return;
        }

        // Close dialogue
        if (this.callback) {
            this.callback();
        }
        this.scene.resume('Overworld');
        this.scene.stop();
    }
}
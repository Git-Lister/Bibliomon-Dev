// js/scenes/DialogueScene.js

class DialogueScene extends Phaser.Scene {
    constructor() {
        super('Dialogue');
        this.isActive = false;
        this.callback = null;
        this.choiceCallback = null;
        this.text = '';
        this.speaker = '';
        this.choices = null;
        this.selectedChoice = 0;
        this.choiceTexts = [];
        this.typewriterTimer = null;
        this.fullText = '';
        this.displayedText = '';
        this.typingComplete = false;
        this.container = null;
        this.bg = null;
        this.box = null;
        this.dialogueText = null;
        this.speakerText = null;
        this.cursor = null;
        this.choiceContainer = null;
    }

    create(data) {
        // Store data
        this.text = data.text || '';
        this.speaker = data.speaker || '';
        this.choices = data.choices || null;
        this.callback = data.callback || null;
        this.choiceCallback = data.choiceCallback || null;
        this.selectedChoice = 0;
        this.typingComplete = false;

        // Pause the calling scene (assumed to be Overworld)
        const callingScene = this.scene.get('Overworld');
        if (callingScene && callingScene.scene.isActive()) {
            callingScene.scene.pause();
        }

        // Build UI
        this.buildUI();

        // Start typewriter effect
        this.startTyping();

        // Set up input
        this.input.on('pointerdown', this.handleClick, this);
        this.input.keyboard.on('keydown', this.handleKey, this);

        this.isActive = true;
    }

    buildUI() {
        const W = this.cameras.main.width;
        const H = this.cameras.main.height;

        // Dark overlay
        this.bg = this.add.graphics();
        this.bg.fillStyle(0x000000, 0.7);
        this.bg.fillRect(0, 0, W, H);
        this.bg.setDepth(100);

        // Dialogue box
        this.box = this.add.graphics();
        this.box.fillStyle(0xffffff, 1);
        const boxX = 40, boxY = H - 180;
        const boxW = W - 80, boxH = 140;
        this.box.fillRoundedRect(boxX, boxY, boxW, boxH, 10);
        this.box.setDepth(101);

        // Speaker name (if any)
        let speakerY = boxY + 20;
        if (this.speaker) {
            this.speakerText = this.add.text(boxX + 20, speakerY, this.speaker, {
                fontSize: '16px',
                fill: '#333',
                fontStyle: 'bold',
                fontFamily: 'monospace'
            }).setDepth(102);
            speakerY += 30;
        }

        // Dialogue text (typewriter)
        this.dialogueText = this.add.text(boxX + 20, speakerY, '', {
            fontSize: '16px',
            fill: '#333',
            wordWrap: { width: boxW - 40 },
            fontFamily: 'monospace'
        }).setDepth(102);

        // Choices container (initially hidden)
        this.choiceContainer = this.add.container(boxX + 20, boxY + boxH - 50).setDepth(102);
        this.choiceContainer.setVisible(false);
        this.choiceTexts = [];

        // Cursor indicator (blinking)
        this.cursor = this.add.text(boxX + 20, speakerY, '|', {
            fontSize: '16px',
            fill: '#333',
            fontFamily: 'monospace'
        }).setDepth(102);
        this.cursor.setVisible(false);
    }

    startTyping() {
        this.fullText = this.text;
        this.displayedText = '';
        this.typingComplete = false;
        this.dialogueText.setText('');
        this.cursor.setVisible(true);

        let index = 0;
        const speed = 30; // ms per character

        this.typewriterTimer = this.time.addEvent({
            delay: speed,
            callback: () => {
                if (index < this.fullText.length) {
                    this.displayedText += this.fullText[index];
                    this.dialogueText.setText(this.displayedText);
                    index++;
                    // Update cursor position
                    const bounds = this.dialogueText.getBounds();
                    this.cursor.setPosition(bounds.right + 2, bounds.top);
                } else {
                    this.typingComplete = true;
                    this.cursor.setVisible(false);
                    if (this.typewriterTimer) {
                        this.typewriterTimer.remove();
                        this.typewriterTimer = null;
                    }
                    // Show choices if any
                    if (this.choices && this.choices.length > 0) {
                        this.showChoices();
                    }
                }
            },
            repeat: -1
        });
    }

    showChoices() {
        this.choiceContainer.setVisible(true);
        this.choiceTexts = [];
        this.choices.forEach((choice, index) => {
            const text = this.add.text(0, index * 30, `${index+1}. ${choice}`, {
                fontSize: '16px',
                fill: '#333',
                fontFamily: 'monospace'
            }).setDepth(103);
            text.setInteractive({ useHandCursor: true });
            text.on('pointerdown', () => this.selectChoice(index));
            this.choiceContainer.add(text);
            this.choiceTexts.push(text);
        });
        this.highlightChoice(0);
    }

    highlightChoice(index) {
        this.choiceTexts.forEach((t, i) => {
            t.setFill(i === index ? '#ff0000' : '#333');
        });
        this.selectedChoice = index;
    }

    selectChoice(index) {
        if (index < 0 || index >= this.choices.length) return;
        const choiceText = this.choices[index];
        if (this.choiceCallback) {
            this.choiceCallback(choiceText);
        }
        this.closeDialogue();
    }

    handleClick(pointer) {
        if (!this.isActive) return;
        if (!this.typingComplete) {
            this.skipTyping();
            return;
        }
        // If choices are shown, clicking on a choice is handled by the choice text itself
        if (!this.choices || this.choices.length === 0) {
            this.closeDialogue();
        }
    }

    handleKey(event) {
        if (!this.isActive) return;
        const key = event.key;

        if (key === ' ' || key === 'Enter') {
            if (!this.typingComplete) {
                this.skipTyping();
                return;
            }
            if (this.choices && this.choices.length > 0) {
                this.selectChoice(this.selectedChoice);
                return;
            }
            this.closeDialogue();
        } else if (key === 'ArrowUp' && this.choices && this.choices.length > 0) {
            this.selectedChoice = (this.selectedChoice - 1 + this.choices.length) % this.choices.length;
            this.highlightChoice(this.selectedChoice);
            event.preventDefault();
        } else if (key === 'ArrowDown' && this.choices && this.choices.length > 0) {
            this.selectedChoice = (this.selectedChoice + 1) % this.choices.length;
            this.highlightChoice(this.selectedChoice);
            event.preventDefault();
        } else if (key.match(/^[1-9]$/) && this.choices && this.choices.length > 0) {
            const num = parseInt(key) - 1;
            if (num < this.choices.length) {
                this.selectChoice(num);
            }
        }
    }

    skipTyping() {
        if (this.typewriterTimer) {
            this.typewriterTimer.remove();
            this.typewriterTimer = null;
        }
        this.displayedText = this.fullText;
        this.dialogueText.setText(this.displayedText);
        this.typingComplete = true;
        this.cursor.setVisible(false);
        if (this.choices && this.choices.length > 0) {
            this.showChoices();
        }
    }

    closeDialogue() {
        this.isActive = false;
        // Clean up timer
        if (this.typewriterTimer) {
            this.typewriterTimer.remove();
            this.typewriterTimer = null;
        }
        // Call callback
        if (this.callback) {
            this.callback();
        }
        // Resume the calling scene (Overworld)
        const callingScene = this.scene.get('Overworld');
        if (callingScene) {
            callingScene.scene.resume();
        }
        // Stop this scene
        this.scene.stop();
    }

    update() {
        // Keep active flag true
        this.isActive = true;
    }
}